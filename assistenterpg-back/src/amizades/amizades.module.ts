import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { resolveJwtSecret } from 'src/auth/auth-security.config';
import { AuthSessionService } from 'src/auth/auth-session.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AmizadesController } from './amizades.controller';
import { AmizadesService } from './amizades.service';
import { PresencaGateway } from './presenca.gateway';
import { PresencaService } from './presenca.service';

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
  controllers: [AmizadesController],
  providers: [
    AmizadesService,
    PresencaGateway,
    PresencaService,
    AuthSessionService,
  ],
  exports: [AmizadesService, PresencaService],
})
export class AmizadesModule {}
