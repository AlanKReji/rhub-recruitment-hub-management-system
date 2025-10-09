export const isPasswordComplex = (password) => {
  if (!password || password.length < 8) {
    return false;
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[@#$%&*]/.test(password);

  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};