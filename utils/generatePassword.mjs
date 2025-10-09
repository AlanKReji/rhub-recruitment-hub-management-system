import crypto from 'crypto';

const generateRandomPassword = (length = 12) => {
  const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numericChars = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = upperCaseChars + lowerCaseChars + numericChars + specialChars;
  let password = '';
  password += upperCaseChars[crypto.randomInt(upperCaseChars.length)];
  password += lowerCaseChars[crypto.randomInt(lowerCaseChars.length)];
  password += numericChars[crypto.randomInt(numericChars.length)];
  password += specialChars[crypto.randomInt(specialChars.length)];

  for (let i = 4; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

export default generateRandomPassword;