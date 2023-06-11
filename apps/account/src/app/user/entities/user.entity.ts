import { AccountChangedCourse } from '@purple/contracts';
import {
  IDomainEvent,
  IUser,
  IUserCourse,
  PurchaseState,
  UserRole,
} from '@purple/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';

export class UserEntity implements IUser {
  _id: string;
  displayName?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  courses: IUserCourse[] = [];
  events: IDomainEvent[] = [];

  constructor(user: IUser) {
    this._id = user._id;
    this.displayName = user.displayName;
    this.email = user.email;
    this.role = user.role;
    this.passwordHash = user.passwordHash;
    this.courses = user.courses;
  }

  findCourse(id: string) {
    return this.courses.find((c) => c.courseId === id);
  }

  findAndThrowCourse(id: string, message = 'Course not found') {
    const course = this.findCourse(id);

    if (!course) {
      throw new Error(message);
    }

    return course;
  }

  addCourse(id: string) {
    this.courses.push({
      courseId: id,
      purchaseState: PurchaseState.Started,
    });
  }

  deleteCourse(id: string) {
    this.findAndThrowCourse(id);
    this.courses = this.courses.filter((c) => c.courseId !== id);
  }

  getCourseState(id: string): PurchaseState {
    return this.findCourse(id)?.purchaseState || PurchaseState.Started;
  }

  setCourseState(id: string, state: PurchaseState): this {
    const course = this.findCourse(id);

    if (!course) {
      this.addCourse(id);

      return this;
    }

    if (state === PurchaseState.Cancelled) {
      this.deleteCourse(id);

      return this;
    }

    this.courses = this.courses.map((c) => {
      if (c.courseId === id) {
        c.purchaseState = state;
      }

      return c;
    });

    const eventData: AccountChangedCourse.Request = {
      courseId: id,
      userId: this._id,
      state,
    };

    this.events.push({
      topic: AccountChangedCourse.topic,
      data: eventData,
    });

    return this;
  }

  getUserInfo() {
    return {
      email: this.email,
      role: this.role,
      displayName: this.displayName,
    };
  }

  public async setPassword(password: string) {
    const salt = await genSalt(10);

    this.passwordHash = await hash(password, salt);

    return this;
  }

  public async validatePassword(password: string) {
    return await compare(password, this.passwordHash);
  }
}
