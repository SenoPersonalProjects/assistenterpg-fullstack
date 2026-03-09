'use client';

import { FormEvent, useMemo, useState } from 'react';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import type {
  CreateNpcAmeacaPayload,
  NpcAmeacaAcao,
  NpcAmeacaDetalhe,
  NpcAmeacaPassiva,
  NpcAmeacaPericiaEspecial,
  TamanhoNpcAmeaca,
  TipoFichaNpcAmeaca,
  TipoNpcAmeaca,
} from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

type NpcAmeacaFormProps = {
  initialValues?: NpcAmeacaDetalhe | null;
  onSubmit: (payload: CreateNpcAmeacaPayload) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
};

type PericiaEspecialFormValue = {
  nome: string;
  bonus: string;
  descricao: string;
};

type PassivaFormValue = {
  nome: string;
  descricao: string;
  gatilho: string;
  alcance: string;
  alvo: string;
  duracao: string;
  requisitos: string;
  efeitoGuia: string;
};

type AcaoFormValue = {
  nome: string;
  tipoExecucao: string;
  alcance: string;
  alvo: string;
  duracao: string;
  resistencia: string;
  dtResistencia: string;
  custoPE: string;
  custoEA: string;
  teste: string;
  dano: string;
  critico: string;
  efeito: string;
  requisitos: string;
  descricao: string;
};

type FormState = {
  nome: string;
  descricao: string;
  fichaTipo: TipoFichaNpcAmeaca;
  tipo: TipoNpcAmeaca;
  tamanho: TamanhoNpcAmeaca;
  vd: string;
  agilidade: string;
  forca: string;
  intelecto: string;
  presenca: string;
  vigor: string;
  percepcao: string;
  iniciativa: string;
  fortitude: string;
  reflexos: string;
  vontade: string;
  luta: string;
  jujutsu: string;
  defesa: string;
  pontosVida: string;
  machucado: string;
  deslocamentoMetros: string;
  resistencias: string;
  vulnerabilidades: string;
  usoTatico: string;
  periciasEspeciais: PericiaEspecialFormValue[];
  passivas: PassivaFormValue[];
  acoes: AcaoFormValue[];
};

const fichaOptions: Array<{ value: TipoFichaNpcAmeaca; label: string }> = [
  { value: 'AMEACA', label: 'Ameaca' },
  { value: 'NPC', label: 'NPC' },
];

const tipoOptions: Array<{ value: TipoNpcAmeaca; label: string }> = [
  { value: 'PESSOA', label: 'Pessoa' },
  { value: 'FEITICEIRO', label: 'Feiticeiro' },
  { value: 'MALDICAO', label: 'Maldicao' },
  { value: 'ANIMAL', label: 'Animal' },
  { value: 'HIBRIDO', label: 'Hibrido' },
  { value: 'ESPIRITO', label: 'Espirito' },
  { value: 'OUTRO', label: 'Outro' },
];

const tamanhoOptions: Array<{ value: TamanhoNpcAmeaca; label: string }> = [
  { value: 'MIUDO', label: 'Miudo' },
  { value: 'PEQUENO', label: 'Pequeno' },
  { value: 'MEDIO', label: 'Medio' },
  { value: 'GRANDE', label: 'Grande' },
  { value: 'ENORME', label: 'Enorme' },
];

function paraStringNumero(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return '';
  return String(valor);
}

function paraListaTexto(lista: string[] | undefined): string {
  if (!lista || lista.length === 0) return '';
  return lista.join(', ');
}

