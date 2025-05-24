/* eslint-disable unicorn/prefer-node-protocol */
import crypto from 'crypto';
import { promisify } from 'util';

const randomBytes = promisify(crypto.randomBytes);

export async function generateSalt(): Promise<string> {
  const buffer = await randomBytes(16);
  return buffer.toString('hex');
}
