export class FamilyNotFoundServiceError extends Error {
  constructor() {
    super("Family not found");
  }
}
export class NotFamilyMemberServiceError extends Error {
  constructor() {
    super("Not a member of this family");
  }
}
export class TargetNotFamilyMemberServiceError extends Error {
  constructor() {
    super("Target user is not a member of this family");
  }
}
export class TargetUserNotFoundServiceError extends Error {
  constructor() {
    super("Target user not found");
  }
}
