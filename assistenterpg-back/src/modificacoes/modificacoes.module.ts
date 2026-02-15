import { Module } from '@nestjs/common';
import { ModificacoesController } from './modificacoes.controller';
import { ModificacoesService } from './modificacoes.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ModificacoesController],
  providers: [ModificacoesService],
  exports: [ModificacoesService],
})
export class ModificacoesModule {}
