import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { InventarioModule } from '../inventario/inventario.module';
import { TecnicasAmaldicoadasModule } from '../tecnicas-amaldicoadas/tecnicas-amaldicoadas.module';
import { PersonagemBaseController } from './personagem-base.controller';
import { PersonagemBaseMapper } from './personagem-base.mapper';
import { PersonagemBasePersistence } from './personagem-base.persistence';
import { PersonagemBaseService } from './personagem-base.service';

@Module({
  imports: [PrismaModule, InventarioModule, TecnicasAmaldicoadasModule],
  providers: [
    PersonagemBaseService,
    PersonagemBaseMapper,
    PersonagemBasePersistence,
  ],
  controllers: [PersonagemBaseController],
})
export class PersonagemBaseModule {}
