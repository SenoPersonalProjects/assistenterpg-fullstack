# Guia de tratativa de erros no Front (Next.js)

> Este documento define como o front deve converter erros da API em UX previsível.

## 1) Tipos de erro no front

Criar uma tipagem base:

```ts
export type AppApiError = {
  statusCode: number;
  code?: string;
  message: string | string[];
  details?: unknown;
  field?: string;
  path?: string;
  method?: string;
};
```

---

## 2) Mapeamento status HTTP -> comportamento de UI

- **400**: validação de formulário (mensagem inline + destaque de campos)
- **401**: sessão expirada/não autenticado (logout + redirect login)
- **403**: sem permissão (bloquear ação + aviso)
- **404**: recurso não encontrado (empty/error state de detalhe)
- **409**: conflito (duplicidade/concorrência)
- **422**: regra de negócio (mostrar mensagem orientada ao usuário)
- **500+**: erro inesperado (toast global + retry)

---

## 3) Estratégia central no client HTTP

- Interceptor de resposta transforma erro bruto em `AppApiError`.
- Cada hook de domínio recebe erro já normalizado.
- Componentes não devem parsear `axiosError` diretamente.

---

## 4) Mensagens amigáveis (camada de apresentação)

Criar mapper de `code` para mensagem amigável:

```ts
const codeMessageMap: Record<string, string> = {
  AUTH_CREDENCIAIS_INVALIDAS: 'Email ou senha inválidos.',
  CAMPANHA_NAO_ENCONTRADA: 'Campanha não encontrada.',
  AUTH_ACESSO_NEGADO: 'Você não tem permissão para essa ação.',
};
```

Fallback:
- se `message` for array, mostrar primeira + opção “ver detalhes”.
- se vazio, usar: `Ocorreu um erro inesperado.`

---

## 5) Padrão de componentes para erros

- `ErrorBanner` (erro global de página)
- `FieldError` (erro de campo)
- `RetryState` (erro em carregamento de lista)
- `PermissionState` (403)
- `NotFoundState` (404)

---

## 6) Fluxos críticos obrigatórios para validar

1. Login inválido (401)
2. Token expirado em tela protegida (401)
3. Ação sem permissão (403)
4. Busca de recurso removido/inexistente (404)
5. Formulário inválido (400)
6. Conflito de dado duplicado (409)
7. Falha inesperada de servidor (500)

---

## 7) Checklist de implementação para o agente do front

- [ ] Existe tipo `AppApiError`
- [ ] Interceptor transforma erro de API
- [ ] Mapeamento de `code` -> mensagem amigável
- [ ] Estados de erro por contexto (form, page, list, permission)
- [ ] Fluxo 401 redireciona corretamente
- [ ] Nenhum componente parseia erro HTTP cru

