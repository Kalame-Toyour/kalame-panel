/* eslint-disable no-console */
'use server';

import { signIn } from '@/auth';
import { generateSalt } from '@/libs/crypto';
import { getPool } from '@/libs/DB';
import { DEFAULT_LOGIN_REDIRECT } from '@/libs/routes';
import { createPublicAction } from '@/libs/safe-action';
import { hash } from 'bcryptjs';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import type { RowDataPacket } from 'mysql2';

// Type definitions for action responses
type ActionResponse<T = undefined> = {
  [x: string]: any;
  success: boolean;
  error?: string;
  data?: T;
};

// Schema definitions
const PhoneVerificationSchema = z.object({
  phone: z.string().min(11, 'Invalid phone number'),
});

const VerifyCodeSchema = z.object({
  phone: z.string(),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

const CompleteProfileSchema = z.object({
  phone: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().nullable(),
  referralCode: z.string().optional().nullable(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const verifyPhoneNumber = createPublicAction(
  'verifyPhoneNumber',
  PhoneVerificationSchema,
  async (data) => {
    try {
      const pool = await getPool();
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM user WHERE mobile = ? LIMIT 1', [data.phone]);
      const existingUser = rows[0];
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('Verification code:', verificationCode);
      return {
        success: true,
        exists: !!existingUser,
        code: verificationCode,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      };
    }
  },
);

export const verifyCode = createPublicAction(
  'verifyCode',
  VerifyCodeSchema,
  async (): Promise<ActionResponse> => {
    try {
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      };
    }
  },
);

export const completeProfile = createPublicAction(
  'completeProfile',
  CompleteProfileSchema,
  async (data): Promise<ActionResponse> => {
    try {
      const pool = await getPool();
      const [usernameRows] = await pool.query<RowDataPacket[]>('SELECT * FROM user WHERE username = ? LIMIT 1', [data.name]);
      const existingUsername = usernameRows[0];
      if (existingUsername) {
        return {
          success: false,
          error: 'این نام کاربری قبلاً استفاده شده است',
        };
      }
      const salt = await generateSalt();
      const hashedPassword = await hash(data.password + salt, 10);
      const [userRows] = await pool.query<RowDataPacket[]>('SELECT * FROM user WHERE mobile = ? LIMIT 1', [data.phone]);
      const existingUser = userRows[0];
      if (existingUser) {
        await pool.query('UPDATE user SET username = ?, email = ?, updatedAt = ? WHERE id = ?', [data.name, data.email || null, new Date().toISOString(), existingUser.id]);
      } else {
        await pool.query('INSERT INTO user (username, email, mobile, password, salt, authSource, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [data.name, data.email || null, data.phone, hashedPassword, salt, 'local', 'Active']);
      }
      await signIn('credentials', {
        phone: data.phone,
        password: data.password,
        redirect: false,
      });
      return {
        success: true,
        message: 'ثبت نام با موفقیت انجام شد',
        redirectTo: DEFAULT_LOGIN_REDIRECT,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      };
    }
  },
);

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const login = createPublicAction(
  'login',
  z.object({
    phone: z.string(),
    password: z.string(),
  }),
  async (data) => {
    try {
      await signIn('credentials', {
        phone: data.phone,
        password: data.password,
        redirect: false,
      });
      return {
        success: true,
        redirectTo: DEFAULT_LOGIN_REDIRECT,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        return { success: false, error: 'رمز عبور اشتباه است' };
      }
      return { success: false, error: 'خطایی رخ داده است' };
    }
  },
);
