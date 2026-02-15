// src/homebrews/validators/validate-homebrew-dados.ts

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TipoHomebrewConteudo } from '@prisma/client';

// ✅ Exceções customizadas
import { 
  HomebrewDadosInvalidosException,
  HomebrewTipoNaoSuportadoException 
} from '../../common/exceptions/business.exception';
import { CampoObrigatorioException } from '../../common/exceptions/validation.exception';

// Equipamentos
import { HomebrewArmaDto } from '../dto/equipamentos/criar-homebrew-arma.dto';
import { HomebrewProtecaoDto } from '../dto/equipamentos/criar-homebrew-protecao.dto';
import { HomebrewAcessorioDto } from '../dto/equipamentos/criar-homebrew-acessorio.dto';
import { HomebrewMunicaoDto } from '../dto/equipamentos/criar-homebrew-municao.dto';
import { HomebrewExplosivoDto } from '../dto/equipamentos/criar-homebrew-explosivo.dto';
import { HomebrewFerramentaAmaldicoadaDto } from '../dto/equipamentos/criar-homebrew-ferramenta-amaldicoada.dto';
import { HomebrewItemOperacionalDto } from '../dto/equipamentos/criar-homebrew-item-operacional.dto';
import { HomebrewItemAmaldicoadoDto } from '../dto/equipamentos/criar-homebrew-item-amaldicoado.dto';

// Técnicas
import { HomebrewTecnicaDto } from '../dto/tecnicas/criar-homebrew-tecnica.dto';

// Outros
import { HomebrewOrigemDto } from '../dto/origens/criar-homebrew-origem.dto';
import { HomebrewTrilhaDto } from '../dto/trilhas/criar-homebrew-trilha.dto';
import { HomebrewCaminhoDto } from '../dto/caminhos/criar-homebrew-caminho.dto';
import { HomebrewClaDto } from '../dto/clas/criar-homebrew-cla.dto';
import { HomebrewPoderDto } from '../dto/poderes/criar-homebrew-poder.dto';

/**
 * Mapeia tipo de equipamento (dentro de dados.tipo) para o DTO correspondente
 */
const TIPO_EQUIPAMENTO_TO_DTO_MAP: Record<string, any> = {
  ARMA: HomebrewArmaDto,
  PROTECAO: HomebrewProtecaoDto,
  ACESSORIO: HomebrewAcessorioDto,
  MUNICAO: HomebrewMunicaoDto,
  EXPLOSIVO: HomebrewExplosivoDto,
  FERRAMENTA_AMALDICOADA: HomebrewFerramentaAmaldicoadaDto,
  ITEM_OPERACIONAL: HomebrewItemOperacionalDto,
  ITEM_AMALDICOADO: HomebrewItemAmaldicoadoDto,
};

/**
 * Mapeia tipo de homebrew para o DTO correspondente
 */
const TIPO_TO_DTO_MAP: Record<string, any> = {
  TECNICA_AMALDICOADA: HomebrewTecnicaDto,
  ORIGEM: HomebrewOrigemDto,
  TRILHA: HomebrewTrilhaDto,
  CAMINHO: HomebrewCaminhoDto,
  CLA: HomebrewClaDto,
  PODER_GENERICO: HomebrewPoderDto,
};

/**
 * Valida os dados do homebrew baseado no tipo
 * Usa class-validator através dos DTOs
 */
export async function validateHomebrewDados(
  tipo: TipoHomebrewConteudo,
  dados: any,
): Promise<void> {
  let DtoClass: any;

  // ✅ EQUIPAMENTO precisa verificar o tipo interno
  if (tipo === 'EQUIPAMENTO') {
    if (!dados.tipo) {
      throw new CampoObrigatorioException('tipo'); // ✅ Exceção customizada
    }

    DtoClass = TIPO_EQUIPAMENTO_TO_DTO_MAP[dados.tipo];
    if (!DtoClass) {
      const tiposValidos = Object.keys(TIPO_EQUIPAMENTO_TO_DTO_MAP);
      throw new HomebrewTipoNaoSuportadoException(dados.tipo, tiposValidos); // ✅ Exceção customizada
    }
  } else {
    // ✅ Outros tipos usam mapeamento direto
    DtoClass = TIPO_TO_DTO_MAP[tipo];
    if (!DtoClass) {
      const tiposValidos = Object.keys(TIPO_TO_DTO_MAP);
      throw new HomebrewTipoNaoSuportadoException(tipo, tiposValidos); // ✅ Exceção customizada
    }
  }

  // Converter dados para instância do DTO
  const dtoInstance = plainToInstance(DtoClass, dados);

  // Validar usando class-validator
  const errors = await validate(dtoInstance, {
    whitelist: true, // Remove propriedades não decoradas
    forbidNonWhitelisted: true, // Lança erro se houver propriedades extras
  });

  // Se houver erros, lançar exceção com detalhes
  if (errors.length > 0) {
    const messages = errors.map((error) => {
      const constraints = error.constraints
        ? Object.values(error.constraints).join(', ')
        : 'Validação falhou';
      return `${error.property}: ${constraints}`;
    });

    throw new HomebrewDadosInvalidosException(messages); // ✅ Exceção customizada
  }
}
