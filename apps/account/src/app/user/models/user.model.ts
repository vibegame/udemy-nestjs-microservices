import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IUser,
  IUserCourse,
  PurchaseState,
  UserRole,
} from '@purple/interfaces';
import { Document, Types } from 'mongoose';

@Schema()
export class UserCourse extends Document implements IUserCourse {
  @Prop({ required: true })
  courseId: string;

  @Prop({
    type: String,
    enum: PurchaseState,
    required: true,
  })
  purchaseState: PurchaseState;
}

export const UserCourseSchema = SchemaFactory.createForClass(UserCourse);

@Schema()
export class User extends Document implements IUser {
  @Prop()
  displayName?: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    type: String,
    enum: UserRole,
    required: true,
    default: UserRole.Student,
  })
  role: UserRole;

  @Prop({ type: [UserCourseSchema], _id: false })
  courses: Types.Array<UserCourse>;
}

export const UserSchema = SchemaFactory.createForClass(User);
