import { AsyncLocalStorage } from "async_hooks";

export const requestContext = new AsyncLocalStorage<{ requestId: string }>();

export const getRequestId = () => {
  return requestContext.getStore()?.requestId;
};
