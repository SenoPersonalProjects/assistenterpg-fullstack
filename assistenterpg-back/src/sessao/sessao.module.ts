import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { resolveJwtSecret } from 'src/auth/auth-security.config';
import { AuthSessionService } from 'src/auth/auth-session.service';
import { GoogleModule } from 'src/google/google.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SessaoAgendadaController } from './sessao-agendada.controller';
import { SessaoAgendadaService } from './sessao-agendada.service';
import { SessaoActivationService } from './sessao-activation.service';
import { SessaoController } from './sessao.controller';
import { SessaoService } from './sessao.service';
import { SessaoGateway } from './sessao.gateway';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    GoogleModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: resolveJwtSecret(configService),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SessaoController, SessaoAgendadaController],
  providers: [
    SessaoService,
    SessaoGateway,
    SessaoAgendadaService,
    SessaoActivationService,
    AuthSessionService,
  ],
})
export class SessaoModule {}
