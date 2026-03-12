// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuarioModule } from '../usuario/usuario.module';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';

import { RolesGuard } from './guards/roles.guard';
import { AdminGuard } from './guards/admin.guard';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthTokenService } from './auth-token.service';
import { AuthMailService } from './auth-mail.service';

@Module({
  imports: [
    ConfigModule,
    UsuarioModule,
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret && configService.get<string>('NODE_ENV') === 'production') {
          throw new Error('JWT_SECRET é obrigatório em produção');
        }

        return {
          secret: secret || 'dev-secret',
          signOptions: {
            expiresIn: 60 * 60 * 24 * 7,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    AuthTokenService,
    AuthMailService,
    LocalStrategy,
    JwtStrategy,
    RolesGuard,
    AdminGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, RolesGuard, AdminGuard],
})
export class AuthModule {}
