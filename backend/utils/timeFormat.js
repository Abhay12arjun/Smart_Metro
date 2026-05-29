const formatDelay = (minutes) => {
  const delayMinutes = Math.max(Number(minutes) || 0, 0);

  if (!delayMinutes) {
    return "";
  }

  const hours = Math.floor(delayMinutes / 60);
  const remainingMinutes = delayMinutes % 60;
  const parts = [];

  if (hours) {
    parts.push(`${hours} hr${hours > 1 ? "s" : ""}`);
  }

  if (remainingMinutes) {
    parts.push(`${remainingMinutes} min`);
  }

  return parts.join(" ");
};

module.exports = {
  formatDelay
};
