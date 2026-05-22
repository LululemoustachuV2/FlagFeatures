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
  Put,
  Query,
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
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { AuditService } from "../audit/audit.service";
import { AuditLog } from "../audit/audit-log.model";
import {
  AuditLogSchema,
  FeatureEnvironmentConfigSchema,
  FeatureEvaluateResponseSchema,
  FeatureSchema,
} from "../swagger/api-schemas";
import { CreateFeatureDto } from "./create-feature.dto";
import { FeatureConfigDto } from "./feature-config.dto";
import { FeatureEnvironmentConfig } from "./feature-config.model";
import { Feature } from "./feature.model";
import { FeaturesService } from "./features.service";
import { UpdateFeatureDto } from "./update-feature.dto";

@ApiTags("features")
@Controller("features")
export class FeaturesController {
  constructor(
    private readonly featuresService: FeaturesService,
    private readonly auditService: AuditService,
  ) {}

  @Post("add-feature")
  @ApiOperation({ summary: "Créer une feature flag" })
  @ApiCreatedResponse({ type: FeatureSchema })
  @ApiBadRequestResponse({ description: "Payload invalide" })
  @ApiConflictResponse({ description: "Clé de feature déjà utilisée" })
  create(@Body() dto: CreateFeatureDto): Feature {
    return this.featuresService.create(dto);
  }

  @Get("all")
  @ApiOperation({ summary: "Lister toutes les features" })
  @ApiOkResponse({ type: FeatureSchema, isArray: true })
  findAll(): Feature[] {
    return this.featuresService.findAll();
  }

  @Get("get-by-key/:key")
  @ApiOperation({ summary: "Obtenir une feature par clé" })
  @ApiParam({ name: "key", example: "dark-mode" })
  @ApiOkResponse({ type: FeatureSchema })
  @ApiNotFoundResponse({ description: "Feature introuvable" })
  findOne(@Param("key") key: string): Feature {
    return this.featuresService.findOne(key);
  }

  @Get(":key/audit-logs")
  @ApiOperation({ summary: "Lister les audit logs d'une feature" })
  @ApiParam({ name: "key", example: "dark-mode" })
  @ApiOkResponse({ type: AuditLogSchema, isArray: true })
  @ApiNotFoundResponse({ description: "Feature introuvable" })
  findAuditLogs(@Param("key") key: string): AuditLog[] {
    this.featuresService.findOne(key);
    return this.auditService.findByFeatureKey(key);
  }

  @Patch("update/:key")
  @ApiOperation({ summary: "Mettre à jour une feature" })
  @ApiParam({ name: "key", example: "dark-mode" })
  @ApiOkResponse({ type: FeatureSchema })
  @ApiBadRequestResponse({ description: "Payload invalide" })
  @ApiNotFoundResponse({ description: "Feature introuvable" })
  @ApiConflictResponse({ description: "Clé de feature déjà utilisée" })
  update(
    @Param("key") key: string,
    @Body() dto: UpdateFeatureDto,
  ): Feature {
    return this.featuresService.update(key, dto);
  }

  @Patch(":key/enable")
  @ApiOperation({ summary: "Activer une feature globalement" })
  @ApiParam({ name: "key", example: "dark-mode" })
  @ApiOkResponse({ type: FeatureSchema })
  @ApiNotFoundResponse({ description: "Feature introuvable" })
  enable(@Param("key") key: string): Feature {
    return this.featuresService.enable(key);
  }

  @Patch(":key/disable")
  @ApiOperation({ summary: "Désactiver une feature globalement" })
  @ApiParam({ name: "key", example: "dark-mode" })
  @ApiOkResponse({ type: FeatureSchema })
  @ApiNotFoundResponse({ description: "Feature introuvable" })
  disable(@Param("key") key: string): Feature {
    return this.featuresService.disable(key);
  }

  @Get(":key/evaluate")
  @ApiOperation({ summary: "Évaluer l'accès à une feature pour un utilisateur" })
  @ApiParam({ name: "key", example: "dark-mode" })
  @ApiQuery({ name: "userId", type: Number, example: 1 })
  @ApiQuery({ name: "env", example: "prod" })
  @ApiOkResponse({ type: FeatureEvaluateResponseSchema })
  @ApiBadRequestResponse({ description: "Paramètres de requête invalides" })
  @ApiNotFoundResponse({
    description: "Feature, utilisateur, environnement ou config introuvable",
  })
  evaluate(
    @Param("key") key: string,
    @Query("userId", ParseIntPipe) userId: number,
    @Query("env") env: string,
  ): { feature: string; enabled: boolean; reason: string } {
    return this.featuresService.evaluate(key, userId, env);
  }

  @Get(":key/environments/:env/config")
  @ApiOperation({ summary: "Obtenir la config d'une feature pour un environnement" })
  @ApiParam({ name: "key", example: "dark-mode" })
  @ApiParam({ name: "env", example: "prod" })
  @ApiOkResponse({ type: FeatureEnvironmentConfigSchema })
  @ApiNotFoundResponse({
    description: "Feature, environnement ou config introuvable",
  })
  getConfig(
    @Param("key") key: string,
    @Param("env") env: string,
  ): FeatureEnvironmentConfig {
    return this.featuresService.getConfig(key, env);
  }

  @Put(":key/environments/:env/config")
  @ApiOperation({ summary: "Définir la config d'une feature pour un environnement" })
  @ApiParam({ name: "key", example: "dark-mode" })
  @ApiParam({ name: "env", example: "prod" })
  @ApiOkResponse({ type: FeatureEnvironmentConfigSchema })
  @ApiBadRequestResponse({ description: "Payload invalide" })
  @ApiNotFoundResponse({ description: "Feature ou environnement introuvable" })
  setConfig(
    @Param("key") key: string,
    @Param("env") env: string,
    @Body() dto: FeatureConfigDto,
  ): FeatureEnvironmentConfig {
    return this.featuresService.setConfig(key, env, dto);
  }

  @Delete(":key/environments/:env/config")
  @HttpCode(204)
  @ApiOperation({ summary: "Supprimer la config d'une feature pour un environnement" })
  @ApiParam({ name: "key", example: "dark-mode" })
  @ApiParam({ name: "env", example: "prod" })
  @ApiNoContentResponse({ description: "Config supprimée" })
  @ApiNotFoundResponse({
    description: "Feature, environnement ou config introuvable",
  })
  deleteConfig(@Param("key") key: string, @Param("env") env: string): void {
    return this.featuresService.deleteConfig(key, env);
  }

  @Delete("delete/:key")
  @HttpCode(204)
  @ApiOperation({ summary: "Supprimer une feature" })
  @ApiParam({ name: "key", example: "dark-mode" })
  @ApiNoContentResponse({ description: "Feature supprimée" })
  @ApiNotFoundResponse({ description: "Feature introuvable" })
  remove(@Param("key") key: string): void {
    return this.featuresService.remove(key);
  }
}
