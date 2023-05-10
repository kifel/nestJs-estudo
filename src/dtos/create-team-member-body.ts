import { IsNotEmpty, Length } from 'class-validator';

export class CreateTeamMemberBody {
  @IsNotEmpty({
    message: 'Campo não pode ser nulo...',
  })
  @Length(5, 100)
  name: string;

  @IsNotEmpty({
    message: 'Campo não pode ser nulo...',
  })
  function: string;
}
