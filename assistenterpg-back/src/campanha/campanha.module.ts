// src/campanha/campanha.module.ts
import { Module } from '@nestjs/common';
import { CampanhaService } from './campanha.service';
import { CampanhaController } from './campanha.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CampanhaMapper } from './campanha.mapper';
import { CampanhaPersistence } from './campanha.persistence';
import { CampanhaAccessService } from './campanha.access.service';
import { CampanhaContextoService } from './campanha.contexto.service';
import { CampanhaPersonagensService } from './campanha.personagens.service';
import { CampanhaModificadoresService } from './campanha.modificadores.service';
import { CampanhaConvitesService } from './campanha.convites.service';

@Module({
  imports: [PrismaModule],
  providers: [
    CampanhaService,
    CampanhaMapper,
    CampanhaPersistence,
    CampanhaAccessService,
    CampanhaContextoService,
    CampanhaPersonagensService,
    CampanhaModificadoresService,
    CampanhaConvitesService,
  ],
  controllers: [CampanhaController],
})
export class CampanhaModule {}
