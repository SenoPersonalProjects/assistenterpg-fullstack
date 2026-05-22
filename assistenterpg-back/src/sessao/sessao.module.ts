import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { resolveJwtSecret } from 'src/auth/auth-security.config';
import { AuthSessionService } from 'src/auth/auth-session.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SessaoController } from './sessao.controller';
import { SessaoService } from './sessao.service';
import { SessaoGateway } from './sessao.gateway';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: resolveJwtSecret(configService),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SessaoController],
  providers: [SessaoService, SessaoGateway, AuthSessionService],
})
export class SessaoModule {}
