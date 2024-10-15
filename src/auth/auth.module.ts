import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy
  ],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      User
    ]),
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
    // JwtModule.register({
    //   secret: '',
    //   signOptions: { expiresIn: '1h'}
    // })
    JwtModule.registerAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: ( configService: ConfigService ) => {
        // console.log("JWT::", process.env.JWT_SECRET);
        // console.log("JWT::", configService.get('JWT_SECRET'));
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: '1h'}
        }
      }
    })
  ],
  exports: [
    TypeOrmModule,
    JwtStrategy,
    PassportModule,
    JwtModule
  ]
})
export class AuthModule {}
