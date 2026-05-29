# Smart Metro Pro - Quick Start Guide

## Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

---

## Installation & Setup

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create admin user (run once)
node admin/registerAdmin.js

# Start server
npm start
```

**Expected Output:**
```
Server running on port 5000
```

### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
```

---

## Access & Testing

### URLs
| Function | URL |
|----------|-----|
| Passenger Home | http://localhost:5173 |
| Passenger Login | http://localhost:5173/login |
| Passenger Register | http://localhost:5173/register |
| Admin Login | http://localhost:5173/admin-login |
| Backend API | http://localhost:5000/api |

### Credentials

**Admin Account (Auto-created):**
```
Email: admin@example.com
Password: admin123
```

**Create Passenger Account:**
- Go to Register page
- Fill in name, email, password
- Submit to create account

---

## Testing Workflow

### Test 1: Admin Dashboard
1. Open http://localhost:5173/admin-login
2. Login with admin credentials
3. You'll see:
   - Dashboard stats (Passengers, Trains, Tickets, Revenue)
   - Analytics chart
   - Add Train form
   - All trains management

### Test 2: Add a Train
1. On Admin Dashboard, fill in:
   - Train Name: "Express Metro"
   - Train Number: "M001"
   - Source: "Central Station"
   - Destination: "North Station"
2. Click "Add Train"
3. Train appears in the list below

### Test 3: Passenger Registration & Ticket Booking
1. Open http://localhost:5173/register
2. Register with credentials:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Password: "password123"
3. Logged in automatically
4. Go to "Book Ticket"
5. Fill booking form:
   - Source: "Central Station"
   - Destination: "North Station"
   - Fare: 50
6. Click "Book Ticket"
7. Check:
   - Wallet balance decreases by 50
   - Ticket appears in dashboard

### Test 4: Cancel Ticket
1. On Passenger Dashboard
2. Find the ticket
3. Click "Cancel"
4. Confirm cancellation
5. Check:
   - Ticket status changes to "Cancelled"
   - Payment status changes to "Refunded"
   - Wallet balance increases by 50

---

## Key Features to Test

### Admin Panel
- ✅ View dashboard statistics
- ✅ Add new trains
- ✅ Update train status (Running/Stopped/Delayed)
- ✅ Delete trains
- ✅ Real-time updates

### Passenger Account
- ✅ Register new account
- ✅ Login with email/password
- ✅ View personal dashboard
- ✅ Book ticket (with wallet balance check)
- ✅ Cancel ticket (with refund)
- ✅ View ticket history with details
- ✅ Wallet balance management

---

## Troubleshooting

### Issue: Backend won't start
- ✅ Check MongoDB connection: Verify `MONGO_URI` in `.env`
- ✅ Check port: Ensure port 5000 is free
- ✅ Install dependencies: Run `npm install`

### Issue: Frontend won't load
- ✅ Check Node version: `node --version` (should be v14+)
- ✅ Clear cache: Delete `node_modules` and run `npm install` again
- ✅ Check port: Ensure port 5173 is free

### Issue: "Cannot connect to API"
- ✅ Ensure backend is running: Check http://localhost:5000
- ✅ Check CORS: Verify `CLIENT_URL` in backend `.env`
- ✅ Check API URL: Verify `VITE_API_URL` in frontend `.env`

### Issue: Wallet not updating after ticket booking
- ✅ Check browser console for errors
- ✅ Ensure user is logged in
- ✅ Verify wallet balance is sufficient
- ✅ Check backend logs for errors

### Issue: Admin login doesn't work
- ✅ Run admin registration: `node admin/registerAdmin.js`
- ✅ Check user role is "admin"
- ✅ Verify email: admin@example.com

---

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=smartmetrosecret
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## API Endpoints

### Auth Endpoints
```
POST   /api/auth/register           - Register new passenger
POST   /api/auth/login              - Login passenger
POST   /api/auth/admin/login        - Login admin
POST   /api/auth/forgot-password    - Request password reset
POST   /api/auth/reset-password/:token - Reset password
POST   /api/auth/google             - Google OAuth login
```

### Ticket Endpoints
```
POST   /api/tickets/book            - Book new ticket (requires auth)
GET    /api/tickets/my              - Get user's tickets (requires auth)
GET    /api/tickets/all             - Get all tickets (admin only)
PUT    /api/tickets/cancel/:id      - Cancel ticket (requires auth)
```

### Train Endpoints
```
GET    /api/trains                  - Get all trains
GET    /api/trains/:id              - Get train details
POST   /api/trains                  - Add train (admin only)
PUT    /api/trains/:id              - Update train (admin only)
DELETE /api/trains/:id              - Delete train (admin only)
```

### Admin Endpoints
```
GET    /api/admin/dashboard         - Dashboard stats (admin only)
GET    /api/admin/passengers        - List passengers (admin only)
GET    /api/admin/tickets/stats     - Ticket statistics (admin only)
POST   /api/admin/wallet/add        - Add wallet balance (admin only)
```

---

## Database Collections

### Users
```
- _id
- name
- email
- password (hashed)
- role (passenger/admin)
- authProvider (local/google)
- walletBalance
- googleId
- passwordResetToken
- passwordResetExpires
- createdAt, updatedAt
```

### Tickets
```
- _id
- passenger (User ID)
- source
- destination
- fare
- status (Booked/Cancelled/Completed)
- paymentStatus (Pending/Paid/Refunded)
- createdAt, updatedAt
```

### Trains
```
- _id
- trainNumber (unique)
- trainName
- source
- destination
- currentStation
- status (Running/Stopped/Delayed/Maintenance)
- arrivalTime
- departureTime
- createdAt, updatedAt
```

---

## Performance Tips

1. **Database Indexes**: Add indexes on frequently queried fields
2. **Caching**: Implement Redis for session caching
3. **Pagination**: Add pagination for large datasets
4. **Lazy Loading**: Implement lazy loading for images
5. **CDN**: Use CDN for static assets in production

---

## Deployment

### For Production:
1. Build frontend: `npm run build`
2. Set environment variables properly
3. Use secure MongoDB Atlas connection
4. Configure HTTPS
5. Use process manager (PM2) for backend
6. Enable CORS for production domain
7. Set up proper logging and monitoring

---

## Support & Help

If you encounter any issues:
1. Check the troubleshooting section above
2. Review backend logs: `tail -f logs/server.log`
3. Check browser console (F12 → Console)
4. Verify all environment variables are set
5. Ensure MongoDB is connected

---

## Status: ✅ Ready to Use

The Smart Metro Pro application is fully functional and ready for testing!
