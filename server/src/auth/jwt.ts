import jwt from 'jsonwebtoken';

import { env } from '../env';

export interface TokenPayload {
  sub: string;
  role: string;
}

export function signToken(member: { id: string; role: string }): string {
  return jwt.sign({ role: member.role }, env.jwtSecret, {
    subject: member.id,
    expiresIn: env.jwtExpiresInSeconds,
  });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);
  if (typeof decoded === 'string' || !decoded.sub) {
    throw new Error('Invalid token payload');
  }
  return { sub: String(decoded.sub), role: String((decoded as jwt.JwtPayload).role ?? 'student') };
}
