// src/homebrews/dto/equipamentos/criar-homebrew-item-amaldicoado.dto.ts

import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { TipoAmaldicoado } from '@prisma/client';
import { EquipamentoBaseDto } from '../base/equipamento-base.dto';

/**
 * DTO para homebrews de ITEM AMALDIÇOADO
 * Itens com propriedades amaldiçoadas genéricas
 * Ex: Anátema Amaldiçoada, Âncora de Barreira, Guia de Maldições
 *
 * DIFERENÇA de FERRAMENTA_AMALDICOADA:
 * - FERRAMENTA = Arma/Proteção/Artefato amaldiçoado (estrutura complexa)
 * - ITEM = Item genérico com efeito amaldiçoado (estrutura simples)
 */
export class HomebrewItemAmaldicoadoDto extends EquipamentoBaseDto {
  @IsNotEmpty()
  @IsEnum(TipoAmaldicoado)
  tipoAmaldicoado: TipoAmaldicoado; // ITEM (geralmente)

  @IsNotEmpty()
  @IsString()
  efeito: string; // Descrição completa do efeito amaldiçoado
}
