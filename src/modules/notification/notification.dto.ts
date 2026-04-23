import { z } from "zod";

export const SubscribeRequestDto = z.object({
  fcmToken: z.string().trim().min(1).max(4096),
});

export const SendNotificationRequestDto = z.object({
  familyId: z.number().int().positive(),
  message: z.string().trim().min(1).max(1000),
});

export const GreetingRequestDto = z.object({
  familyId: z.number().int().positive(),
  targetUserId: z.number().int().positive(),
  message: z.string().trim().min(1).max(1000),
});
