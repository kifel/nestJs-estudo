import { RolesRequestUser } from './roles-response.dto';

export class UserResponse {
  /**
   * Indexificador único do usuário
   * @example 1
   */
  id: number;

  /**
   * Nome do usuário, ele deve ser único e será utilizado para logar na aplicação
   * @example kifel
   */
  name: string;

  /**
   * Lista de cargos do usuário
   */
  roles: RolesRequestUser[];
}

export class UserResponseLogin {
  /**
   * Indexificador único do usuário
   * @example 1
   */
  id: number;

  /**
   * Token de autenticação do usuário, valido por 15 minutos
   * @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
   */
  accessToken: string;

  /**
   * Refresh Token do usuário, usado para conseguir um novo token, valido por 30 dias
   * @example 7176c3cf-55c3-434a-b893-37ec409294f4
   */
  refreshToken: string;
}

export class UserResponseJWT {
  /**
   * Indexificador único do usuário
   * @example 1
   */
  id: number;

  /**
   * Nome do usuário, ele deve ser único e será utilizado para logar na aplicação
   * @example kifel
   */
  name: string;
}
