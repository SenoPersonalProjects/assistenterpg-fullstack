// src/homebrews/validators/validate-homebrew-dados.ts

import { plainToInstance } from 'class-transformer';
import type { ClassConstructor } from 'class-transformer';
import { validate, type ValidationError } from 'class-validator';
import { TipoHomebrewConteudo } from '@prisma/client';

import { HomebrewDadosInvalidosException } from '../../common/exceptions/homebrew.exception';
import { HomebrewTipoNaoSuportadoException } from '../../common/exceptions/business.exception';
import { CampoObrigatorioException } from '../../common/exceptions/validation.exception';

import { HomebrewArmaDto } from '../dto/equipamentos/criar-homebrew-arma.dto';
import { HomebrewProtecaoDto } from '../dto/equipamentos/criar-homebrew-protecao.dto';
import { HomebrewAcessorioDto } from '../dto/equipamentos/criar-homebrew-acessorio.dto';
import { HomebrewMunicaoDto } from '../dto/equipamentos/criar-homebrew-municao.dto';
import { HomebrewExplosivoDto } from '../dto/equipamentos/criar-homebrew-explosivo.dto';
import { HomebrewFerramentaAmaldicoadaDto } from '../dto/equipamentos/criar-homebrew-ferramenta-amaldicoada.dto';
import { HomebrewItemOperacionalDto } from '../dto/equipamentos/criar-homebrew-item-operacional.dto';
import { HomebrewItemAmaldicoadoDto } from '../dto/equipamentos/criar-homebrew-item-amaldicoado.dto';
import { HomebrewEquipamentoGenericoDto } from '../dto/equipamentos/criar-homebrew-generico.dto';

import { HomebrewTecnicaDto } from '../dto/tecnicas/criar-homebrew-tecnica.dto';

import { HomebrewOrigemDto } from '../dto/origens/criar-homebrew-origem.dto';
import { HomebrewTrilhaDto } from '../dto/trilhas/criar-homebrew-trilha.dto';
import { HomebrewCaminhoDto } from '../dto/caminhos/criar-homebrew-caminho.dto';
import { HomebrewClaDto } from '../dto/clas/criar-homebrew-cla.dto';
import { HomebrewPoderDto } from '../dto/poderes/criar-homebrew-poder.dto';

const TIPO_EQUIPAMENTO_TO_DTO_MAP: Record<string, ClassConstructor<object>> = {
  ARMA: HomebrewArmaDto,
  PROTECAO: HomebrewProtecaoDto,
  ACESSORIO: HomebrewAcessorioDto,
  MUNICAO: HomebrewMunicaoDto,
  EXPLOSIVO: HomebrewExplosivoDto,
  FERRAMENTA_AMALDICOADA: HomebrewFerramentaAmaldicoadaDto,
  ITEM_OPERACIONAL: HomebrewItemOperacionalDto,
  ITEM_AMALDICOADO: HomebrewItemAmaldicoadoDto,
  GENERICO: HomebrewEquipamentoGenericoDto,
};

const TIPO_TO_DTO_MAP: Record<string, ClassConstructor<object>> = {
  TECNICA_AMALDICOADA: HomebrewTecnicaDto,
  ORIGEM: HomebrewOrigemDto,
  TRILHA: HomebrewTrilhaDto,
  CAMINHO: HomebrewCaminhoDto,
  CLA: HomebrewClaDto,
  PODER_GENERICO: HomebrewPoderDto,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function coletarMensagensErrosValidacao(
  erros: ValidationError[],
  parentPath = '',
): string[] {
  const mensagens: string[] = [];

  for (const erro of erros) {
    const campoAtual = parentPath
      ? `${parentPath}.${erro.property}`
      : erro.property;

    if (erro.constraints) {
      for (const mensagem of Object.values(erro.constraints)) {
        mensagens.push(`${campoAtual}: ${mensagem}`);
      }
    }

    if (erro.children && erro.children.length > 0) {
      mensagens.push(
        ...coletarMensagensErrosValidacao(erro.children, campoAtual),
      );
    }
  }

  return mensagens;
}

export async function validateHomebrewDados(
  tipo: TipoHomebrewConteudo,
  dados: unknown,
): Promise<void> {
  let dtoClass: ClassConstructor<object> | undefined;

  if (tipo === 'EQUIPAMENTO') {
    if (!isRecord(dados) || typeof dados.tipo !== 'string') {
      throw new CampoObrigatorioException('tipo');
    }

    dtoClass = TIPO_EQUIPAMENTO_TO_DTO_MAP[dados.tipo];
    if (!dtoClass) {
      throw new HomebrewTipoNaoSuportadoException(
        dados.tipo,
        Object.keys(TIPO_EQUIPAMENTO_TO_DTO_MAP),
      );
    }
  } else {
    dtoClass = TIPO_TO_DTO_MAP[tipo];
    if (!dtoClass) {
      throw new HomebrewTipoNaoSuportadoException(
        tipo,
        Object.keys(TIPO_TO_DTO_MAP),
      );
    }
  }

  if (!isRecord(dados)) {
    throw new HomebrewDadosInvalidosException([
      'dados: deve ser um objeto valido',
    ]);
  }

  if (!dtoClass) {
    throw new HomebrewTipoNaoSuportadoException(
      tipo,
      Object.keys(TIPO_TO_DTO_MAP),
    );
  }

  const dtoInstance = plainToInstance(dtoClass, dados);
  const errors = await validate(dtoInstance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length > 0) {
    const messages = coletarMensagensErrosValidacao(errors);
    if (messages.length === 0) {
      messages.push('Dados do homebrew invalidos');
    }

    throw new HomebrewDadosInvalidosException(messages);
  }
}
