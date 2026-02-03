// Validation utility functions
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return "";
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number";
  if (!/(?=.*[!@#$%^&*])/.test(password)) return "Password must contain at least one special character";
  return "";
};

export const validateUsername = (username) => {
  if (!username) return "Username is required";
  if (username.length < 3) return "Username must be at least 3 characters";
  if (username.length > 30) return "Username must be less than 30 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Username can only contain letters, numbers, and underscores";
  return "";
};

export const validateFullName = (name) => {
  if (!name) return "Full name is required";
  if (name.length < 2) return "Full name must be at least 2 characters";
  if (name.length > 100) return "Full name is too long";
  return "";
};

export const validateAge = (age) => {
  if (!age) return "";
  const num = parseInt(age);
  if (isNaN(num)) return "Age must be a number";
  if (num < 13) return "You must be at least 13 years old";
  if (num > 120) return "Please enter a valid age";
  return "";
};

export const validateCGPA = (cgpa) => {
  if (!cgpa) return "";
  const num = parseFloat(cgpa);
  if (isNaN(num)) return "CGPA must be a number";
  if (num < 0 || num > 4.0) return "CGPA must be between 0 and 4.0";
  return "";
};

export const validateField = (field, value) => {
  switch (field) {
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value);
    case 'username':
      return validateUsername(value);
    case 'fullName':
      return validateFullName(value);
    case 'age':
      return validateAge(value);
    case 'cgpa':
      return validateCGPA(value);
    default:
      return "";
  }
};