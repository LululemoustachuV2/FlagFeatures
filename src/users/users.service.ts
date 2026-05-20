import { ConflictException, Injectable } from "@nestjs/common";
import { users } from "../store";
import { UserDto } from "./user.dto";
import { User } from "./user.model";

@Injectable()
export class UsersService {
  findAll(): User[] {
    return users;
  }

  create(dto: UserDto): User {
    if (users.some((user) => user.email === dto.email)) {
      throw new ConflictException("Email already exists");
    }

    const id =
      users.length === 0 ? 1 : Math.max(...users.map((user) => user.id)) + 1;

    const user: User = { id, ...dto };
    users.push(user);
    return user;
  }
}
