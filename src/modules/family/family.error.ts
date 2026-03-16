export class FamilyNotFoundServiceError extends Error {
  constructor() { super("Family not found"); }
}
export class FamilyCodeMismatchServiceError extends Error {
  constructor() { super("Family code does not match"); }
}
export class AlreadyFamilyMemberServiceError extends Error {
  constructor() { super("Already a member of this family"); }
}
export class NotFamilyMemberServiceError extends Error {
  constructor() { super("Not a member of this family"); }
}
export class InvalidFamilyIconServiceError extends Error {
  constructor() { super("Invalid family icon URL"); }
}
export class FamilyCodeGenerationFailedServiceError extends Error {
  constructor() { super("Failed to generate unique family code"); }
}
