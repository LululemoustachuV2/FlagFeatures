import { Injectable } from "@nestjs/common";
import { auditLogs } from "../store";
import { AuditLog } from "./audit-log.model";

@Injectable()
export class AuditService {
  log(
    action: string,
    resource: string,
    details: Record<string, unknown>,
    featureKey?: string,
  ): AuditLog {
    const id =
      auditLogs.length === 0
        ? 1
        : Math.max(...auditLogs.map((log) => log.id)) + 1;

    const entry: AuditLog = {
      id,
      action,
      resource,
      timestamp: new Date().toISOString(),
      details,
      ...(featureKey !== undefined ? { featureKey } : {}),
    };
    auditLogs.push(entry);
    return entry;
  }

  findAll(): AuditLog[] {
    return auditLogs;
  }

  findByFeatureKey(featureKey: string): AuditLog[] {
    return auditLogs.filter((log) => log.featureKey === featureKey);
  }
}
