import {
  upsertDeviceToken,
  deleteDeviceToken,
  findTokenByUserId,
  findTokensByUserIds,
} from "./notification.repository";
import {
  findFamilyDetail,
  isFamilyMember,
  listFamilyMembers,
} from "../family/family.repository";
import { findUserById } from "../profile/profile.repository";
import { messaging } from "../../shared/firebase/firebase";
import {
  FamilyNotFoundServiceError,
  NotFamilyMemberServiceError,
  TargetNotFamilyMemberServiceError,
  TargetUserNotFoundServiceError,
} from "./notification.error";

export async function subscribe(userId: number, fcmToken: string) {
  await upsertDeviceToken(userId, fcmToken);
}

export async function unsubscribe(userId: number) {
  await deleteDeviceToken(userId);
}

export async function broadcastToFamily(
  senderId: number,
  familyId: number,
  message: string,
) {
  const family = await findFamilyDetail(familyId);
  if (!family) {
    throw new FamilyNotFoundServiceError();
  }

  const senderIsMember = await isFamilyMember(familyId, senderId);
  if (!senderIsMember) {
    throw new NotFamilyMemberServiceError();
  }

  const members = await listFamilyMembers(familyId);
  const recipientIds = members
    .filter((m) => m.id !== senderId)
    .map((m) => m.id);

  if (recipientIds.length === 0) {
    return;
  }

  const tokens = await findTokensByUserIds(recipientIds);

  for (const { fcmToken } of tokens) {
    try {
      await messaging.send({
        notification: { title: "Family Notification", body: message },
        token: fcmToken,
      });
    } catch (error) {
      console.error("Failed to send notification to token:", fcmToken, error);
    }
  }
}

export async function sendGreeting(
  senderId: number,
  familyId: number,
  targetUserId: number,
  message: string,
) {
  const family = await findFamilyDetail(familyId);
  if (!family) {
    throw new FamilyNotFoundServiceError();
  }

  const senderIsMember = await isFamilyMember(familyId, senderId);
  if (!senderIsMember) {
    throw new NotFamilyMemberServiceError();
  }

  const targetUser = await findUserById(targetUserId);
  if (!targetUser) {
    throw new TargetUserNotFoundServiceError();
  }

  const targetIsMember = await isFamilyMember(familyId, targetUserId);
  if (!targetIsMember) {
    throw new TargetNotFamilyMemberServiceError();
  }

  const token = await findTokenByUserId(targetUserId);
  if (!token) {
    return { delivered: false, reason: "no_fcm_token" };
  }

  try {
    await messaging.send({
      notification: { title: "Greeting", body: message },
      token,
    });
    return { delivered: true };
  } catch (error) {
    console.error("Failed to send greeting to token:", token, error);
    return { delivered: false, reason: "send_failed" };
  }
}
