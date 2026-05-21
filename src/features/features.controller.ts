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
import { CreateFeatureDto } from "./create-feature.dto";
import { FeatureConfigDto } from "./feature-config.dto";
import { FeatureEnvironmentConfig } from "./feature-config.model";
import { Feature } from "./feature.model";
import { FeaturesService } from "./features.service";
import { UpdateFeatureDto } from "./update-feature.dto";

@Controller("features")
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Post("add-feature")
  create(@Body() dto: CreateFeatureDto): Feature {
    return this.featuresService.create(dto);
  }

  @Get("all")
  findAll(): Feature[] {
    return this.featuresService.findAll();
  }

  @Get("get-by-key/:key")
  findOne(@Param("key") key: string): Feature {
    return this.featuresService.findOne(key);
  }

  @Patch("update/:key")
  update(
    @Param("key") key: string,
    @Body() dto: UpdateFeatureDto,
  ): Feature {
    return this.featuresService.update(key, dto);
  }

  @Patch(":key/enable")
  enable(@Param("key") key: string): Feature {
    return this.featuresService.enable(key);
  }

  @Patch(":key/disable")
  disable(@Param("key") key: string): Feature {
    return this.featuresService.disable(key);
  }

  @Get(":key/evaluate")
  evaluate(
    @Param("key") key: string,
    @Query("userId", ParseIntPipe) userId: number,
    @Query("env") env: string,
  ): { feature: string; enabled: boolean; reason: string } {
    return this.featuresService.evaluate(key, userId, env);
  }

  @Get(":key/environments/:env/config")
  getConfig(
    @Param("key") key: string,
    @Param("env") env: string,
  ): FeatureEnvironmentConfig {
    return this.featuresService.getConfig(key, env);
  }

  @Put(":key/environments/:env/config")
  setConfig(
    @Param("key") key: string,
    @Param("env") env: string,
    @Body() dto: FeatureConfigDto,
  ): FeatureEnvironmentConfig {
    return this.featuresService.setConfig(key, env, dto);
  }

  @Delete(":key/environments/:env/config")
  @HttpCode(204)
  deleteConfig(@Param("key") key: string, @Param("env") env: string): void {
    return this.featuresService.deleteConfig(key, env);
  }

  @Delete("delete/:key")
  @HttpCode(204)
  remove(@Param("key") key: string): void {
    return this.featuresService.remove(key);
  }
}
