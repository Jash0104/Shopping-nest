import { Controller, Post, Body, Get, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { LoginUserDto, CreateUserDto } from './dto';
import { AuthService } from './auth.service';
import { GetUser, GetRawHeaders, RoleProtected, Auth } from './decorators';
import { User } from './entities';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create( createUserDto );
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser( loginUserDto )
  }

  @Get('checkAuth')
  @Auth()
  getAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus( user )
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    @GetRawHeaders() rawheaders: string[],
    @GetUser() user: User,
    @GetUser('email') userEmail: string
  ) {
    console.log(rawheaders);

    // console.log(request.user);
    return { user, rawheaders }
  }

  // @SetMetadata('roles', ['admin', 'super-user'])

  @Get('private2')
  @RoleProtected( ValidRoles.admin, ValidRoles.superUser )
  @UseGuards( AuthGuard(), UserRoleGuard )
  privateRoute2(
    @GetUser() user: User
  ) {
    return {
      ok: true,
      user
    }
  }

  @Get('private3')
  @Auth( ValidRoles.admin )
  privateRoute3(
    @GetUser() user: User
  ) {
    return {
      ok: true,
      user
    }
  }


}
