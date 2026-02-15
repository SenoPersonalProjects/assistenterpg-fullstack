'use client';

import type { AlinhamentoCatalogo } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Icon } from '@/components/ui/Icon';
import { InfoTile } from '@/components/ui/InfoTile';
import { getGrauXamaPorPrestigio } from '@/lib/utils/prestigio';

type Props = {
  nome: string;
  nivel: number;
  estudouEscolaTecnica: boolean;
  idade: number | null;
  prestigioBase: number;
  alinhamentoId: string;
  alinhamentos: AlinhamentoCatalogo[];
  background: string | null;
  erroNome?: string;

  onChangeNome: (v: string) => void;
  onChangeNivel: (v: number) => void;
  onChangeEstudouEscolaTecnica: (v: boolean) => void;
  onChangeIdade: (v: number | null) => void;
  onChangePrestigioBase: (v: number) => void;
  onChangeAlinhamentoId: (v: string) => void;
  onChangeBackground: (v: string | null) => void;
};

export function PersonagemBaseStepDadosBasicos({
  nome,
  nivel,
  estudouEscolaTecnica,
  idade,
  prestigioBase,
  alinhamentoId,
  alinhamentos,
  background,
  erroNome,
  onChangeNome,
  onChangeNivel,
  onChangeEstudouEscolaTecnica,
  onChangeIdade,
  onChangePrestigioBase,
  onChangeAlinhamentoId,
  onChangeBackground,
}: Props) {
  const grauXama = getGrauXamaPorPrestigio(prestigioBase);

  const alinhamentoSelecionado = alinhamentos.find(
    (a) => String(a.id) === alinhamentoId,
  );


  const nivelLabel =
    nivel <= 4
      ? 'Iniciante'
      : nivel <= 9
        ? 'Experiente'
        : nivel <= 14
          ? 'Veterano'
          : 'Lendário';

  const idadeAviso =
    idade != null && idade > 0
      ? idade < 12
        ? 'Personagem muito jovem para missões de alto risco.'
        : idade > 65
          ? 'Personagem em idade avançada, pode exigir justificativa narrativa.'
          : null
      : null;

  const prestigioAltoParaNivel =
    prestigioBase >= 5 && nivel <= 3;

  return (
    <div className="space-y-6">
      {/* Informações básicas */}
      <div>
        <h3 className="text-sm font-semibold text-app-fg mb-3 flex items-center gap-2">
          <Icon name="id" className="w-4 h-4 text-app-primary" />
          Informações básicas
        </h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            label="Nome do personagem *"
            value={nome}
            onChange={(e) => onChangeNome(e.target.value)}
            error={erroNome}
            placeholder="Ex: Yuji Itadori"
            autoFocus
            required
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-app-fg">
              Nível *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={20}
                value={nivel}
                onChange={(e) => onChangeNivel(Number(e.target.value))}
                className="flex-1 accent-app-primary"
                aria-describedby="nivel-help"
              />
              <InfoTile
                label="Nível atual"
                value={
                  <span className="font-semibold text-app-primary">
                    {nivel}
                  </span>
                }
              />
            </div>
            <p
              id="nivel-help"
              className="text-xs text-app-muted"
            >
              {nivelLabel} — arraste para ajustar o nível inicial
            </p>
          </div>

          <Input
            label="Idade (opcional)"
            type="number"
            min={0}
            value={idade != null ? String(idade) : ''}
            onChange={(e) => {
              const val = e.target.value;
              const num = Number(val);
              onChangeIdade(
                val === '' ? null : Math.max(0, num),
              );
            }}
            placeholder="Ex: 16"
            helperText={idadeAviso ?? undefined}
          />

          <div className="space-y-1">
            <Select
              label="Alinhamento (opcional)"
              value={alinhamentoId}
              onChange={(e) =>
                onChangeAlinhamentoId(e.target.value)
              }
            >
              <option value="">
                Selecione um alinhamento
              </option>
              {alinhamentos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </Select>

            {alinhamentoSelecionado?.descricao && (
              <p className="text-xs text-app-muted">
                {alinhamentoSelecionado.descricao}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Prestígio */}
      <div>
        <h3 className="text-sm font-semibold text-app-fg mb-3 flex items-center gap-2">
          <Icon name="star" className="w-4 h-4 text-app-primary" />
          Prestígio e reputação
        </h3>

        <div className="space-y-3">
          <Input
            label="Prestígio geral base"
            type="number"
            min={0}
            value={String(prestigioBase)}
            onChange={(e) =>
              onChangePrestigioBase(
                Math.max(0, Number(e.target.value) || 0),
              )
            }
            helperText="Define seu Grau de Xamã e limite de crédito inicial."
          />

          {prestigioAltoParaNivel && (
            <p className="text-xs text-app-warning">
              Prestígio elevado para um personagem iniciante pode
              exigir justificativa narrativa.
            </p>
          )}

          {prestigioBase > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoTile
                label="Grau de Xamã"
                value={
                  <span className="text-app-success">
                    {grauXama.nome}
                  </span>
                }
              />
              <InfoTile
                label="Limite de crédito"
                value={grauXama.limiteCredito}
              />
            </div>
          )}
        </div>
      </div>

      {/* Background */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-app-fg flex items-center gap-2">
          <Icon name="story" className="w-4 h-4 text-app-primary" />
          História do personagem
        </h3>

        <Textarea
          label="Background (opcional)"
          value={background ?? ''}
          onChange={(e) =>
            onChangeBackground(e.target.value || null)
          }
          placeholder="Conte a história do seu personagem, suas motivações, origem..."
          rows={4}
          helperText="Ajuda o mestre a criar uma narrativa mais rica"
          maxLength={5000}
        />

        <p className="text-xs text-app-muted text-right">
          {(background?.length ?? 0)} / 5000 caracteres
        </p>
      </div>

      {/* Formação acadêmica */}
      <div>
        <h3 className="text-sm font-semibold text-app-fg mb-3 flex items-center gap-2">
          <Icon name="school" className="w-4 h-4 text-app-primary" />
          Formação acadêmica
        </h3>

        <div
          className={`rounded-lg border-2 p-4 transition-all ${estudouEscolaTecnica
              ? 'border-app-success bg-app-success/5'
              : 'border-app-border bg-app-surface'
            }`}
        >
          <Checkbox
            label="Estudou na Escola Técnica de Jujutsu"
            checked={estudouEscolaTecnica}
            onChange={(e) =>
              onChangeEstudouEscolaTecnica(e.target.checked)
            }
          />

          {estudouEscolaTecnica && (
            <div className="mt-3 p-3 rounded-lg bg-app-success/10 border border-app-success/30">
              <p className="text-sm text-app-success flex items-center gap-2">
                <Icon name="check" className="h-4 w-4" />
                Seu personagem recebeu treinamento formal em
                Jujutsu.
              </p>
              <p className="text-xs text-app-success mt-1">
                <strong>Bônus mecânico:</strong> +1 grau em Técnica
                Amaldiçoada • Treinamento em Jujutsu
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
