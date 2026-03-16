import type { WSContext } from "hono/ws";
import { listSharedPeerUserIds } from "./live.repository";
import { UpdatePresencePayloadDto } from "./live.dto";
import { LiveValidationServiceError, LiveRateLimitServiceError } from "./live.error";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

interface Connection {
  ws: WSContext;
  presence: any;
  fullName: string;
  email: string;
}

const connections = new Map<number, Connection>();

// Rate limiter: sliding window token bucket
const rateBuckets = new Map<number, number[]>();
const RATE_LIMIT = 10; // per second

function checkRateLimit(userId: number) {
  const now = Date.now();
  const bucket = rateBuckets.get(userId) ?? [];
  const filtered = bucket.filter((t) => now - t < 1000);
  if (filtered.length >= RATE_LIMIT) throw new LiveRateLimitServiceError();
  filtered.push(now);
  rateBuckets.set(userId, filtered);
}

function sendJson(ws: WSContext, data: any) {
  ws.send(JSON.stringify(data));
}

export async function registerConnection(userId: number, ws: WSContext) {
  // Fetch user info for broadcasts
  const [user] = await db.select({ fullName: users.fullName, email: users.email }).from(users).where(eq(users.id, userId)).limit(1);

  connections.set(userId, { ws, presence: null, fullName: user?.fullName ?? "", email: user?.email ?? "" });

  // Send current presence of online peers
  const peerIds = await listSharedPeerUserIds(userId);
  for (const peerId of peerIds) {
    const peer = connections.get(peerId);
    if (peer?.presence) {
      sendJson(ws, {
        type: "member_presence_updated",
        payload: { userId: peerId, email: peer.email, fullName: peer.fullName, ...peer.presence },
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export function removeConnection(userId: number) {
  connections.delete(userId);
  rateBuckets.delete(userId);
}

export async function handleUpdatePresence(userId: number, rawPayload: unknown) {
  checkRateLimit(userId);

  const result = UpdatePresencePayloadDto.safeParse(rawPayload);
  if (!result.success) throw new LiveValidationServiceError(result.error.issues.map((i) => i.message).join(", "));

  const conn = connections.get(userId);
  if (!conn) return;

  const payload = result.data;
  conn.presence = payload;

  const peerIds = await listSharedPeerUserIds(userId);
  const broadcast = {
    type: "member_presence_updated",
    payload: {
      userId,
      email: conn.email,
      fullName: conn.fullName,
      ...payload,
    },
    timestamp: new Date().toISOString(),
  };

  for (const peerId of peerIds) {
    const peer = connections.get(peerId);
    if (peer) sendJson(peer.ws, broadcast);
  }
}

export function handlePing(ws: WSContext) {
  sendJson(ws, { type: "pong", payload: {}, timestamp: new Date().toISOString() });
}
