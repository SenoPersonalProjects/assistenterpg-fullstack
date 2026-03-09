// src/homebrews/dto/create-homebrew.dto.ts

import { IsNotEmpty, IsEnum } from 'class-validator';
import { TipoHomebrewConteudo } from '@prisma/client';
import { CreateHomebrewBaseDto } from './base/create-homebrew-base.dto';

// Equipamentos
import { HomebrewArmaDto } from './equipamentos/criar-homebrew-arma.dto';
import { HomebrewProtecaoDto } from './equipamentos/criar-homebrew-protecao.dto';
import { HomebrewAcessorioDto } from './equipamentos/criar-homebrew-acessorio.dto';
import { HomebrewMunicaoDto } from './equipamentos/criar-homebrew-municao.dto';
import { HomebrewExplosivoDto } from './equipamentos/criar-homebrew-explosivo.dto';
import { HomebrewFerramentaAmaldicoadaDto } from './equipamentos/criar-homebrew-ferramenta-amaldicoada.dto';
import { HomebrewItemOperacionalDto } from './equipamentos/criar-homebrew-item-operacional.dto';
import { HomebrewItemAmaldicoadoDto } from './equipamentos/criar-homebrew-item-amaldicoado.dto';
import { HomebrewEquipamentoGenericoDto } from './equipamentos/criar-homebrew-generico.dto';

// Tecnicas
import { HomebrewTecnicaDto } from './tecnicas/criar-homebrew-tecnica.dto';

// Outros
import { HomebrewOrigemDto } from './origens/criar-homebrew-origem.dto';
import { HomebrewTrilhaDto } from './trilhas/criar-homebrew-trilha.dto';
import { HomebrewCaminhoDto } from './caminhos/criar-homebrew-caminho.dto';
import { HomebrewClaDto } from './clas/criar-homebrew-cla.dto';
import { HomebrewPoderDto } from './poderes/criar-homebrew-poder.dto';

/**
 * DTO principal para criacao de Homebrew.
 * O campo `tipo` define qual estrutura de `dados` sera validada.
 */
export class CreateHomebrewDto extends CreateHomebrewBaseDto {
  @IsNotEmpty()
  @IsEnum(TipoHomebrewConteudo)
  tipo: TipoHomebrewConteudo;

  @IsNotEmpty()
  dados:
    | HomebrewArmaDto
    | HomebrewProtecaoDto
    | HomebrewAcessorioDto
    | HomebrewMunicaoDto
    | HomebrewExplosivoDto
    | HomebrewFerramentaAmaldicoadaDto
    | HomebrewItemOperacionalDto
    | HomebrewItemAmaldicoadoDto
    | HomebrewEquipamentoGenericoDto
    | HomebrewTecnicaDto
    | HomebrewOrigemDto
    | HomebrewTrilhaDto
    | HomebrewCaminhoDto
    | HomebrewClaDto
    | HomebrewPoderDto;
}
