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
import { CreateEnvironmentDto } from "./create-environment.dto";
import { Environment } from "./environment.model";
import { EnvironmentsService } from "./environments.service";
import { UpdateEnvironmentDto } from "./update-environment.dto";

@Controller("environments")
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Post("add-environment")
  create(@Body() dto: CreateEnvironmentDto): Environment {
    return this.environmentsService.create(dto);
  }

  @Get("all")
  findAll(): Environment[] {
    return this.environmentsService.findAll();
  }

  @Get("get-by-name/:name")
  findOne(@Param("name") name: string): Environment {
    return this.environmentsService.findOne(name);
  }

  @Patch("update/:name")
  update(
    @Param("name") name: string,
    @Body() dto: UpdateEnvironmentDto,
  ): Environment {
    return this.environmentsService.update(name, dto);
  }

  @Delete("delete/:name")
  @HttpCode(204)
  remove(@Param("name") name: string): void {
    return this.environmentsService.remove(name);
  }
}
