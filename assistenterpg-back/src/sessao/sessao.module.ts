import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SessaoController } from './sessao.controller';
import { SessaoService } from './sessao.service';

@Module({
  imports: [PrismaModule],
  controllers: [SessaoController],
  providers: [SessaoService],
})
export class SessaoModule {}
