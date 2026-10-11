import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Tell us your full name'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, { message: 'You must accept the community guidelines' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  name: z.string().min(2, 'Tell us your full name'),
  headline: z.string().min(3, 'Add a short headline'),
  bio: z.string().max(280, 'Keep your bio under 280 characters').optional().or(z.literal('')),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  portfolio: z.string().optional(),
});

export const announcementSchema = z.object({
  title: z.string().min(4, 'Give the announcement a clear title'),
  body: z.string().min(10, 'Add a little more detail'),
  tag: z.string().min(2, 'Pick a tag'),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type AnnouncementValues = z.infer<typeof announcementSchema>;
