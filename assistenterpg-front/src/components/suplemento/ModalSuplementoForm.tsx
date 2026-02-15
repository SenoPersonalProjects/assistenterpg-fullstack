// src/components/suplemento/ModalSuplementoForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import {
  apiCreateSuplemento,
  apiUpdateSuplemento,
  SuplementoCatalogo,
} from '@/lib/api/suplementos';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';

type ModalSuplementoFormProps = {
  isOpen: boolean;
  onClose: (sucesso?: boolean) => void;
  suplemento?: SuplementoCatalogo | null;
};

type FormData = {
  codigo: string;
  nome: string;
  descricao: string;
  versao: string;
  status: 'RASCUNHO' | 'PUBLICADO' | 'ARQUIVADO';
  icone: string;
  banner: string;
  tags: string;
  autor: string;
};

export function ModalSuplementoForm({
  isOpen,
  onClose,
  suplemento,
}: ModalSuplementoFormProps) {
  const { showToast } = useToast();
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  const [form, setForm] = useState<FormData>({
    codigo: '',
    nome: '',
    descricao: '',
    versao: '1.0.0',
    status: 'RASCUNHO',
    icone: '',
    banner: '',
    tags: '',
    autor: '',
  });

  useEffect(() => {
    if (suplemento) {
      setForm({
        codigo: suplemento.codigo,
        nome: suplemento.nome,
        descricao: suplemento.descricao || '',
        versao: suplemento.versao,
        status: suplemento.status,
        icone: suplemento.icone || '',
        banner: suplemento.banner || '',
        tags: suplemento.tags?.join(', ') || '',
        autor: suplemento.autor || '',
      });
    } else {
      setForm({
        codigo: '',
        nome: '',
        descricao: '',
        versao: '1.0.0',
        status: 'RASCUNHO',
        icone: '',
        banner: '',
        tags: '',
        autor: '',
      });
    }
    setErros({});
  }, [suplemento, isOpen]);

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (erros[field]) {
      setErros((prev) => {
        const novos = { ...prev };
        delete novos[field];
        return novos;
      });
    }
  }

  function validar(): boolean {
    const novosErros: Record<string, string> = {};

    if (!form.codigo.trim()) {
      novosErros.codigo = 'Código é obrigatório';
    } else if (!/^[A-Z0-9_]+$/.test(form.codigo)) {
      novosErros.codigo = 'Código deve conter apenas letras maiúsculas, números e underscore';
    }

    if (!form.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    }

    if (!form.versao.trim()) {
      novosErros.versao = 'Versão é obrigatória';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSalvar() {
    if (!validar()) return;

    try {
      setSalvando(true);

      const payload = {
        codigo: form.codigo.trim().toUpperCase(),
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || undefined,
        versao: form.versao.trim(),
        status: form.status,
        icone: form.icone.trim() || undefined,
        banner: form.banner.trim() || undefined,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        autor: form.autor.trim() || undefined,
      };

      if (suplemento) {
        await apiUpdateSuplemento(suplemento.id, payload);
        showToast('Suplemento atualizado com sucesso!', 'success');
      } else {
        await apiCreateSuplemento(payload);
        showToast('Suplemento criado com sucesso!', 'success');
      }

      onClose(true);
    } catch (error) {
      const mensagem = extrairMensagemErro(error);
      showToast(mensagem, 'error');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title={suplemento ? 'Editar Suplemento' : 'Novo Suplemento'}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={() => onClose(false)} disabled={salvando}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSalvar} disabled={salvando}>
            {salvando ? (
              <>
                <Icon name="loading" className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Icon name="check" className="w-4 h-4 mr-2" />
                {suplemento ? 'Atualizar' : 'Criar'}
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Card>
          <h3 className="text-lg font-semibold text-app-fg mb-4">Informações Básicas</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-app-fg mb-1">
                Código <span className="text-app-danger">*</span>
              </label>
              <Input
                value={form.codigo}
                onChange={(e) => handleChange('codigo', e.target.value.toUpperCase())}
                placeholder="SUPL_EXEMPLO_V1"
                disabled={!!suplemento || salvando}
                error={erros.codigo}
              />
              {erros.codigo && (
                <p className="text-sm text-app-danger mt-1">{erros.codigo}</p>
              )}
              <p className="text-xs text-app-muted mt-1">
                Identificador único (letras maiúsculas, números e underscore)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-app-fg mb-1">
                Nome <span className="text-app-danger">*</span>
              </label>
              <Input
                value={form.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Nome do Suplemento"
                disabled={salvando}
                error={erros.nome}
              />
              {erros.nome && <p className="text-sm text-app-danger mt-1">{erros.nome}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-app-fg mb-1">Descrição</label>
              <Textarea
                value={form.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                placeholder="Descrição do suplemento..."
                rows={3}
                disabled={salvando}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-app-fg mb-1">
                  Versão <span className="text-app-danger">*</span>
                </label>
                <Input
                  value={form.versao}
                  onChange={(e) => handleChange('versao', e.target.value)}
                  placeholder="1.0.0"
                  disabled={salvando}
                  error={erros.versao}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-app-fg mb-1">Status</label>
                <Select
                  value={form.status}
                  onChange={(e) =>
                    handleChange('status', e.target.value as FormData['status'])
                  }
                  disabled={salvando}
                >
                  <option value="RASCUNHO">Rascunho</option>
                  <option value="PUBLICADO">Publicado</option>
                  <option value="ARQUIVADO">Arquivado</option>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-app-fg mb-4">Metadados</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-app-fg mb-1">Autor</label>
              <Input
                value={form.autor}
                onChange={(e) => handleChange('autor', e.target.value)}
                placeholder="Nome do autor ou equipe"
                disabled={salvando}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-app-fg mb-1">Tags</label>
              <Input
                value={form.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="tag1, tag2, tag3"
                disabled={salvando}
              />
              <p className="text-xs text-app-muted mt-1">Separe múltiplas tags com vírgula</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-app-fg mb-1">
                URL do Ícone
              </label>
              <Input
                value={form.icone}
                onChange={(e) => handleChange('icone', e.target.value)}
                placeholder="https://exemplo.com/icone.png"
                disabled={salvando}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-app-fg mb-1">
                URL do Banner
              </label>
              <Input
                value={form.banner}
                onChange={(e) => handleChange('banner', e.target.value)}
                placeholder="https://exemplo.com/banner.png"
                disabled={salvando}
              />
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
}
