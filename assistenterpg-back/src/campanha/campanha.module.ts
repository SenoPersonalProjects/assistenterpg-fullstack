// src/campanha/campanha.module.ts
import { Module } from '@nestjs/common';
import { CampanhaService } from './campanha.service';
import { CampanhaController } from './campanha.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { InventarioModule } from '../inventario/inventario.module';
import { TecnicasAmaldicoadasModule } from '../tecnicas-amaldicoadas/tecnicas-amaldicoadas.module';
import { CampanhaMapper } from './campanha.mapper';
import { CampanhaPersistence } from './campanha.persistence';
import { CampanhaAccessService } from './campanha.access.service';
import { CampanhaContextoService } from './campanha.contexto.service';
import { CampanhaPersonagensService } from './campanha.personagens.service';
import { CampanhaModificadoresService } from './campanha.modificadores.service';
import { CampanhaConvitesService } from './campanha.convites.service';
import { CampanhaInventarioService } from './campanha.inventario.service';
import { CampanhaItensSessaoService } from './campanha.itens-sessao.service';

@Module({
  imports: [PrismaModule, InventarioModule, TecnicasAmaldicoadasModule],
  providers: [
    CampanhaService,
    CampanhaMapper,
    CampanhaPersistence,
    CampanhaAccessService,
    CampanhaContextoService,
    CampanhaPersonagensService,
    CampanhaModificadoresService,
    CampanhaConvitesService,
    CampanhaInventarioService,
    CampanhaItensSessaoService,
  ],
  controllers: [CampanhaController],
})
export class CampanhaModule {}
