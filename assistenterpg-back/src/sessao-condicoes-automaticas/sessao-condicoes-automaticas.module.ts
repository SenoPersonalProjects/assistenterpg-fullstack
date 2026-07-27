import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SessaoCondicoesAutomaticasService } from './sessao-condicoes-automaticas.service';

@Module({
  imports: [PrismaModule],
  providers: [SessaoCondicoesAutomaticasService],
  exports: [SessaoCondicoesAutomaticasService],
})
export class SessaoCondicoesAutomaticasModule {}
