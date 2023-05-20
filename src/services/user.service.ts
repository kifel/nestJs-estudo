import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../config/database/prisma.service';
import { UserRequest } from '../dtos/user-request.dto';
import { UserResponse } from '../dtos/user-response.dto';
import { UserRole } from '../enums/UserRole';
import { UserRepository } from '../repositories/user-repository';

@Injectable()
export class UserService implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * This function finds a user by their ID and returns their information, including their roles, while
   * excluding their password.
   * @param {number} id - The id parameter is a number that represents the unique identifier of a user.
   * It is used to query the database and retrieve the user with the matching id.
   * @returns The `findById` method returns a `Promise` that resolves to a `UserResponse` object. This
   * object is obtained by querying the database for a user with the specified `id`, including their
   * associated roles. If the user is not found, a `NotFoundException` is thrown. The returned
   * `UserResponse` object contains the user's information, with the `password` field set to `undefined`.
   */
  async findById(id: number): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id '${id}' not found`);
    }

    const selectedUser = {
      ...user,
      password: undefined,
    };

    return selectedUser;
  }

  /**
   * This is an async function that creates a new user with a specific role and checks for existing users
   * before creating.
   * @param {UserRequest} newUser - The parameter `newUser` is an object of type `UserRequest` which
   * contains the information needed to create a new user in the system. This includes properties such as
   * `name`, `email`, and `password`.
   * @returns The function `create` returns a Promise that resolves to a `UserResponse` object.
   */
  async create(newUser: UserRequest): Promise<UserResponse> {
    const role = await this.prisma.roles.findFirst({
      where: {
        name: UserRole.User,
      },
    });

    if (!role) {
      throw new NotFoundException(
        'Cargo não configurados no banco de dados, por favor contactar o ADMIN do sistema.',
      );
    }

    await this.checkForExistingUser(newUser.name, newUser.email);

    const userToCreate = {
      ...newUser,
      password: await bcrypt.hash(newUser.password, 10),
      roles: {
        connect: {
          id: role.id,
        },
      },
    };

    const createdUser = await this.prisma.user.create({
      data: userToCreate,
      include: {
        roles: {
          select: {
            name: true,
          },
        },
      },
    });

    const userWithoutPassword = {
      ...createdUser,
      password: undefined,
    };

    return userWithoutPassword;
  }

  /**
   * This function checks if a user with the given name or email already exists in the database and
   * throws a ConflictException if so.
   * @param {string} name - A string representing the name of the user being checked for existence in the
   * database.
   * @param {string} email - The email parameter is a string representing the email address of a user. It
   * is used to check if there is already an existing user with the same email address in the database.
   */
  private async checkForExistingUser(name: string, email: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: name,
              mode: 'insensitive',
            },
          },
          {
            email: {
              equals: email,
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.name.toLowerCase() === name.toLowerCase()) {
        throw new ConflictException(
          `Já existe um usuário com o nome '${name}'.`,
        );
      } else {
        throw new ConflictException(
          `Já existe um usuário com o email '${email}'.`,
        );
      }
    }
  }

  /**
   * This is an async function that finds a user by their name and includes their roles, throwing a
   * NotFoundException if the user is not found.
   * @param {string} name - A string representing the name of the user to be searched for.
   * @returns The `findByName` function returns a user object that matches the given name parameter. If
   * no user is found, it throws a `NotFoundException` with a message indicating that the user was not
   * found. The returned user object includes an array of roles, where each role object contains the name
   * property.
   */
  async findByName(name: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
      include: {
        roles: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Usuário ou senha inválidos.');
    }

    return user;
  }
}
