import { z } from 'zod';

export const presetSubmissionSchema = z.object({
  user_id: z.string().uuid().optional().nullable(),
  creator_name: z
    .string()
    .trim()
    .min(2, 'Player name must be at least 2 characters')
    .max(24, 'Player name cannot exceed 24 characters'),
  team_name: z
    .string()
    .trim()
    .max(12, 'Clan tag cannot exceed 12 characters')
    .optional()
    .or(z.literal('')),
  code: z
    .string()
    .trim()
    .min(6, 'CODM share code must be at least 6 characters')
    .max(128, 'Share code cannot exceed 128 characters'),
  description: z
    .string()
    .trim()
    .max(120, 'Player note cannot exceed 120 characters')
    .optional()
    .or(z.literal('')),
  category: z.enum(['graphics', 'hud', 'sensitivity']),
  mode: z.enum(['Battle Royale', 'Multiplayer']),
  playstyle: z.enum(['Rusher', 'Sniper', 'All-Rounder']).optional().nullable(),
  device_type: z.enum(['Phone', 'iPad / Tablet']),
  device_name: z
    .string()
    .trim()
    .max(40, 'Device model cannot exceed 40 characters')
    .optional()
    .or(z.literal('')),
  social_platform: z.enum(['YouTube', 'TikTok', 'Facebook', 'Twitch', 'X']).optional(),
  social_handle: z
    .string()
    .trim()
    .max(32, 'Social handle cannot exceed 32 characters')
    .optional()
    .or(z.literal('')),
  youtube_url: z.string().trim().optional().nullable().or(z.literal('')),
  tiktok_url: z.string().trim().optional().nullable().or(z.literal('')),
  facebook_url: z.string().trim().optional().nullable().or(z.literal('')),
  grip: z.enum(['2-Finger', '3-Finger', '4-Finger', '5+ Finger']).optional(),
  gyro: z.boolean().optional(),
  graphic_quality: z.enum(['Low', 'Medium', 'High', 'Very High']).optional().nullable(),
  fps_target: z.enum(['Low', 'Medium', 'High', 'Very High', 'Max', 'Ultra']).optional().nullable(),
  image_url: z.string().url('Invalid image URL').optional().nullable().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (
    (data.category === 'graphics' || data.category === 'hud') &&
    (!data.image_url || data.image_url.trim() === '')
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `A screenshot is required for ${data.category === 'graphics' ? 'Graphics' : 'HUD Layout'} setups.`,
      path: ['image_url'],
    });
  }
});

export type PresetSubmissionInput = z.infer<typeof presetSubmissionSchema>;

export const profileUpdateSchema = z.object({
  ign: z
    .string()
    .trim()
    .min(2, 'In-game name must be at least 2 characters')
    .max(24, 'In-game name cannot exceed 24 characters'),
  clan_tag: z
    .string()
    .trim()
    .max(10, 'Clan tag cannot exceed 10 characters')
    .transform((val) => val.replace(/[[\]()]/g, '').trim().toUpperCase())
    .optional()
    .nullable()
    .or(z.literal('')),
  youtube_url: z.string().trim().optional().nullable().or(z.literal('')),
  tiktok_url: z.string().trim().optional().nullable().or(z.literal('')),
  facebook_url: z.string().trim().optional().nullable().or(z.literal('')),
  social_platform: z.enum(['YouTube', 'TikTok', 'Facebook', 'Twitch', 'X']).optional().nullable(),
  social_url: z.string().trim().optional().nullable().or(z.literal('')),
  social_handle: z.string().trim().max(32, 'Handle cannot exceed 32 characters').optional().nullable().or(z.literal('')),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const feedbackSchema = z.object({
  category: z.enum(['suggestion', 'bug', 'mode_request', 'general']),
  message: z
    .string()
    .trim()
    .min(5, 'Message must be at least 5 characters')
    .max(1000, 'Message cannot exceed 1,000 characters'),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
