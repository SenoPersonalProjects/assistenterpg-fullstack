import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AnotacoesController } from './anotacoes.controller';
import { AnotacoesService } from './anotacoes.service';

@Module({
  imports: [PrismaModule],
  controllers: [AnotacoesController],
  providers: [AnotacoesService],
})
export class AnotacoesModule {}
