export interface PulsarEventEnvelope<T = any> {
  id: string;
  type: string;
  source: string;
  userId: string;
  time: string;
  schemaVersion: "1";
  traceId?: string;
  data: T;
}
