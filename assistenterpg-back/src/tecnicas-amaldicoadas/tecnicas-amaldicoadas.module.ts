import { Module } from '@nestjs/common';
import { TecnicasAmaldicoadasController } from './tecnicas-amaldicoadas.controller';
import { TecnicasAmaldicoadasService } from './tecnicas-amaldicoadas.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TecnicasAmaldicoadasMapper } from './tecnicas-amaldicoadas.mapper';
import { TecnicasAmaldicoadasPersistence } from './tecnicas-amaldicoadas.persistence';
import { TecnicasAmaldicoadasCrudService } from './tecnicas-amaldicoadas.crud.service';
import { TecnicasAmaldicoadasImportExportService } from './tecnicas-amaldicoadas.import-export.service';
import { TecnicasAmaldicoadasHabilidadesService } from './tecnicas-amaldicoadas.habilidades.service';
import { TecnicasAmaldicoadasVariacoesService } from './tecnicas-amaldicoadas.variacoes.service';
import { TecnicasAmaldicoadasValidationsService } from './tecnicas-amaldicoadas.validations.service';
import { TecnicasAmaldicoadasClasService } from './tecnicas-amaldicoadas.clas.service';
import { TecnicaInataPropriaService } from './tecnica-inata-propria.service';

@Module({
  imports: [PrismaModule],
  controllers: [TecnicasAmaldicoadasController],
  providers: [
    TecnicasAmaldicoadasService,
    TecnicasAmaldicoadasMapper,
    TecnicasAmaldicoadasPersistence,
    TecnicasAmaldicoadasCrudService,
    TecnicasAmaldicoadasImportExportService,
    TecnicasAmaldicoadasHabilidadesService,
    TecnicasAmaldicoadasVariacoesService,
    TecnicasAmaldicoadasValidationsService,
    TecnicasAmaldicoadasClasService,
    TecnicaInataPropriaService,
  ],
  exports: [TecnicasAmaldicoadasService, TecnicaInataPropriaService], // ← Exporta para uso em outros módulos
})
export class TecnicasAmaldicoadasModule {}
