import { AuditLog } from "./audit/audit-log.model";
import { Environment } from "./environments/environment.model";
import { Feature } from "./features/feature.model";
import { Group } from "./groups/group.model";
import { User } from "./users/user.model";

export const users: User[] = [];
export const groups: Group[] = [];
export const features: Feature[] = [];
export const environments: Environment[] = [];
export const auditLogs: AuditLog[] = [];
