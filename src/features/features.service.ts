import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { features } from "../store";
import { CreateFeatureDto } from "./create-feature.dto";
import { Feature } from "./feature.model";

@Injectable()
export class FeaturesService {
  findAll(): Feature[] {
    return features;
  }

  findOne(key: string): Feature {
    const feature = features.find((item) => item.key === key);
    if (!feature) {
      throw new NotFoundException(`Feature ${key} not found`);
    }
    return feature;
  }

  create(dto: CreateFeatureDto): Feature {
    if (features.some((feature) => feature.key === dto.key)) {
      throw new ConflictException("Feature key already exists");
    }

    const feature: Feature = { ...dto };
    features.push(feature);
    return feature;
  }

  remove(key: string): void {
    const index = features.findIndex((feature) => feature.key === key);
    if (index === -1) {
      throw new NotFoundException(`Feature ${key} not found`);
    }
    features.splice(index, 1);
  }
}
