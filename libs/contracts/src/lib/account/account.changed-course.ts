import { IsEnum, IsString } from 'class-validator';
import { PurchaseState } from '@purple/interfaces';

export namespace AccountChangedCourse {
  export const topic = 'account.changed-course.event';

  export class Request {
    @IsString()
    userId: string;

    @IsString()
    courseId: string;

    @IsEnum(PurchaseState)
    state: PurchaseState;
  }
}
