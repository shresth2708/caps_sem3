// Email validation
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Password validation (min 6 characters)
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Required field validation
export const validateRequired = (value) => {
  return value && value.toString().trim() !== '';
};

// Number validation
export const validateNumber = (value) => {
  return !isNaN(value) && isFinite(value);
};

// Positive number validation
export const validatePositiveNumber = (value) => {
  return validateNumber(value) && parseFloat(value) > 0;
};

// Integer validation
export const validateInteger = (value) => {
  return validateNumber(value) && Number.isInteger(parseFloat(value));
};

// Phone number validation (basic)
export const validatePhone = (phone) => {
  const re = /^[\d\s\-\+\(\)]+$/;
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

// URL validation
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Date validation
export const validateDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

// Future date validation
export const validateFutureDate = (date) => {
  return validateDate(date) && new Date(date) > new Date();
};

export default {
  validateEmail,
  validatePassword,
  validateRequired,
  validateNumber,
  validatePositiveNumber,
  validateInteger,
  validatePhone,
  validateURL,
  validateDate,
  validateFutureDate,
};
