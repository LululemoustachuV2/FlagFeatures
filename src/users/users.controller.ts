import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserDto } from "./user.dto";
import { User } from "./user.model";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("add-user")
  create(@Body() dto: UserDto): User {
    return this.usersService.create(dto);
  }

  @Get("all")
  findAll(): User[] {
    return this.usersService.findAll();
  }
}
