import { IsNotEmpty, Length } from 'class-validator';

export class CreateTeamMemberBody {
  /**
   * Name of the team member and is used only when creating entity members, member name is required and unique
   * @example kifel
   */
  @IsNotEmpty({
    message: 'Campo não pode ser nulo...',
  })
  @Length(5, 100)
  name: string;

  /**
   * Function of the team member and is used only when creating entity members, function is required and unique
   * @example FullStack-Developer
   */
  @IsNotEmpty({
    message: 'Campo não pode ser nulo...',
  })
  function: string;
}
