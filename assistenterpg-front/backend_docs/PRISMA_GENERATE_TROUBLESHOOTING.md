# Troubleshooting: `prisma generate` (CI/local com proxy/rede restrita)

Quando o build falha no `prebuild` por ausência de enums/modelos do `@prisma/client`, execute este checklist.

## Sintomas comuns

- `Enum RoleUsuario não encontrado em @prisma/client`
- `Failed to fetch ... binaries.prisma.sh ... 403`
- `Prisma Client não está pronto para compilar o backend`

## Checklist rápido

1. Validar variável mínima:

```bash
export DATABASE_URL='postgresql://user:pass@host:5432/db'
```

2. Tentar gerar client (manual):
2. Tentar gerar client:

```bash
npx prisma generate
```

Ou usar o helper do projeto:

```bash
npm run prisma:generate:safe
```

3. Se ambiente de CI/proxy bloquear download, testar sem variáveis de proxy do shell atual:

```bash
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u npm_config_http_proxy -u npm_config_https_proxy \
  DATABASE_URL='postgresql://user:pass@host:5432/db' npx prisma generate
```

4. Se continuar falhando por checksum, testar (somente diagnóstico):

```bash
DATABASE_URL='postgresql://user:pass@host:5432/db' PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

## Observações

- O `prebuild` foi intencionalmente configurado para falhar cedo e evitar centenas de erros em cascata.
- Após `prisma generate` funcionar, rode novamente:

```bash
npm run build
```

- Persistindo erro de rede no CI, registrar issue com:
  - log do `prisma generate`;
  - ambiente (CI provider, proxy, imagem/base);
  - confirmação de acesso a `https://binaries.prisma.sh`.
