// src/components/suplemento/forms/EquipamentoFormFields.tsx

'use client';

import { CategoriaEquipamento } from '@/lib/types/homebrew-enums';
import { EquipamentoBaseFields } from './equipamentos/EquipamentoBaseFields';
import { ArmaFields } from './equipamentos/ArmaFields';
import { ProtecaoFields } from './equipamentos/ProtecaoFields';
import { AcessorioFields } from './equipamentos/AcessorioFields';
import { MunicaoFields } from './equipamentos/MunicaoFields';
import { ExplosivoFields } from './equipamentos/ExplosivoFields';
import { FerramentaAmaldicoadaFields } from './equipamentos/FerramentaAmaldicoadaFields';
import { ItemOperacionalFields } from './equipamentos/ItemOperacionalFields';
import { ItemAmaldicoadoFields } from './equipamentos/ItemAmaldicoadoFields';

type Props = {
  dados: any;
  onChange: (dados: any) => void;
};

export function EquipamentoFormFields({ dados, onChange }: Props) {
  const categoria = dados.categoria as CategoriaEquipamento | undefined;

  // Handler para mudanças nos campos base (categoria, espacos, tipoUso)
  function handleBaseChange(baseDados: any) {
    // Se mudou a categoria, limpa campos específicos
    if (baseDados.categoria && baseDados.categoria !== categoria) {
      onChange({
        ...baseDados,
        // Limpa todos os campos específicos ao trocar categoria
        proficienciaArma: undefined,
        empunhaduras: undefined,
        tipoArma: undefined,
        subtipoDistancia: undefined,
        agil: undefined,
        danos: undefined,
        criticoValor: undefined,
        criticoMultiplicador: undefined,
        alcance: undefined,
        tipoMunicaoCodigo: undefined,
        habilidadeEspecial: undefined,
        proficienciaProtecao: undefined,
        tipoProtecao: undefined,
        bonusDefesa: undefined,
        penalidadeCarga: undefined,
        reducoesDano: undefined,
        tipoAcessorio: undefined,
        periciaBonificada: undefined,
        bonusPericia: undefined,
        requereEmpunhar: undefined,
        maxVestimentas: undefined,
        duracaoCenas: undefined,
        recuperavel: undefined,
        tipoExplosivo: undefined,
        tipoAmaldicoado: undefined,
        armaAmaldicoada: undefined,
        protecaoAmaldicoada: undefined,
        artefatoAmaldicoado: undefined,
        efeito: undefined,
      });
    } else {
      onChange({ ...dados, ...baseDados });
    }
  }

  // Handler para mudanças nos campos específicos
  function handleSpecificChange(specificDados: any) {
    onChange({ ...dados, ...specificDados });
  }

  return (
    <div className="space-y-6">
      {/* Campos base (sempre visíveis) */}
      <EquipamentoBaseFields
        dados={dados}
        onChange={handleBaseChange}
      />

      {/* Campos específicos por categoria */}
      {categoria && (
        <div className="pt-4 border-t border-app-border">
          {categoria === CategoriaEquipamento.ARMA && (
            <ArmaFields dados={dados} onChange={handleSpecificChange} />
          )}

          {categoria === CategoriaEquipamento.PROTECAO && (
            <ProtecaoFields dados={dados} onChange={handleSpecificChange} />
          )}

          {categoria === CategoriaEquipamento.ACESSORIO && (
            <AcessorioFields dados={dados} onChange={handleSpecificChange} />
          )}

          {categoria === CategoriaEquipamento.MUNICAO && (
            <MunicaoFields dados={dados} onChange={handleSpecificChange} />
          )}

          {categoria === CategoriaEquipamento.EXPLOSIVO && (
            <ExplosivoFields dados={dados} onChange={handleSpecificChange} />
          )}

          {categoria === CategoriaEquipamento.FERRAMENTA_AMALDICOADA && (
            <FerramentaAmaldicoadaFields dados={dados} onChange={handleSpecificChange} />
          )}

          {categoria === CategoriaEquipamento.ITEM_OPERACIONAL && (
            <ItemOperacionalFields dados={dados} onChange={handleSpecificChange} />
          )}

          {categoria === CategoriaEquipamento.ITEM_AMALDICOADO && (
            <ItemAmaldicoadoFields dados={dados} onChange={handleSpecificChange} />
          )}
        </div>
      )}

      {/* Mensagem quando nenhuma categoria selecionada */}
      {!categoria && (
        <div className="p-4 border border-app-border rounded-lg bg-app-muted-surface text-center">
          <p className="text-sm text-app-muted">
            Selecione uma categoria de equipamento acima para continuar
          </p>
        </div>
      )}
    </div>
  );
}
