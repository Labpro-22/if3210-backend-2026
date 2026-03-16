import type { Context } from "hono";
import * as familyService from "./family.service";
import {
  FamilyNotFoundServiceError,
  FamilyCodeMismatchServiceError,
  AlreadyFamilyMemberServiceError,
  NotFamilyMemberServiceError,
  InvalidFamilyIconServiceError,
  FamilyCodeGenerationFailedServiceError,
} from "./family.error";
import {
  NotFoundHttpException,
  ForbiddenHttpException,
  ConflictHttpException,
  BadRequestHttpException,
  InternalServerErrorHttpException,
} from "../../shared/http/http-exception";

function mapError(e: unknown): never {
  if (e instanceof FamilyNotFoundServiceError) throw new NotFoundHttpException(e.message);
  if (e instanceof FamilyCodeMismatchServiceError) throw new ForbiddenHttpException(e.message);
  if (e instanceof AlreadyFamilyMemberServiceError) throw new ConflictHttpException(e.message);
  if (e instanceof NotFamilyMemberServiceError) throw new ConflictHttpException(e.message);
  if (e instanceof InvalidFamilyIconServiceError) throw new BadRequestHttpException(e.message);
  if (e instanceof FamilyCodeGenerationFailedServiceError) throw new InternalServerErrorHttpException(e.message);
  throw e;
}

export async function listFamilies(c: Context) {
  const data = await familyService.listFamilies();
  return c.json({ data });
}

export async function listMyFamilies(c: Context) {
  const data = await familyService.listMyFamilies(c.get("userId" as never) as number);
  return c.json({ data });
}

export async function listDiscoverFamilies(c: Context) {
  const data = await familyService.discoverFamilies(c.get("userId" as never) as number);
  return c.json({ data });
}

export async function getFamilyById(c: Context) {
  const familyId = parseInt(c.req.param("familyId") ?? "");
  if (isNaN(familyId)) throw new BadRequestHttpException("Invalid family ID");
  try {
    const data = await familyService.getFamilyById(familyId, c.get("userId" as never) as number);
    return c.json({ data });
  } catch (e) {
    mapError(e);
  }
}

export async function createFamily(c: Context) {
  const body = c.req.valid("json" as never) as { name: string; iconUrl: string };
  try {
    const data = await familyService.createFamily(c.get("userId" as never) as number, body.name, body.iconUrl);
    return c.json({ data }, 201);
  } catch (e) {
    mapError(e);
  }
}

export async function joinFamily(c: Context) {
  const body = c.req.valid("json" as never) as { familyId: number; familyCode: string };
  try {
    await familyService.joinFamily(c.get("userId" as never) as number, body.familyId, body.familyCode);
    return c.json({ data: { joined: true } });
  } catch (e) {
    mapError(e);
  }
}

export async function leaveFamily(c: Context) {
  const body = c.req.valid("json" as never) as { familyId: number };
  try {
    await familyService.leaveFamily(c.get("userId" as never) as number, body.familyId);
    return c.json({ data: { left: true } });
  } catch (e) {
    mapError(e);
  }
}
