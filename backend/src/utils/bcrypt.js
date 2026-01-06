import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash password using bcrypt
 * @param {String} password - Plain text password
 * @returns {Promise<String>} Hashed password
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare plain password with hashed password
 * @param {String} password - Plain text password
 * @param {String} hash - Hashed password
 * @returns {Promise<Boolean>} True if passwords match
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

