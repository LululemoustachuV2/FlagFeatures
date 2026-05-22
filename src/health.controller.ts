import { Controller, Get } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { HealthStatusSchema, VersionSchema } from "./swagger/api-schemas";

@ApiTags("health")
@Controller()
export class HealthController {
  @Get("health")
  @ApiOperation({ summary: "Vérifier que l'API est en ligne" })
  @ApiOkResponse({ type: HealthStatusSchema })
  getHealth(): { status: string } {
    return { status: "ok" };
  }

  @Get("version")
  @ApiOperation({ summary: "Obtenir la version de l'API" })
  @ApiOkResponse({ type: VersionSchema })
  getVersion(): { version: string } {
    return { version: "2.0.0" };
  }
}
