import { Controller, Get } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { AuditLogSchema } from "../swagger/api-schemas";
import { AuditLog } from "./audit-log.model";
import { AuditService } from "./audit.service";

@ApiTags("audit-logs")
@Controller("audit-logs")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: "Lister tous les audit logs" })
  @ApiOkResponse({ type: AuditLogSchema, isArray: true })
  findAll(): AuditLog[] {
    return this.auditService.findAll();
  }
}
