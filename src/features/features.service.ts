import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { features } from "../store";
import { CreateFeatureDto } from "./create-feature.dto";
import { Feature } from "./feature.model";
import { UpdateFeatureDto } from "./update-feature.dto";

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

  update(key: string, dto: UpdateFeatureDto): Feature {
    const index = features.findIndex((feature) => feature.key === key);
    if (index === -1) {
      throw new NotFoundException(`Feature ${key} not found`);
    }

    if (
      dto.key &&
      dto.key !== key &&
      features.some((feature) => feature.key === dto.key)
    ) {
      throw new ConflictException("Feature key already exists");
    }

    features[index] = { ...features[index], ...dto };
    return features[index];
  }

  enable(key: string): Feature {
    const feature = this.findOne(key);
    feature.enabled = true;
    return feature;
  }

  disable(key: string): Feature {
    const feature = this.findOne(key);
    feature.enabled = false;
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
