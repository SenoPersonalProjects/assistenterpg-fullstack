import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
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
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret && configService.get<string>('NODE_ENV') === 'production') {
          throw new Error('JWT_SECRET e obrigatorio em producao');
        }

        return {
          secret: secret || 'dev-secret',
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [SessaoController],
  providers: [SessaoService, SessaoGateway],
})
export class SessaoModule {}
