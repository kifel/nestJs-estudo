import { IsNotEmpty } from 'class-validator';

export class RefreshTokenRequest {
  /**
   * Identificador único do usuário
   * @example 1
   */
  @IsNotEmpty()
  userId: number;

  /**
   * Refresh Token do usuário, usado para conseguir um novo token, valido por 30 dias
   * @example 7176c3cf-55c3-434a-b893-37ec409294f4
   */
  @IsNotEmpty()
  refreshToken: string;
}

export class RefreshTokenLogOutRequest {
  /**
   * Refresh Token do usuário, usado para conseguir um novo token, valido por 30 dias
   * @example 7176c3cf-55c3-434a-b893-37ec409294f4
   */
  @IsNotEmpty()
  refreshToken: string;
}
