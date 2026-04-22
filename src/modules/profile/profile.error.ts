export class ProfileNotFoundServiceError extends Error {
  constructor() {
    super("Profile not found");
  }
}

export class InvalidPhotoTypeServiceError extends Error {
  constructor() {
    super("Invalid photo type. Only PNG and JPEG are allowed");
  }
}

export class PhotoTooLargeServiceError extends Error {
  constructor() {
    super("Photo exceeds maximum size of 500KB");
  }
}
