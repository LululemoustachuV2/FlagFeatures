import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
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

  @Put(":key/environments/:env/config")
  setConfig(
    @Param("key") key: string,
    @Param("env") env: string,
    @Body() dto: FeatureConfigDto,
  ): FeatureEnvironmentConfig {
    return this.featuresService.setConfig(key, env, dto);
  }

  @Delete("delete/:key")
  @HttpCode(204)
  remove(@Param("key") key: string): void {
    return this.featuresService.remove(key);
  }
}
