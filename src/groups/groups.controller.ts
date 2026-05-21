import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { User } from "../users/user.model";
import { CreateGroupDto } from "./create-group.dto";
import { Group } from "./group.model";
import { GroupsService } from "./groups.service";
import { UpdateGroupDto } from "./update-group.dto";

@Controller("groups")
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post("add-group")
  create(@Body() dto: CreateGroupDto): Group {
    return this.groupsService.create(dto);
  }

  @Get("all")
  findAll(): Group[] {
    return this.groupsService.findAll();
  }

  @Get("get-by-id/:id")
  findOne(@Param("id", ParseIntPipe) id: number): Group {
    return this.groupsService.findOne(id);
  }

  @Patch("update/:id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateGroupDto,
  ): Group {
    return this.groupsService.update(id, dto);
  }

  @Delete("delete/:id")
  @HttpCode(204)
  remove(@Param("id", ParseIntPipe) id: number): void {
    return this.groupsService.remove(id);
  }

  @Post(":id/add-user/:userId")
  addUser(
    @Param("id", ParseIntPipe) id: number,
    @Param("userId", ParseIntPipe) userId: number,
  ): Group {
    return this.groupsService.addUser(id, userId);
  }

  @Delete(":id/remove-user/:userId")
  @HttpCode(204)
  removeUser(
    @Param("id", ParseIntPipe) id: number,
    @Param("userId", ParseIntPipe) userId: number,
  ): void {
    return this.groupsService.removeUser(id, userId);
  }

  @Get(":id/users")
  findGroupUsers(@Param("id", ParseIntPipe) id: number): User[] {
    return this.groupsService.findGroupUsers(id);
  }
}
