import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../entities';

type userProps = {
  [K in keyof User as User[K] extends Function ? never : K]: User[K];
};

export const GetUser = createParamDecorator(
    (data: keyof userProps | undefined, context: ExecutionContext) => {
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
        throw new InternalServerErrorException('User not found (request)');
    }


    return data ? user[data] : user;
});
