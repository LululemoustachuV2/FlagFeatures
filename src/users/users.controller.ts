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
import { CreateUserDto } from "./create-user.dto";
import { UpdateUserDto } from "./update-user.dto";
import { User } from "./user.model";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("add-user")
  create(@Body() dto: CreateUserDto): User {
    return this.usersService.create(dto);
  }

  @Get("all")
  findAll(): User[] {
    return this.usersService.findAll();
  }

  @Get("get-by-id/:id")
  findOne(@Param("id", ParseIntPipe) id: number): User {
    return this.usersService.findOne(id);
  }

  @Patch("update/:id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): User {
    return this.usersService.update(id, dto);
  }

  @Delete("delete/:id")
  @HttpCode(204)
  remove(@Param("id", ParseIntPipe) id: number): void {
    return this.usersService.remove(id);
  }
}
