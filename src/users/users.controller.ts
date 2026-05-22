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
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { UserSchema } from "../swagger/api-schemas";
import { CreateUserDto } from "./create-user.dto";
import { UpdateUserDto } from "./update-user.dto";
import { User } from "./user.model";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("add-user")
  @ApiOperation({ summary: "Créer un utilisateur" })
  @ApiCreatedResponse({ type: UserSchema })
  @ApiBadRequestResponse({ description: "Payload invalide" })
  @ApiConflictResponse({ description: "Email déjà utilisé" })
  create(@Body() dto: CreateUserDto): User {
    return this.usersService.create(dto);
  }

  @Get("all")
  @ApiOperation({ summary: "Lister tous les utilisateurs" })
  @ApiOkResponse({ type: UserSchema, isArray: true })
  findAll(): User[] {
    return this.usersService.findAll();
  }

  @Get("get-by-id/:id")
  @ApiOperation({ summary: "Obtenir un utilisateur par id" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiOkResponse({ type: UserSchema })
  @ApiNotFoundResponse({ description: "Utilisateur introuvable" })
  findOne(@Param("id", ParseIntPipe) id: number): User {
    return this.usersService.findOne(id);
  }

  @Patch("update/:id")
  @ApiOperation({ summary: "Mettre à jour un utilisateur" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiOkResponse({ type: UserSchema })
  @ApiBadRequestResponse({ description: "Payload invalide" })
  @ApiNotFoundResponse({ description: "Utilisateur introuvable" })
  @ApiConflictResponse({ description: "Email déjà utilisé" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): User {
    return this.usersService.update(id, dto);
  }

  @Delete("delete/:id")
  @HttpCode(204)
  @ApiOperation({ summary: "Supprimer un utilisateur" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiNoContentResponse({ description: "Utilisateur supprimé" })
  @ApiNotFoundResponse({ description: "Utilisateur introuvable" })
  remove(@Param("id", ParseIntPipe) id: number): void {
    return this.usersService.remove(id);
  }
}
