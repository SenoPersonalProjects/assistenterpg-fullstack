// src/campanha/campanha.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { resolveJwtSecret } from 'src/auth/auth-security.config';
import { AuthSessionService } from 'src/auth/auth-session.service';
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
import { CampanhaVinculadosService } from './campanha.vinculados.service';
import { CampanhaMacrosService } from './campanha.macros.service';
import { CampanhaRoletaService } from './campanha.roleta.service';
import { CampanhaGateway } from './campanha.gateway';
import { CampanhaConcessoesService } from './campanha.concessoes.service';
import { AmizadesModule } from 'src/amizades/amizades.module';
import { SessaoCondicoesAutomaticasModule } from 'src/sessao-condicoes-automaticas/sessao-condicoes-automaticas.module';

@Module({
  imports: [
    PrismaModule,
    SessaoCondicoesAutomaticasModule,
    InventarioModule,
    TecnicasAmaldicoadasModule,
    AmizadesModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: resolveJwtSecret(configService),
      }),
      inject: [ConfigService],
    }),
  ],
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
    CampanhaVinculadosService,
    CampanhaMacrosService,
    CampanhaRoletaService,
    CampanhaGateway,
    CampanhaConcessoesService,
    AuthSessionService,
  ],
  controllers: [CampanhaController],
})
export class CampanhaModule {}
