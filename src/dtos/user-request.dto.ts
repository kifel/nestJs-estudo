import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class UserRequest {
  /**
   * Nome do usuário, ele deve ser único e será utilizado para logar na aplicação
   * @example kifel
   */
  @IsNotEmpty()
  name: string;

  /**
   * Email do usuário, ele deve ser único e valido
   * @example teste@email.com
   */
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /**
   * senha do usuário, ele deve ser uma senha forte
   * @example 2@*-dasdak@278920d_Fa
   */
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}

export class UserRequestLogin {
  /**
   * Nome do usuário, ele deve ser único e será utilizado para logar na aplicação
   * @example kifel
   */
  @IsNotEmpty()
  name: string;

  /**
   * senha do usuário, ele deve ser uma senha forte
   * @example 2@*-dasdak@278920d_Fa
   */
  @IsNotEmpty()
  password: string;
}