function criarEstadoInicial(dados?: NpcAmeacaDetalhe | null): FormState {
  if (!dados) {
    return {
      nome: '',
      descricao: '',
      fichaTipo: 'AMEACA',
      tipo: 'PESSOA',
      tamanho: 'MEDIO',
      vd: '0',
      agilidade: '0',
      forca: '0',
      intelecto: '0',
      presenca: '0',
      vigor: '0',
      percepcao: '0',
      iniciativa: '0',
      fortitude: '0',
      reflexos: '0',
      vontade: '0',
      luta: '0',
      jujutsu: '0',
      defesa: '10',
      pontosVida: '1',
      machucado: '',
      deslocamentoMetros: '6',
      resistencias: '',
      vulnerabilidades: '',
      usoTatico: '',
      periciasEspeciais: [],
      passivas: [],
      acoes: [],
    };
  }

  return {
    nome: dados.nome ?? '',
    descricao: dados.descricao ?? '',
    fichaTipo: dados.fichaTipo,
    tipo: dados.tipo,
    tamanho: dados.tamanho,
    vd: paraStringNumero(dados.vd),
    agilidade: paraStringNumero(dados.agilidade),
    forca: paraStringNumero(dados.forca),
    intelecto: paraStringNumero(dados.intelecto),
    presenca: paraStringNumero(dados.presenca),
    vigor: paraStringNumero(dados.vigor),
    percepcao: paraStringNumero(dados.percepcao),
    iniciativa: paraStringNumero(dados.iniciativa),
    fortitude: paraStringNumero(dados.fortitude),
    reflexos: paraStringNumero(dados.reflexos),
    vontade: paraStringNumero(dados.vontade),
    luta: paraStringNumero(dados.luta),
    jujutsu: paraStringNumero(dados.jujutsu),
    defesa: paraStringNumero(dados.defesa),
    pontosVida: paraStringNumero(dados.pontosVida),
    machucado: paraStringNumero(dados.machucado),
    deslocamentoMetros: paraStringNumero(dados.deslocamentoMetros),
    resistencias: paraListaTexto(dados.resistencias),
    vulnerabilidades: paraListaTexto(dados.vulnerabilidades),
    usoTatico: dados.usoTatico ?? '',
    periciasEspeciais: (dados.periciasEspeciais ?? []).map((pericia) => ({
      nome: pericia.nome ?? '',
      bonus: paraStringNumero(pericia.bonus),
      descricao: pericia.descricao ?? '',
    })),
    passivas: (dados.passivas ?? []).map((passiva) => ({
      nome: passiva.nome ?? '',
      descricao: passiva.descricao ?? '',
      gatilho: passiva.gatilho ?? '',
      alcance: passiva.alcance ?? '',
      alvo: passiva.alvo ?? '',
      duracao: passiva.duracao ?? '',
      requisitos: passiva.requisitos ?? '',
      efeitoGuia: passiva.efeitoGuia ?? '',
    })),
    acoes: (dados.acoes ?? []).map((acao) => ({
      nome: acao.nome ?? '',
      tipoExecucao: acao.tipoExecucao ?? '',
      alcance: acao.alcance ?? '',
      alvo: acao.alvo ?? '',
      duracao: acao.duracao ?? '',
      resistencia: acao.resistencia ?? '',
      dtResistencia: acao.dtResistencia ?? '',
      custoPE: paraStringNumero(acao.custoPE),
      custoEA: paraStringNumero(acao.custoEA),
      teste: acao.teste ?? '',
      dano: acao.dano ?? '',
      critico: acao.critico ?? '',
      efeito: acao.efeito ?? '',
      requisitos: acao.requisitos ?? '',
      descricao: acao.descricao ?? '',
    })),
  };
}

function paraNumeroOpcional(valor: string): number | undefined {
  const limpo = valor.trim();
  if (!limpo) return undefined;
  const convertido = Number(limpo);
  return Number.isFinite(convertido) ? convertido : undefined;
}

function paraNumeroOpcionalNulo(valor: string): number | null | undefined {
  const limpo = valor.trim();
  if (!limpo) return undefined;
  const convertido = Number(limpo);
  return Number.isFinite(convertido) ? convertido : undefined;
}

