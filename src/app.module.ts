import { Module } from "@nestjs/common";
import { GroupsModule } from "./groups/groups.module";
import { HealthController } from "./health.controller";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [UsersModule, GroupsModule],
  controllers: [HealthController],
})
export class AppModule {}