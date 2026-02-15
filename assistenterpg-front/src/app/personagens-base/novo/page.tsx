// app/personagens-base/novo/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  apiGetClasses,
  apiGetClas,
  apiGetOrigens,
  apiGetProficiencias,
  apiGetTiposGrau,
  apiGetTecnicasInatas,
  apiGetTrilhasDaClasse,
  apiGetCaminhosDaTrilha,
  apiCreatePersonagemBase,
  apiGetAlinhamentos,
  apiGetPericias,
  apiGetEquipamentos,
  apiGetModificacoes,
  ClasseCatalogo,
  ClaCatalogo,
  OrigemCatalogo,
  ProficienciaCatalogo,
  TipoGrauCatalogo,
  TecnicaInataCatalogo,
  TrilhaCatalogo,
  CaminhoCatalogo,
  CreatePersonagemBasePayload,
  AlinhamentoCatalogo,
  PericiaCatalogo,
  EquipamentoCatalogo,
  ModificacaoCatalogo,
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Button } from '@/components/ui/Button';
import { PersonagemBaseWizard } from '@/components/personagem-base/create/wizard/PersonagemBaseWizard';

export default function NovoPersonagemBasePage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();

  const [classes, setClasses] = useState<ClasseCatalogo[]>([]);
  const [clas, setClas] = useState<ClaCatalogo[]>([]);
  const [origens, setOrigens] = useState<OrigemCatalogo[]>([]);
  const [proficiencias, setProficiencias] = useState<ProficienciaCatalogo[]>([]);
  const [tiposGrau, setTiposGrau] = useState<TipoGrauCatalogo[]>([]);
  const [tecnicasInatas, setTecnicasInatas] = useState<TecnicaInataCatalogo[]>([]);
  const [alinhamentos, setAlinhamentos] = useState<AlinhamentoCatalogo[]>([]);
  const [pericias, setPericias] = useState<PericiaCatalogo[]>([]);
  const [equipamentos, setEquipamentos] = useState<EquipamentoCatalogo[]>([]);
  const [modificacoes, setModificacoes] = useState<ModificacaoCatalogo[]>([]);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && usuario) {

      async function carregarCatalogos() {
        try {
          setErro(null);
          const [
            classesRes,
            clasRes,
            origensRes,
            profsRes,
            tiposGrauRes,
            tecnicasInatasRes,
            alinhamentosRes,
            periciasRes,
            equipamentosRes,
            modificacoesRes,
          ] = await Promise.all([
            apiGetClasses(),
            apiGetClas(),
            apiGetOrigens(),
            apiGetProficiencias(),
            apiGetTiposGrau(),
            apiGetTecnicasInatas(),
            apiGetAlinhamentos(),
            apiGetPericias(),
            apiGetEquipamentos(),
            apiGetModificacoes(),
          ]);

          setClasses(classesRes);
          setClas(clasRes);
          setOrigens(origensRes);
          setProficiencias(profsRes);
          setTiposGrau(tiposGrauRes);
          setTecnicasInatas(tecnicasInatasRes);
          setAlinhamentos(alinhamentosRes);
          setPericias(periciasRes);
          setEquipamentos(equipamentosRes.items);
          setModificacoes(modificacoesRes.items);
        } catch (e) {
          console.error(e);
          setErro('Erro ao carregar dados para criação do personagem-base');
        } finally {
          setLoading(false);
        }
      }

      carregarCatalogos();
    }
  }, [authLoading, usuario, router]);

  const carregarTrilhasDaClasse = async (
    classeId: number,
  ): Promise<TrilhaCatalogo[]> => {
    return apiGetTrilhasDaClasse(classeId);
  };

  const carregarCaminhosDaTrilha = async (
    trilhaId: number,
  ): Promise<CaminhoCatalogo[]> => {
    return apiGetCaminhosDaTrilha(trilhaId);
  };

  async function handleCreate(data: CreatePersonagemBasePayload) {
    const novo = await apiCreatePersonagemBase(data);
    router.push(`/personagens-base/${novo.id}`);
  }

  if (authLoading || loading) {
    return (
      <Loading
        message="Carregando dados para criação..."
        className="p-6 text-app-fg"
      />
    );
  }

  if (!usuario) return null;

  return (
    <main className="min-h-screen bg-app-bg px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-app-fg">
              Novo personagem-base
            </h1>
            <p className="text-sm text-app-muted">
              Siga os passos para montar o seu personagem-base completo.
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/personagens-base')}
          >
            Voltar para a lista
          </Button>
        </header>

        {erro && <ErrorAlert message={erro} />}

        <PersonagemBaseWizard
          classes={classes}
          clas={clas}
          origens={origens}
          proficiencias={proficiencias}
          tiposGrau={tiposGrau}
          tecnicasInatas={tecnicasInatas}
          alinhamentos={alinhamentos}
          pericias={pericias}
          equipamentos={equipamentos}
          modificacoes={modificacoes}
          carregarTrilhasDaClasse={carregarTrilhasDaClasse}
          carregarCaminhosDaTrilha={carregarCaminhosDaTrilha}
          onSubmitCreate={handleCreate}
        />
      </div>
    </main>
  );
}