function quebrarListaPorVirgula(texto: string): string[] {
  return texto
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function mapearPericiasEspeciais(
  pericias: PericiaEspecialFormValue[],
): NpcAmeacaPericiaEspecial[] {
  return pericias
    .map((pericia) => ({
      nome: pericia.nome.trim(),
      bonus: paraNumeroOpcional(pericia.bonus),
      descricao: pericia.descricao.trim() || undefined,
    }))
    .filter((pericia) => pericia.nome.length > 0);
}

function mapearPassivas(passivas: PassivaFormValue[]): NpcAmeacaPassiva[] {
  return passivas
    .map((passiva) => ({
      nome: passiva.nome.trim(),
      descricao: passiva.descricao.trim(),
      gatilho: passiva.gatilho.trim() || undefined,
      alcance: passiva.alcance.trim() || undefined,
      alvo: passiva.alvo.trim() || undefined,
      duracao: passiva.duracao.trim() || undefined,
      requisitos: passiva.requisitos.trim() || undefined,
      efeitoGuia: passiva.efeitoGuia.trim() || undefined,
    }))
    .filter((passiva) => passiva.nome.length > 0 && passiva.descricao.length > 0);
}

function mapearAcoes(acoes: AcaoFormValue[]): NpcAmeacaAcao[] {
  return acoes
    .map((acao) => ({
      nome: acao.nome.trim(),
      tipoExecucao: acao.tipoExecucao.trim() || undefined,
      alcance: acao.alcance.trim() || undefined,
      alvo: acao.alvo.trim() || undefined,
      duracao: acao.duracao.trim() || undefined,
      resistencia: acao.resistencia.trim() || undefined,
      dtResistencia: acao.dtResistencia.trim() || undefined,
      custoPE: paraNumeroOpcional(acao.custoPE),
      custoEA: paraNumeroOpcional(acao.custoEA),
      teste: acao.teste.trim() || undefined,
      dano: acao.dano.trim() || undefined,
      critico: acao.critico.trim() || undefined,
      efeito: acao.efeito.trim() || undefined,
      requisitos: acao.requisitos.trim() || undefined,
      descricao: acao.descricao.trim() || undefined,
    }))
    .filter((acao) => acao.nome.length > 0);
}

function classeGridBase() {
  return 'grid gap-3 sm:grid-cols-2 lg:grid-cols-4';
}

function criarPresetAkane(): FormState {
  const base = criarEstadoInicial(null);
  return {
    ...base,
    nome: 'Akane Fujimoto',
    descricao:
      'Civil vulneravel em estado de trauma severo, foco narrativo de resgate.',
    fichaTipo: 'NPC',
    tipo: 'PESSOA',
    tamanho: 'MEDIO',
    vd: '15',
    agilidade: '1',
    forca: '0',
    intelecto: '1',
    presenca: '2',
    vigor: '1',
    percepcao: '2',
    iniciativa: '3',
    fortitude: '3',
    reflexos: '3',
    vontade: '4',
    luta: '2',
    jujutsu: '0',
    defesa: '12',
    pontosVida: '22',
    machucado: '11',
    deslocamentoMetros: '6',
    vulnerabilidades: 'dano fisico',
    periciasEspeciais: [
      { nome: 'Empatia', bonus: '6', descricao: '' },
      { nome: 'Intuicao', bonus: '4', descricao: '' },
      { nome: 'Sobrevivencia', bonus: '3', descricao: '' },
    ],
    passivas: [
      {
        nome: 'Amor distorcido',
        descricao:
          'Nao ataca o progenito; prioriza protege-lo em qualquer conflito.',
        gatilho: 'Ao escolher alvo',
        alcance: '',
        alvo: '',
        duracao: 'Cena inteira',
        requisitos: 'Teste de Vontade DT 25 para agir contra esse impulso',
        efeitoGuia: '',
      },
      {
        nome: 'Fragil',
        descricao:
          'Recebe +2 de dano fisico e pode ficar inconsciente com dano massivo.',
        gatilho: 'Quando recebe dano',
        alcance: '',
        alvo: '',
        duracao: 'Sempre ativa',
        requisitos: '',
        efeitoGuia: '',
      },
    ],
    acoes: [
      {
        nome: 'Empurrar/defesa desesperada',
        tipoExecucao: 'PADRAO',
        alcance: 'Corpo a corpo',
        alvo: '1 criatura',
        duracao: 'Instantaneo',
        resistencia: '',
        dtResistencia: '',
        custoPE: '',
        custoEA: '',
        teste: '1d20 +2',
        dano: '1d3 impacto',
        critico: '',
        efeito:
          'Nao e golpe letal; tenta apenas afastar para ganhar tempo.',
        requisitos: '',
        descricao: '',
      },
      {
        nome: 'Gritar por ajuda',
        tipoExecucao: 'LIVRE',
        alcance: 'Curto',
        alvo: 'Aliado narrativo',
        duracao: 'Ate o proximo ataque do alvo',
        resistencia: '',
        dtResistencia: '',
        custoPE: '',
        custoEA: '',
        teste: '',
        dano: '',
        critico: '',
        efeito:
          'Concede bonus narrativo ao progenito quando alguem ameaca Akane.',
        requisitos: '',
        descricao: '',
      },
    ],
    usoTatico:
      'Objetivo de resgate e dilema moral; nao deve ser tratada como combatente.',
  };
}

function criarPresetTaro(): FormState {
  const base = criarEstadoInicial(null);
  return {
    ...base,
    nome: 'Taro Ishikawa',
    descricao:
      'Fazendeiro robusto, potencial aliado ou problema, movido por vinganca.',
    fichaTipo: 'NPC',
    tipo: 'PESSOA',
    tamanho: 'MEDIO',
    vd: '35',
    agilidade: '1',
    forca: '3',
    intelecto: '1',
    presenca: '2',
    vigor: '3',
    percepcao: '6',
    iniciativa: '4',
    fortitude: '7',
    reflexos: '4',
    vontade: '5',
    luta: '7',
    jujutsu: '0',
    defesa: '16',
    pontosVida: '45',
    machucado: '22',
    deslocamentoMetros: '9',
    periciasEspeciais: [
      { nome: 'Intimidacao', bonus: '6', descricao: '' },
      { nome: 'Pontaria', bonus: '8', descricao: '' },
      { nome: 'Sobrevivencia', bonus: '7', descricao: '' },
      { nome: 'Luta', bonus: '7', descricao: '' },
    ],
    passivas: [
      {
        nome: 'Raiva acumulada',
        descricao:
          'Ao ver o progenito, precisa passar em Vontade DT 18 para manter controle.',
        gatilho: 'Primeiro contato com o progenito',
        alcance: '',
        alvo: '',
        duracao: '',
        requisitos: 'Falha ativa Furia camponesa',
        efeitoGuia: '',
      },
      {
        nome: 'Furia camponesa',
        descricao:
          '+2 ataque/dano, -2 defesa, nao recua ate fim da cena ou morte do alvo.',
        gatilho: 'Condicional',
        alcance: '',
        alvo: '',
        duracao: 'Ate fim da cena',
        requisitos: '',
        efeitoGuia: '',
      },
      {
        nome: 'Atirador de fazenda',
        descricao:
          'Ignora penalidade de distancia em alcance medio com a espingarda.',
        gatilho: 'Ataques a distancia',
        alcance: '',
        alvo: '',
        duracao: 'Sempre ativa',
        requisitos: '',
        efeitoGuia: '',
      },
    ],
    acoes: [
      {
        nome: 'Espingarda velha',
        tipoExecucao: 'PADRAO',
        alcance: 'Medio',
        alvo: '1 criatura',
        duracao: 'Instantaneo',
        resistencia: '',
        dtResistencia: '',
        custoPE: '',
        custoEA: '',
        teste: '2d20 +8',
        dano: '2d10 +5 balistico',
        critico: '20/x3',
        efeito: 'Possui 2 tiros carregados; recarregar exige acao completa.',
        requisitos: '',
        descricao: '',
      },
      {
        nome: 'Soco pesado',
        tipoExecucao: 'PADRAO',
        alcance: 'Corpo a corpo',
        alvo: '1 criatura',
        duracao: 'Instantaneo',
        resistencia: '',
        dtResistencia: '',
        custoPE: '',
        custoEA: '',
        teste: '2d20 +7',
        dano: '1d8 +6 impacto',
        critico: '',
        efeito: '',
        requisitos: '',
        descricao: '',
      },
      {
        nome: 'Derrubar com coronhada',
        tipoExecucao: 'PADRAO',
        alcance: 'Corpo a corpo',
        alvo: '1 criatura',
        duracao: 'Instantaneo',
        resistencia: 'Reflexos',
        dtResistencia: '18',
        custoPE: '',
        custoEA: '',
        teste: '2d20 +7',
        dano: '1d6 +6 impacto',
        critico: '',
        efeito: 'Falha na resistencia deixa alvo Caido.',
        requisitos: '',
        descricao: '',
      },
    ],
    usoTatico:
      'Bom aliado em combate aberto, mas pode agir de forma impulsiva em cenas emocionais.',
  };
}

export function NpcAmeacaForm({
  initialValues = null,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar ficha',
}: NpcAmeacaFormProps) {
  const [form, setForm] = useState<FormState>(() => criarEstadoInicial(initialValues));
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const isEdicao = useMemo(() => !!initialValues, [initialValues]);

  function atualizarCampo<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  function atualizarPericiaEspecial(index: number, parcial: Partial<PericiaEspecialFormValue>) {
    setForm((prev) => {
      const lista = [...prev.periciasEspeciais];
      lista[index] = { ...lista[index], ...parcial };
      return { ...prev, periciasEspeciais: lista };
    });
  }

  function atualizarPassiva(index: number, parcial: Partial<PassivaFormValue>) {
    setForm((prev) => {
      const lista = [...prev.passivas];
      lista[index] = { ...lista[index], ...parcial };
      return { ...prev, passivas: lista };
    });
  }

  function atualizarAcao(index: number, parcial: Partial<AcaoFormValue>) {
    setForm((prev) => {
      const lista = [...prev.acoes];
      lista[index] = { ...lista[index], ...parcial };
      return { ...prev, acoes: lista };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    const nome = form.nome.trim();
    if (!nome) {
      setErro('Informe o nome da ficha.');
      return;
    }

    const payload: CreateNpcAmeacaPayload = {
      nome,
      descricao: form.descricao.trim() || undefined,
      fichaTipo: form.fichaTipo,
      tipo: form.tipo,
      tamanho: form.tamanho,
      vd: paraNumeroOpcional(form.vd),
      agilidade: paraNumeroOpcional(form.agilidade),
      forca: paraNumeroOpcional(form.forca),
      intelecto: paraNumeroOpcional(form.intelecto),
      presenca: paraNumeroOpcional(form.presenca),
      vigor: paraNumeroOpcional(form.vigor),
      percepcao: paraNumeroOpcional(form.percepcao),
      iniciativa: paraNumeroOpcional(form.iniciativa),
      fortitude: paraNumeroOpcional(form.fortitude),
      reflexos: paraNumeroOpcional(form.reflexos),
      vontade: paraNumeroOpcional(form.vontade),
      luta: paraNumeroOpcional(form.luta),
      jujutsu: paraNumeroOpcional(form.jujutsu),
      defesa: paraNumeroOpcional(form.defesa),
      pontosVida: paraNumeroOpcional(form.pontosVida),
      machucado: paraNumeroOpcionalNulo(form.machucado),
      deslocamentoMetros: paraNumeroOpcional(form.deslocamentoMetros),
      resistencias: quebrarListaPorVirgula(form.resistencias),
      vulnerabilidades: quebrarListaPorVirgula(form.vulnerabilidades),
      periciasEspeciais: mapearPericiasEspeciais(form.periciasEspeciais),
      passivas: mapearPassivas(form.passivas),
      acoes: mapearAcoes(form.acoes),
      usoTatico: form.usoTatico.trim() || undefined,
    };

    try {
      setSalvando(true);
      await onSubmit(payload);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {erro && <ErrorAlert message={erro} />}

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-app-fg">Dados gerais</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setForm(criarPresetAkane())}
          >
            Carregar modelo Akane
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setForm(criarPresetTaro())}
          >
            Carregar modelo Taro
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setForm(criarEstadoInicial(null))}
          >
            Limpar ficha
          </Button>
        </div>
        <p className="text-xs text-app-muted">
          Modelos aceleram o preenchimento e servem apenas como ponto de partida.
        </p>
        <div className={classeGridBase()}>
          <Input
            label="Nome"
            value={form.nome}
            onChange={(e) => atualizarCampo('nome', e.target.value)}
            placeholder="Ex.: Akane Fujimoto"
            required
            className="lg:col-span-2"
          />
          <Select
            label="Tipo da ficha"
            value={form.fichaTipo}
            onChange={(e) =>
              atualizarCampo('fichaTipo', e.target.value as TipoFichaNpcAmeaca)
            }
          >
            {fichaOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            label="Tipo"
            value={form.tipo}
            onChange={(e) => atualizarCampo('tipo', e.target.value as TipoNpcAmeaca)}
          >
            {tipoOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            label="Tamanho"
            value={form.tamanho}
            onChange={(e) =>
              atualizarCampo('tamanho', e.target.value as TamanhoNpcAmeaca)
            }
          >
            {tamanhoOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Input
            type="number"
            label="VD (placeholder)"
            value={form.vd}
            onChange={(e) => atualizarCampo('vd', e.target.value)}
          />
        </div>
        <Textarea
          label="Descricao"
          value={form.descricao}
          onChange={(e) => atualizarCampo('descricao', e.target.value)}
          rows={4}
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-app-fg">Atributos</h2>
        <div className={classeGridBase()}>
          <Input
            type="number"
            label="AGI"
            value={form.agilidade}
            onChange={(e) => atualizarCampo('agilidade', e.target.value)}
          />
          <Input
            type="number"
            label="FOR"
            value={form.forca}
            onChange={(e) => atualizarCampo('forca', e.target.value)}
          />
          <Input
            type="number"
            label="INT"
            value={form.intelecto}
            onChange={(e) => atualizarCampo('intelecto', e.target.value)}
          />
          <Input
            type="number"
            label="PRE"
            value={form.presenca}
            onChange={(e) => atualizarCampo('presenca', e.target.value)}
          />
          <Input
            type="number"
            label="VIG"
            value={form.vigor}
            onChange={(e) => atualizarCampo('vigor', e.target.value)}
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-app-fg">Pericias principais</h2>
        <div className={classeGridBase()}>
          <Input
            type="number"
            label="Percepcao"
            value={form.percepcao}
            onChange={(e) => atualizarCampo('percepcao', e.target.value)}
          />
          <Input
            type="number"
            label="Iniciativa"
            value={form.iniciativa}
            onChange={(e) => atualizarCampo('iniciativa', e.target.value)}
          />
          <Input
            type="number"
            label="Fortitude"
            value={form.fortitude}
            onChange={(e) => atualizarCampo('fortitude', e.target.value)}
          />
          <Input
            type="number"
            label="Reflexos"
            value={form.reflexos}
            onChange={(e) => atualizarCampo('reflexos', e.target.value)}
          />
          <Input
            type="number"
            label="Vontade"
            value={form.vontade}
            onChange={(e) => atualizarCampo('vontade', e.target.value)}
          />
          <Input
            type="number"
            label="Luta"
            value={form.luta}
            onChange={(e) => atualizarCampo('luta', e.target.value)}
          />
          <Input
            type="number"
            label="Jujutsu"
            value={form.jujutsu}
            onChange={(e) => atualizarCampo('jujutsu', e.target.value)}
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-app-fg">Defesa e recursos</h2>
        <div className={classeGridBase()}>
          <Input
            type="number"
            label="Defesa"
            value={form.defesa}
            onChange={(e) => atualizarCampo('defesa', e.target.value)}
          />
          <Input
            type="number"
            label="Pontos de vida"
            value={form.pontosVida}
            onChange={(e) => atualizarCampo('pontosVida', e.target.value)}
          />
          <Input
            type="number"
            label="Machucado"
            value={form.machucado}
            onChange={(e) => atualizarCampo('machucado', e.target.value)}
            placeholder="Opcional"
          />
          <Input
            type="number"
            label="Deslocamento (m)"
            value={form.deslocamentoMetros}
            onChange={(e) => atualizarCampo('deslocamentoMetros', e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Resistencias (separadas por virgula)"
            value={form.resistencias}
            onChange={(e) => atualizarCampo('resistencias', e.target.value)}
            placeholder="Ex.: fogo, corte, mental"
          />
          <Input
            label="Vulnerabilidades (separadas por virgula)"
            value={form.vulnerabilidades}
            onChange={(e) => atualizarCampo('vulnerabilidades', e.target.value)}
            placeholder="Ex.: energia positiva, eletrico"
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-app-fg">Pericias especiais</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              atualizarCampo('periciasEspeciais', [
                ...form.periciasEspeciais,
                { nome: '', bonus: '', descricao: '' },
              ])
            }
          >
            <Icon name="add" className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {form.periciasEspeciais.length === 0 ? (
          <p className="text-sm text-app-muted">Sem pericias especiais.</p>
        ) : (
          <div className="space-y-3">
            {form.periciasEspeciais.map((pericia, index) => (
              <div
                key={`pericia-especial-${index}`}
                className="rounded border border-app-border p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-app-muted">Pericia #{index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() =>
                      atualizarCampo(
                        'periciasEspeciais',
                        form.periciasEspeciais.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Icon name="delete" className="w-4 h-4 mr-1" />
                    Remover
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input
                    label="Nome"
                    value={pericia.nome}
                    onChange={(e) =>
                      atualizarPericiaEspecial(index, { nome: e.target.value })
                    }
                  />
                  <Input
                    type="number"
                    label="Bonus"
                    value={pericia.bonus}
                    onChange={(e) =>
                      atualizarPericiaEspecial(index, { bonus: e.target.value })
                    }
                  />
                  <Input
                    label="Descricao curta"
                    value={pericia.descricao}
                    onChange={(e) =>
                      atualizarPericiaEspecial(index, { descricao: e.target.value })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-app-fg">Passivas</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              atualizarCampo('passivas', [
                ...form.passivas,
                {
                  nome: '',
                  descricao: '',
                  gatilho: '',
                  alcance: '',
                  alvo: '',
                  duracao: '',
                  requisitos: '',
                  efeitoGuia: '',
                },
              ])
            }
          >
            <Icon name="add" className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
        <p className="text-xs text-app-muted">
          Passivas funcionam como guia narrativo/mecanico para o mestre e nao sao aplicadas automaticamente pelo sistema.
        </p>

        {form.passivas.length === 0 ? (
          <p className="text-sm text-app-muted">Sem passivas cadastradas.</p>
        ) : (
          <div className="space-y-3">
            {form.passivas.map((passiva, index) => (
              <div
                key={`passiva-${index}`}
                className="rounded border border-app-border p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-app-muted">Passiva #{index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() =>
                      atualizarCampo(
                        'passivas',
                        form.passivas.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Icon name="delete" className="w-4 h-4 mr-1" />
                    Remover
                  </Button>
                </div>
                <Input
                  label="Nome"
                  value={passiva.nome}
                  onChange={(e) => atualizarPassiva(index, { nome: e.target.value })}
                />
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <Input
                    label="Gatilho (opcional)"
                    value={passiva.gatilho}
                    onChange={(e) =>
                      atualizarPassiva(index, { gatilho: e.target.value })
                    }
                    placeholder="Ex.: Ao receber dano"
                  />
                  <Input
                    label="Alcance (opcional)"
                    value={passiva.alcance}
                    onChange={(e) =>
                      atualizarPassiva(index, { alcance: e.target.value })
                    }
                  />
                  <Input
                    label="Alvo (opcional)"
                    value={passiva.alvo}
                    onChange={(e) => atualizarPassiva(index, { alvo: e.target.value })}
                  />
                  <Input
                    label="Duracao (opcional)"
                    value={passiva.duracao}
                    onChange={(e) =>
                      atualizarPassiva(index, { duracao: e.target.value })
                    }
                  />
                  <Input
                    label="Requisitos (opcional)"
                    value={passiva.requisitos}
                    onChange={(e) =>
                      atualizarPassiva(index, { requisitos: e.target.value })
                    }
                  />
                </div>
                <Textarea
                  label="Descricao"
                  value={passiva.descricao}
                  onChange={(e) =>
                    atualizarPassiva(index, { descricao: e.target.value })
                  }
                  rows={3}
                />
                <Textarea
                  label="Efeito guia (opcional)"
                  value={passiva.efeitoGuia}
                  onChange={(e) =>
                    atualizarPassiva(index, { efeitoGuia: e.target.value })
                  }
                  rows={2}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-app-fg">Acoes</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              atualizarCampo('acoes', [
                ...form.acoes,
                {
                  nome: '',
                  tipoExecucao: '',
                  alcance: '',
                  alvo: '',
                  duracao: '',
                  resistencia: '',
                  dtResistencia: '',
                  custoPE: '',
                  custoEA: '',
                  teste: '',
                  dano: '',
                  critico: '',
                  efeito: '',
                  requisitos: '',
                  descricao: '',
                },
              ])
            }
          >
            <Icon name="add" className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
        <p className="text-xs text-app-muted">
          Campos de acao seguem o padrao de habilidades, mas servem como referencia de mesa (sem automacao de efeitos).
        </p>

        {form.acoes.length === 0 ? (
          <p className="text-sm text-app-muted">Sem acoes cadastradas.</p>
        ) : (
          <div className="space-y-3">
            {form.acoes.map((acao, index) => (
              <div
                key={`acao-${index}`}
                className="rounded border border-app-border p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-app-muted">Acao #{index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() =>
                      atualizarCampo(
                        'acoes',
                        form.acoes.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Icon name="delete" className="w-4 h-4 mr-1" />
                    Remover
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <Input
                    label="Nome"
                    value={acao.nome}
                    onChange={(e) => atualizarAcao(index, { nome: e.target.value })}
                  />
                  <Input
                    label="Execucao"
                    value={acao.tipoExecucao}
                    onChange={(e) =>
                      atualizarAcao(index, { tipoExecucao: e.target.value })
                    }
                    placeholder="Ex.: PADRAO"
                  />
                  <Input
                    label="Alcance"
                    value={acao.alcance}
                    onChange={(e) => atualizarAcao(index, { alcance: e.target.value })}
                  />
                  <Input
                    label="Alvo"
                    value={acao.alvo}
                    onChange={(e) => atualizarAcao(index, { alvo: e.target.value })}
                    placeholder="Ex.: 1 criatura"
                  />
                  <Input
                    label="Duracao"
                    value={acao.duracao}
                    onChange={(e) => atualizarAcao(index, { duracao: e.target.value })}
                    placeholder="Ex.: Instantaneo"
                  />
                  <Input
                    label="Resistencia"
                    value={acao.resistencia}
                    onChange={(e) =>
                      atualizarAcao(index, { resistencia: e.target.value })
                    }
                    placeholder="Ex.: Reflexos"
                  />
                  <Input
                    label="DT resistencia"
                    value={acao.dtResistencia}
                    onChange={(e) =>
                      atualizarAcao(index, { dtResistencia: e.target.value })
                    }
                    placeholder="Ex.: 18"
                  />
                  <Input
                    type="number"
                    label="Custo PE"
                    value={acao.custoPE}
                    onChange={(e) => atualizarAcao(index, { custoPE: e.target.value })}
                    placeholder="Opcional"
                  />
                  <Input
                    type="number"
                    label="Custo EA"
                    value={acao.custoEA}
                    onChange={(e) => atualizarAcao(index, { custoEA: e.target.value })}
                    placeholder="Opcional"
                  />
                  <Input
                    label="Teste"
                    value={acao.teste}
                    onChange={(e) => atualizarAcao(index, { teste: e.target.value })}
                  />
                  <Input
                    label="Dano"
                    value={acao.dano}
                    onChange={(e) => atualizarAcao(index, { dano: e.target.value })}
                  />
                  <Input
                    label="Critico"
                    value={acao.critico}
                    onChange={(e) => atualizarAcao(index, { critico: e.target.value })}
                    placeholder="Ex.: 20/x3"
                  />
                </div>
                <Textarea
                  label="Efeito"
                  value={acao.efeito}
                  onChange={(e) => atualizarAcao(index, { efeito: e.target.value })}
                  rows={2}
                />
                <Input
                  label="Requisitos (opcional)"
                  value={acao.requisitos}
                  onChange={(e) => atualizarAcao(index, { requisitos: e.target.value })}
                  placeholder="Ex.: precisa de cobertura"
                />
                <Textarea
                  label="Descricao adicional"
                  value={acao.descricao}
                  onChange={(e) => atualizarAcao(index, { descricao: e.target.value })}
                  rows={2}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <Textarea
          label="Uso tatico e observacoes"
          value={form.usoTatico}
          onChange={(e) => atualizarCampo('usoTatico', e.target.value)}
          rows={4}
        />
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={salvando}>
          Cancelar
        </Button>
        <Button type="submit" disabled={salvando}>
          {salvando ? 'Salvando...' : submitLabel}
        </Button>
      </div>

      {isEdicao && (
        <p className="text-xs text-app-muted">
          Alteracoes salvas apenas nesta ficha de NPC/Ameaca.
        </p>
      )}
    </form>
  );
}
