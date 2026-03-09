import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { CampanhaModule } from './campanha/campanha.module';
import { PersonagemBaseModule } from './personagem-base/personagem-base.module';
import { ClasModule } from './clas/clas.module';
import { ClassesModule } from './classes/classes.module';
import { OrigensModule } from './origens/origens.module';
import { ProficienciasModule } from './proficiencias/proficiencias.module';
import { TiposGrauModule } from './tipos-grau/tipos-grau.module';
import { PericiasModule } from './pericias/pericias.module';
import { TrilhasModule } from './trilhas/trilhas.module';
import { HabilidadesModule } from './habilidades/habilidades.module';
import { AlinhamentosModule } from './alinhamentos/alinhamentos.module';
import { CompendioModule } from './compendio/compendio.module';
import { InventarioModule } from './inventario/inventario.module';
import { EquipamentosModule } from './equipamentos/equipamentos.module';
import { ModificacoesModule } from './modificacoes/modificacoes.module';
import { CondicoesModule } from './condicoes/condicoes.module';
import { TecnicasAmaldicoadasModule } from './tecnicas-amaldicoadas/tecnicas-amaldicoadas.module';
import { SuplementosModule } from './suplementos/suplementos.module';
import { HomebrewsModule } from './homebrews/homebrews.module';
import { SessaoModule } from './sessao/sessao.module';
import { NpcsAmeacasModule } from './npcs-ameacas/npcs-ameacas.module';

@Module({
  imports: [
    PrismaModule,
    UsuarioModule,
    AuthModule,
    CampanhaModule,
    PersonagemBaseModule,
    ClasModule,
    ClassesModule,
    OrigensModule,
    ProficienciasModule,
    TiposGrauModule,
    PericiasModule,
    TrilhasModule,
    HabilidadesModule,
    AlinhamentosModule,
    CompendioModule,
    InventarioModule,
    EquipamentosModule,
    ModificacoesModule,
    CondicoesModule,
    TecnicasAmaldicoadasModule,
    SuplementosModule,
    HomebrewsModule,
    SessaoModule,
    NpcsAmeacasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
