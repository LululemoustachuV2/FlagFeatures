import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from "@nestjs/common";
import { CreateFeatureDto } from "./create-feature.dto";
import { Feature } from "./feature.model";
import { FeaturesService } from "./features.service";

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

  @Delete("delete/:key")
  @HttpCode(204)
  remove(@Param("key") key: string): void {
    return this.featuresService.remove(key);
  }
}
