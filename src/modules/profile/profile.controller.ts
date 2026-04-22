import type { Context } from "hono";
import * as profileService from "./profile.service";
import {
  ProfileNotFoundServiceError,
  InvalidPhotoTypeServiceError,
  PhotoTooLargeServiceError,
} from "./profile.error";
import {
  NotFoundHttpException,
  BadRequestHttpException,
} from "../../shared/http/http-exception";

export async function getMe(c: Context) {
  try {
    const data = await profileService.getProfile(
      c.get("userId" as never) as number,
    );
    return c.json({ data });
  } catch (e) {
    if (e instanceof ProfileNotFoundServiceError)
      throw new NotFoundHttpException(e.message);
    throw e;
  }
}

export async function updateMe(c: Context) {
  const body = c.req.valid("json" as never) as { fullName: string };
  try {
    const data = await profileService.updateProfile(
      c.get("userId" as never) as number,
      body.fullName,
    );
    return c.json({ data });
  } catch (e) {
    if (e instanceof ProfileNotFoundServiceError)
      throw new NotFoundHttpException(e.message);
    throw e;
  }
}

export async function uploadPhoto(c: Context) {
  const formData = await c.req.formData();
  const photo = formData.get("photo");
  if (!photo || !(photo instanceof File)) {
    throw new BadRequestHttpException("Photo file is required");
  }
  try {
    const data = await profileService.uploadPhoto(
      c.get("userId" as never) as number,
      photo,
    );
    return c.json({ data });
  } catch (e) {
    if (e instanceof ProfileNotFoundServiceError)
      throw new NotFoundHttpException(e.message);
    if (e instanceof InvalidPhotoTypeServiceError)
      throw new BadRequestHttpException(e.message);
    if (e instanceof PhotoTooLargeServiceError)
      throw new BadRequestHttpException(e.message);
    throw e;
  }
}
