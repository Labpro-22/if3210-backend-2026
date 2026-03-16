export class LiveUnauthorizedServiceError extends Error {
  constructor() { super("WebSocket authentication failed"); }
}
export class LiveValidationServiceError extends Error {
  constructor(msg = "Invalid message payload") { super(msg); }
}
export class LiveRateLimitServiceError extends Error {
  constructor() { super("Rate limit exceeded"); }
}
