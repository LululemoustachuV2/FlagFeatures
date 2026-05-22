import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { groups, users } from "../store";
import { User } from "../users/user.model";
import { CreateGroupDto } from "./create-group.dto";
import { Group } from "./group.model";
import { UpdateGroupDto } from "./update-group.dto";

@Injectable()
export class GroupsService {
  constructor(private readonly auditService: AuditService) {}

  findAll(): Group[] {
    return groups;
  }

  findOne(id: number): Group {
    const group = groups.find((item) => item.id === id);
    if (!group) {
      throw new NotFoundException(`Group ${id} not found`);
    }
    return group;
  }

  create(dto: CreateGroupDto): Group {
    if (groups.some((group) => group.name === dto.name)) {
      throw new ConflictException("Group name already exists");
    }

    const id =
      groups.length === 0
        ? 1
        : Math.max(...groups.map((group) => group.id)) + 1;

    const group: Group = { id, ...dto, userIds: [] };
    groups.push(group);
    return group;
  }

  update(id: number, dto: UpdateGroupDto): Group {
    const index = groups.findIndex((group) => group.id === id);
    if (index === -1) {
      throw new NotFoundException(`Group ${id} not found`);
    }

    if (
      dto.name &&
      groups.some((group) => group.name === dto.name && group.id !== id)
    ) {
      throw new ConflictException("Group name already exists");
    }

    groups[index] = { ...groups[index], ...dto };
    return groups[index];
  }

  remove(id: number): void {
    const index = groups.findIndex((group) => group.id === id);
    if (index === -1) {
      throw new NotFoundException(`Group ${id} not found`);
    }
    groups.splice(index, 1);
  }

  addUser(groupId: number, userId: number): Group {
    const group = this.findOne(groupId);
    this.findUser(userId);

    if (group.userIds.includes(userId)) {
      throw new ConflictException("User already in group");
    }

    group.userIds.push(userId);
    this.auditService.log("group.user.added", `group:${groupId}`, {
      groupId,
      userId,
    });
    return group;
  }

  removeUser(groupId: number, userId: number): void {
    const group = this.findOne(groupId);
    const index = group.userIds.indexOf(userId);
    if (index === -1) {
      throw new NotFoundException(`User ${userId} not in group ${groupId}`);
    }
    group.userIds.splice(index, 1);
    this.auditService.log("group.user.removed", `group:${groupId}`, {
      groupId,
      userId,
    });
  }

  findGroupUsers(groupId: number): User[] {
    const group = this.findOne(groupId);
    return users.filter((user) => group.userIds.includes(user.id));
  }

  private findUser(userId: number): User {
    const user = users.find((item) => item.id === userId);
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    return user;
  }
}
