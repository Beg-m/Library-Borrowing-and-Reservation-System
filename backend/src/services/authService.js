import prisma from '../utils/prisma.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Login service - authenticates user and returns token
 */
export const login = async (email, password, role) => {
  // Find user based on role
  let user;
  if (role === 'MEMBER') {
    user = await prisma.member.findUnique({ where: { email } });
  } else if (role === 'LIBRARIAN') {
    user = await prisma.librarian.findUnique({ where: { email } });
  } else if (role === 'ADMIN') {
    user = await prisma.adminUser.findUnique({ where: { email } });
  } else {
    throw new Error('Invalid role');
  }

  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (!user.isActive) {
    throw new Error('Account is inactive');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: role.toUpperCase(),
  });

  // Return user data (without password) with role
  const { password: _, ...userWithoutPassword } = user;
  return {
    user: {
      ...userWithoutPassword,
      role: role.toUpperCase(),
    },
    token,
  };
};

/**
 * Register new member
 */
export const registerMember = async (memberData) => {
  const { email, password, firstName, lastName, phone, address } = memberData;

  // Check if email already exists
  const existingMember = await prisma.member.findUnique({ where: { email } });
  if (existingMember) {
    throw new Error('Email already registered');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create member
  const member = await prisma.member.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      address,
    },
  });

  // Generate token for auto-login after registration
  const token = generateToken({
    id: member.id,
    email: member.email,
    role: 'MEMBER', // Registration is only for members
  });

  // Remove password from response
  const { password: _, ...memberWithoutPassword } = member;
  return {
    user: {
      ...memberWithoutPassword,
      role: 'MEMBER',
    },
    token,
  };
};

