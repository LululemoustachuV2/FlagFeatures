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
import { GroupSchema, UserSchema } from "../swagger/api-schemas";
import { User } from "../users/user.model";
import { CreateGroupDto } from "./create-group.dto";
import { Group } from "./group.model";
import { GroupsService } from "./groups.service";
import { UpdateGroupDto } from "./update-group.dto";

@ApiTags("groups")
@Controller("groups")
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post("add-group")
  @ApiOperation({ summary: "Créer un groupe" })
  @ApiCreatedResponse({ type: GroupSchema })
  @ApiBadRequestResponse({ description: "Payload invalide" })
  @ApiConflictResponse({ description: "Nom de groupe déjà utilisé" })
  create(@Body() dto: CreateGroupDto): Group {
    return this.groupsService.create(dto);
  }

  @Get("all")
  @ApiOperation({ summary: "Lister tous les groupes" })
  @ApiOkResponse({ type: GroupSchema, isArray: true })
  findAll(): Group[] {
    return this.groupsService.findAll();
  }

  @Get("get-by-id/:id")
  @ApiOperation({ summary: "Obtenir un groupe par id" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiOkResponse({ type: GroupSchema })
  @ApiNotFoundResponse({ description: "Groupe introuvable" })
  findOne(@Param("id", ParseIntPipe) id: number): Group {
    return this.groupsService.findOne(id);
  }

  @Patch("update/:id")
  @ApiOperation({ summary: "Mettre à jour un groupe" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiOkResponse({ type: GroupSchema })
  @ApiBadRequestResponse({ description: "Payload invalide" })
  @ApiNotFoundResponse({ description: "Groupe introuvable" })
  @ApiConflictResponse({ description: "Nom de groupe déjà utilisé" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateGroupDto,
  ): Group {
    return this.groupsService.update(id, dto);
  }

  @Delete("delete/:id")
  @HttpCode(204)
  @ApiOperation({ summary: "Supprimer un groupe" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiNoContentResponse({ description: "Groupe supprimé" })
  @ApiNotFoundResponse({ description: "Groupe introuvable" })
  remove(@Param("id", ParseIntPipe) id: number): void {
    return this.groupsService.remove(id);
  }

  @Post(":id/add-user/:userId")
  @ApiOperation({ summary: "Ajouter un utilisateur à un groupe" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiParam({ name: "userId", type: Number, example: 1 })
  @ApiCreatedResponse({ type: GroupSchema })
  @ApiNotFoundResponse({ description: "Groupe ou utilisateur introuvable" })
  @ApiConflictResponse({ description: "Utilisateur déjà dans le groupe" })
  addUser(
    @Param("id", ParseIntPipe) id: number,
    @Param("userId", ParseIntPipe) userId: number,
  ): Group {
    return this.groupsService.addUser(id, userId);
  }

  @Delete(":id/remove-user/:userId")
  @HttpCode(204)
  @ApiOperation({ summary: "Retirer un utilisateur d'un groupe" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiParam({ name: "userId", type: Number, example: 1 })
  @ApiNoContentResponse({ description: "Utilisateur retiré du groupe" })
  @ApiNotFoundResponse({ description: "Groupe ou utilisateur introuvable" })
  removeUser(
    @Param("id", ParseIntPipe) id: number,
    @Param("userId", ParseIntPipe) userId: number,
  ): void {
    return this.groupsService.removeUser(id, userId);
  }

  @Get(":id/users")
  @ApiOperation({ summary: "Lister les utilisateurs d'un groupe" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiOkResponse({ type: UserSchema, isArray: true })
  @ApiNotFoundResponse({ description: "Groupe introuvable" })
  findGroupUsers(@Param("id", ParseIntPipe) id: number): User[] {
    return this.groupsService.findGroupUsers(id);
  }
}
