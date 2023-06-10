import { IUser } from '@purple/interfaces';
import { IsOptional, IsString } from 'class-validator';

export namespace AccountChangeProfile {
  export const topic = 'account.change-profile.command';

  export class Request {
    @IsString()
    id: string;

    @IsString()
    @IsOptional()
    displayName?: string;

    @IsString()
    @IsOptional()
    email?: string;
  }

  export class Response {
    user: Omit<IUser, 'passwordHash'>;
  }
}
