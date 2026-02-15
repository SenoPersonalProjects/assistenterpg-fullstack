import { Module } from '@nestjs/common';
import { TecnicasAmaldicoadasController } from './tecnicas-amaldicoadas.controller';
import { TecnicasAmaldicoadasService } from './tecnicas-amaldicoadas.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TecnicasAmaldicoadasController],
  providers: [TecnicasAmaldicoadasService],
  exports: [TecnicasAmaldicoadasService], // ← Exporta para uso em outros módulos
})
export class TecnicasAmaldicoadasModule {}
