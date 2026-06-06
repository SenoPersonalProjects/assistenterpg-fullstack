'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import {
  PASSWORD_POLICY,
  PASSWORD_REQUIREMENTS_TEXT,
  validateNewPassword,
} from '@/lib/auth/password-policy';
import { useRateLimitCooldown } from '@/hooks/useRateLimitCooldown';

export function RegisterForm() {
  const { register, loading } = useAuth();
  const { showToast } = useToast();
  const [apelido, setApelido] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    captureRateLimit,
    cooldownButtonLabel,
    isCoolingDown,
  } = useRateLimitCooldown();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const passwordError = validateNewPassword(senha);
    if (passwordError) {
      showToast(passwordError, 'error');
      return;
    }

    setSubmitting(true);

    try {
      await register(apelido, email, senha);
      showToast('Conta criada! Verifique seu email antes de fazer login.', 'success');
    } catch (error) {
      const mensagem = captureRateLimit(error) ?? extrairMensagemErro(error);
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
        type={mostrarSenha ? 'text' : 'password'}
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        minLength={PASSWORD_POLICY.minCharacters}
        helperText={PASSWORD_REQUIREMENTS_TEXT}
        required
        rightIcon={mostrarSenha ? 'eyeOff' : 'eye'}
        rightIconLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
        onRightIconClick={() => setMostrarSenha((valor) => !valor)}
      />
      <Button type="submit" disabled={submitting || isCoolingDown}>
        {cooldownButtonLabel ?? (submitting ? 'Criando...' : 'Criar conta')}
      </Button>
    </form>
  );
}
