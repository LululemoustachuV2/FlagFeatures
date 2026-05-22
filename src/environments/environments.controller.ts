import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
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
import { EnvironmentSchema } from "../swagger/api-schemas";
import { CreateEnvironmentDto } from "./create-environment.dto";
import { Environment } from "./environment.model";
import { EnvironmentsService } from "./environments.service";
import { UpdateEnvironmentDto } from "./update-environment.dto";

@ApiTags("environments")
@Controller("environments")
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Post("add-environment")
  @ApiOperation({ summary: "Créer un environnement" })
  @ApiCreatedResponse({ type: EnvironmentSchema })
  @ApiBadRequestResponse({ description: "Payload invalide" })
  @ApiConflictResponse({ description: "Nom d'environnement déjà utilisé" })
  create(@Body() dto: CreateEnvironmentDto): Environment {
    return this.environmentsService.create(dto);
  }

  @Get("all")
  @ApiOperation({ summary: "Lister tous les environnements" })
  @ApiOkResponse({ type: EnvironmentSchema, isArray: true })
  findAll(): Environment[] {
    return this.environmentsService.findAll();
  }

  @Get("get-by-name/:name")
  @ApiOperation({ summary: "Obtenir un environnement par nom" })
  @ApiParam({ name: "name", example: "prod" })
  @ApiOkResponse({ type: EnvironmentSchema })
  @ApiNotFoundResponse({ description: "Environnement introuvable" })
  findOne(@Param("name") name: string): Environment {
    return this.environmentsService.findOne(name);
  }

  @Patch("update/:name")
  @ApiOperation({ summary: "Mettre à jour un environnement" })
  @ApiParam({ name: "name", example: "prod" })
  @ApiOkResponse({ type: EnvironmentSchema })
  @ApiBadRequestResponse({ description: "Payload invalide" })
  @ApiNotFoundResponse({ description: "Environnement introuvable" })
  @ApiConflictResponse({ description: "Nom d'environnement déjà utilisé" })
  update(
    @Param("name") name: string,
    @Body() dto: UpdateEnvironmentDto,
  ): Environment {
    return this.environmentsService.update(name, dto);
  }

  @Delete("delete/:name")
  @HttpCode(204)
  @ApiOperation({ summary: "Supprimer un environnement" })
  @ApiParam({ name: "name", example: "prod" })
  @ApiNoContentResponse({ description: "Environnement supprimé" })
  @ApiNotFoundResponse({ description: "Environnement introuvable" })
  remove(@Param("name") name: string): void {
    return this.environmentsService.remove(name);
  }
}
