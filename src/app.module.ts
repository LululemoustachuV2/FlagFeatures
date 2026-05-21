import { Module } from "@nestjs/common";
import { EnvironmentsModule } from "./environments/environments.module";
import { GroupsModule } from "./groups/groups.module";
import { HealthController } from "./health.controller";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [UsersModule, GroupsModule, EnvironmentsModule],
  controllers: [HealthController],
})
export class AppModule {}