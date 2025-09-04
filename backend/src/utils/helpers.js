import crypto from 'crypto';

// Generate random string
export const generateRandomString = (length = 8) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

// Generate referral code
export const generateReferralCode = (username) => {
  const randomPart = generateRandomString(6);
  return `${username}_${randomPart}`.toUpperCase();
};

// Calculate referral bonus
export const calculateReferralBonus = (referrerLevel, referralCount) => {
  const bonusRates = {
    promotor: { base: 50, multiplier: 1 },
    promotor1: { base: 75, multiplier: 1.2 },
    promotor2: { base: 100, multiplier: 1.5 },
    promotor3: { base: 150, multiplier: 2 },
    promotor4: { base: 200, multiplier: 2.5 }
  };

  const rate = bonusRates[referrerLevel] || bonusRates.promotor;
  return Math.floor(rate.base * rate.multiplier * Math.min(referralCount / 5, 2));
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Validate YouTube URL
export const isValidYouTubeUrl = (url) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

// Get current session based on time
export const getCurrentSession = () => {
  const now = new Date();
  const hours = now.getHours();
  return hours < 12 ? '12am-12pm' : '12pm-12am';
};

// Check if date is today
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return today.toDateString() === checkDate.toDateString();
};

// Generate transaction ID
export const generateTransactionId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5);
  return `TXN${timestamp}${random}`.toUpperCase();
};