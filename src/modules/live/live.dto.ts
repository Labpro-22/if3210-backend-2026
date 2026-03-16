import { z } from "zod";

export const UpdatePresencePayloadDto = z.object({
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  rotation: z.number(),
  batteryLevel: z.number().int().min(0).max(100),
  isCharging: z.boolean(),
  internetStatus: z.enum(["wifi", "mobile"]),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export const WsMessageEnvelope = z.object({
  type: z.string(),
  payload: z.record(z.string(), z.unknown()).optional().default({}),
  timestamp: z.string(),
});
