import { Controller, Get } from "@nestjs/common";

@Controller()
export class HealthController {
  @Get("health")
  getHealth(): { status: string } {
    return { status: "ok" };
  }

  @Get("version")
  getVersion(): { version: string } {
    return { version: "1.0.0" };
  }
}
