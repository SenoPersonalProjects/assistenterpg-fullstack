import {
  ValidationException,
  ValoresUnicosException,
} from '../../common/exceptions/validation.exception';
import { HomebrewTecnicaDto } from '../dto/tecnicas/criar-homebrew-tecnica.dto';

export function validateHomebrewTecnicaCustom(dados: HomebrewTecnicaDto): void {
  const habilidades = dados.habilidades;

  if (!habilidades || habilidades.length === 0) {
    throw new ValidationException(
      'T�cnica deve ter pelo menos 1 habilidade',
      'habilidades',
      { minimoHabilidades: 1, recebido: 0 },
      'MIN_ABILITIES_REQUIRED',
    );
  }

  const codigos = habilidades.map((habilidade) => habilidade.codigo);
  const codigosUnicos = new Set(codigos);

  if (codigos.length !== codigosUnicos.size) {
    const duplicados = codigos.filter(
      (codigo, index) => codigos.indexOf(codigo) !== index,
    );
    throw new ValoresUnicosException('habilidades.codigo', duplicados);
  }

  habilidades.forEach((habilidade, index) => {
    const variacoes = habilidade.variacoes ?? [];

    if (variacoes.length === 0) {
      return;
    }

    const nomesVariacoes = variacoes.map((variacao) => variacao.nome);
    const nomesUnicos = new Set(nomesVariacoes);

    if (nomesVariacoes.length !== nomesUnicos.size) {
      const duplicados = nomesVariacoes.filter(
        (nome, i) => nomesVariacoes.indexOf(nome) !== i,
      );

      throw new ValidationException(
        `Habilidade "${habilidade.nome || index}": Nomes de varia��es devem ser �nicos`,
        `habilidades[${index}].variacoes`,
        { duplicados },
        'DUPLICATE_VARIATION_NAMES',
      );
    }
  });
}
