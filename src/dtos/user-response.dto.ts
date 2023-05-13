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
