import { randomUUID } from "crypto";
import { requestContext } from "./request-context";

export const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers["x-request-id"] ?? randomUUID();
  res.setHeader("X-Request-ID", requestId);

  requestContext.run({ requestId }, next);
};
