import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AmizadesModule } from 'src/amizades/amizades.module';
import { resolveJwtSecret } from 'src/auth/auth-security.config';
import { AuthSessionService } from 'src/auth/auth-session.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatAmigosController } from './chat-amigos.controller';
import { ChatAmigosGateway } from './chat-amigos.gateway';
import { ChatAmigosService } from './chat-amigos.service';

@Module({
  imports: [
    PrismaModule,
    AmizadesModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: resolveJwtSecret(configService),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ChatAmigosController],
  providers: [ChatAmigosService, ChatAmigosGateway, AuthSessionService],
})
export class ChatAmigosModule {}
