import { forwardRef, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GoogleModule } from 'src/google/google.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { AuthController } from './auth.controller';
import { GoogleAuthController } from './google-auth.controller';
import { resolveJwtSecret } from './auth-security.config';
import { AuthMailService } from './auth-mail.service';
import { AuthSessionService } from './auth-session.service';
import { AuthTokenService } from './auth-token.service';
import { AuthService } from './auth.service';
import { AdminGuard } from './guards/admin.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [
    ConfigModule,
    GoogleModule,
    forwardRef(() => UsuarioModule),
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: resolveJwtSecret(configService),
        signOptions: {
          expiresIn: 60 * 60 * 24 * 7,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    AuthSessionService,
    AuthTokenService,
    AuthMailService,
    LocalStrategy,
    JwtStrategy,
    RolesGuard,
    AdminGuard,
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
  controllers: [AuthController, GoogleAuthController],
  exports: [
    AuthService,
    AuthSessionService,
    AuthMailService,
    RolesGuard,
    AdminGuard,
  ],
})
export class AuthModule {}
