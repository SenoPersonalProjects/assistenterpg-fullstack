// src/components/auth/RegisterForm.tsx

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { extrairMensagemErro } from '@/lib/api/error-handler';

export function RegisterForm() {
  const { register, loading } = useAuth();
  const { showToast } = useToast();
  const [apelido, setApelido] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await register(apelido, email, senha);
      showToast('Conta criada com sucesso! Faça login.', 'success');
    } catch (error) {
      // ✅ Extrair mensagem traduzida do erro
      const mensagem = extrairMensagemErro(error);
      showToast(mensagem, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold mb-2">Criar conta</h1>
      <Input
        label="Apelido"
        value={apelido}
        onChange={(e) => setApelido(e.target.value)}
        required
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Senha"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        minLength={6}
        required
      />
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Criando...' : 'Criar conta'}
      </Button>
    </form>
  );
}
