import { CreateTeamMemberResponse } from 'src/dtos/create-team-member-response.dto';

export abstract class RocketMembersRepository {
  abstract create(
    name: string,
    memberFunction: string,
  ): Promise<CreateTeamMemberResponse>;
}
