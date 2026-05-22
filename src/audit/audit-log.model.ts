export interface AuditLog {
  id: number;
  action: string;
  resource: string;
  timestamp: string;
  details: Record<string, unknown>;
  featureKey?: string;
}
