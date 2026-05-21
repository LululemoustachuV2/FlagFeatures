import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { environments } from "../store";
import { CreateEnvironmentDto } from "./create-environment.dto";
import { Environment } from "./environment.model";
import { UpdateEnvironmentDto } from "./update-environment.dto";

@Injectable()
export class EnvironmentsService {
  findAll(): Environment[] {
    return environments;
  }

  findOne(name: string): Environment {
    const environment = environments.find((item) => item.name === name);
    if (!environment) {
      throw new NotFoundException(`Environment ${name} not found`);
    }
    return environment;
  }

  create(dto: CreateEnvironmentDto): Environment {
    if (environments.some((env) => env.name === dto.name)) {
      throw new ConflictException("Environment name already exists");
    }

    const environment: Environment = { ...dto };
    environments.push(environment);
    return environment;
  }

  update(name: string, dto: UpdateEnvironmentDto): Environment {
    const index = environments.findIndex((env) => env.name === name);
    if (index === -1) {
      throw new NotFoundException(`Environment ${name} not found`);
    }

    if (
      dto.name &&
      dto.name !== name &&
      environments.some((env) => env.name === dto.name)
    ) {
      throw new ConflictException("Environment name already exists");
    }

    environments[index] = { ...environments[index], ...dto };
    return environments[index];
  }

  remove(name: string): void {
    const index = environments.findIndex((env) => env.name === name);
    if (index === -1) {
      throw new NotFoundException(`Environment ${name} not found`);
    }
    environments.splice(index, 1);
  }
}
