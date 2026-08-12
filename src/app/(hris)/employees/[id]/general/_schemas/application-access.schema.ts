import { z } from 'zod';

export const createIdentitySchema = z
  .object({
    email: z.string().email(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    roleKey: z.string().min(1, 'Role is required'),
  })
  .refine(
    (data) => {
      if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    },
  );

export const updateIdentitySchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  confirmPassword: z.string().min(8).optional(),
  roleKey: z.string().optional(),
});

export type CreateIdentityForm = z.infer<typeof createIdentitySchema>;
export type UpdateIdentityForm = z.infer<typeof updateIdentitySchema>;
