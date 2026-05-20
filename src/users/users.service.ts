import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { users } from "../store";
import { CreateUserDto } from "./create-user.dto";
import { User } from "./user.model";
import { UpdateUserDto } from "./update-user.dto";

@Injectable()
export class UsersService {
  findAll(): User[] {
    return users;
  }

  findOne(id: number): User {
    const user = users.find((item) => item.id === id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  create(dto: CreateUserDto): User {
    if (users.some((user) => user.email === dto.email)) {
      throw new ConflictException("Email already exists");
    }

    const id =
      users.length === 0 ? 1 : Math.max(...users.map((user) => user.id)) + 1;

    const user: User = { id, ...dto };
    users.push(user);
    return user;
  }

  update(id: number, dto: UpdateUserDto): User {
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new NotFoundException(`User ${id} not found`);
    }

    if (
      dto.email &&
      users.some((user) => user.email === dto.email && user.id !== id)
    ) {
      throw new ConflictException("Email already exists");
    }

    users[index] = { ...users[index], ...dto };
    return users[index];
  }

  remove(id: number): void {
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new NotFoundException(`User ${id} not found`);
    }
    users.splice(index, 1);
  }
}
