import { CanActivate, ExecutionContext, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { User } from '../entities';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    const validRoles: string[] = this.reflector.get( META_ROLES, context.getHandler() )

    if ( !validRoles || ( Array.isArray( validRoles ) && validRoles.length === 0) ) return true

    const { user }  = context.switchToHttp().getRequest() as { user: User }

    if (!user) 
      throw new InternalServerErrorException('User not found (request)');
  
    for (const role of user.roles) {
      if ( validRoles.includes(role) ) return true
    }

    throw new ForbiddenException(`User ${ user.fullName } do not have permissions to do this. Valid Roles: ${ validRoles.join(", ")}.`)
  }
}
