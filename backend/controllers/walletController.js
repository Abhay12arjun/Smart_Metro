const crypto = require("crypto");
const https = require("https");
const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (
    !keyId ||
    !keySecret ||
    keyId.includes("your_key_id") ||
    keySecret.includes("your_razorpay_key_secret")
  ) {
    const error = new Error("Razorpay keys are not configured in backend/.env");
    error.statusCode = 400;
    throw error;
  }

  return { keyId, keySecret };
};

const parseRazorpayResponse = (body) => {
  try {
    return body ? JSON.parse(body) : {};
  } catch (error) {
    return {
      error: {
        description: body || "Invalid response from Razorpay"
      }
    };
  }
};

const createRazorpayOrder = ({ amount, currency, receipt }) => {
  const { keyId, keySecret } = getRazorpayConfig();
  const payload = JSON.stringify({
    amount,
    currency,
    receipt,
    payment_capture: 1
  });

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.razorpay.com",
        path: "/v1/orders",
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload)
        }
      },
      (res) => {
        let body = "";

        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          const parsed = parseRazorpayResponse(body);

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
            return;
          }

          const error = new Error(parsed.error?.description || "Unable to create Razorpay order");
          error.statusCode = res.statusCode === 401 ? 400 : 502;
          reject(error);
        });
      }
    );

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
};

exports.createWalletOrder = async (req, res) => {
  try {
    const amount = Math.round(Number(req.body.amount));

    if (!amount || amount < 1) {
      return res.status(400).json({ message: "Enter a valid amount" });
    }

    if (amount > 10000) {
      return res.status(400).json({ message: "Maximum wallet top-up is ₹10000" });
    }

    const amountInPaise = amount * 100;
    const userSuffix = String(req.user._id).slice(-8);
    const timeSuffix = Date.now().toString(36);
    const receipt = `w_${userSuffix}_${timeSuffix}`;
    const order = await createRazorpayOrder({
      amount: amountInPaise,
      currency: "INR",
      receipt
    });

    await WalletTransaction.create({
      user: req.user._id,
      amount,
      razorpayOrderId: order.id
    });

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      walletAmount: amount
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.verifyWalletPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Payment verification details are required" });
    }

    const { keySecret } = getRazorpayConfig();
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const transaction = await WalletTransaction.findOne({
      user: req.user._id,
      razorpayOrderId: razorpay_order_id
    });

    if (!transaction) {
      return res.status(404).json({ message: "Wallet transaction not found" });
    }

    if (transaction.status === "paid") {
      const existingUser = await User.findById(req.user._id).select("-password");
      return res.json({
        message: "Payment already verified",
        walletBalance: existingUser.walletBalance,
        user: existingUser
      });
    }

    transaction.status = "paid";
    transaction.razorpayPaymentId = razorpay_payment_id;
    await transaction.save();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: transaction.amount } },
      { new: true }
    ).select("-password");

    res.json({
      message: "Wallet updated successfully",
      walletBalance: user.walletBalance,
      user
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
