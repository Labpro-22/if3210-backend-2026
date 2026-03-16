export class HttpException extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

export class BadRequestHttpException extends HttpException {
  constructor(message = "Bad request") {
    super(400, "BAD_REQUEST", message);
  }
}

export class UnauthorizedHttpException extends HttpException {
  constructor(message = "Unauthorized") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenHttpException extends HttpException {
  constructor(message = "Forbidden") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundHttpException extends HttpException {
  constructor(message = "Not found") {
    super(404, "NOT_FOUND", message);
  }
}

export class ConflictHttpException extends HttpException {
  constructor(message = "Conflict") {
    super(409, "CONFLICT", message);
  }
}

export class InternalServerErrorHttpException extends HttpException {
  constructor(message = "Internal server error") {
    super(500, "INTERNAL_SERVER_ERROR", message);
  }
}
