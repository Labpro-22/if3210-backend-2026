import {
  findUserById,
  findUserNimById,
  updateUserFullName,
  updateProfileImageUrl,
} from "./profile.repository";
import {
  ProfileNotFoundServiceError,
  InvalidPhotoTypeServiceError,
  PhotoTooLargeServiceError,
} from "./profile.error";

export async function getProfile(userId: number) {
  const user = await findUserById(userId);
  if (!user) throw new ProfileNotFoundServiceError();
  return user;
}

export async function updateProfile(userId: number, fullName: string) {
  const user = await updateUserFullName(userId, fullName);
  if (!user) throw new ProfileNotFoundServiceError();
  return user;
}

export async function uploadPhoto(userId: number, file: File) {
  if (file.type !== "image/png" && file.type !== "image/jpeg") {
    throw new InvalidPhotoTypeServiceError();
  }

  if (file.size > 512_000) {
    throw new PhotoTooLargeServiceError();
  }

  const nim = await findUserNimById(userId);
  if (!nim) throw new ProfileNotFoundServiceError();

  await Bun.write(`./uploads/${nim}.png`, file);

  const profileImageUrl = `/uploads/${nim}.png`;
  const user = await updateProfileImageUrl(userId, profileImageUrl);
  if (!user) throw new ProfileNotFoundServiceError();

  return user;
}
