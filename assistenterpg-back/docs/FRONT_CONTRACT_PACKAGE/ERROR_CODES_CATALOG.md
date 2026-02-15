# Catálogo Formal de Códigos de Erro

## Envelope padrão de erro

```json
{
  "statusCode": 400,
  "message": "mensagem",
  "code": "CODIGO_ERRO",
  "details": {}
}
```

## Mapa por família

| Família | HTTP típico | Prefixos/códigos |
|---|---:|---|
| Autenticação/autorização | 401/403 | `CREDENCIAIS_INVALIDAS`, `TOKEN_INVALIDO`, `USUARIO_NAO_AUTENTICADO`, `ACESSO_NEGADO` |
| Validação | 400 | `VALIDATION_ERROR`, `INVALID_FORMAT`, `FIELD_REQUIRED`, `OUT_OF_RANGE`, `DUPLICATE_VALUES` |
| Banco de dados | 400/404/409/500 | `DB_*` (`DB_UNIQUE_VIOLATION`, `DB_RECORD_NOT_FOUND`, etc.) |
| Campanhas/convites | 403/404/422 | `CAMPANHA_*`, `CONVITE_*`, `USUARIO_JA_MEMBRO` |
| Compêndio | 404/409/422 | `COMPENDIO_*` |
| Inventário | 403/404/422 | `INVENTARIO_*` |
| Suplementos | 404/409/422 | `SUPLEMENTO_*` |
| Homebrews | 403/404/409/422 | `HOMEBREW_*` |
| Personagem-base/regras | 400/404/422 | códigos de regra como `INVALID_EA_KEY_ATTRIBUTE`, `PERSONAGEM_BASE_NOT_FOUND`, `POWER_*`, `TRAINING_*` |

## Códigos críticos para mapear no front (prioridade alta)

- Auth: `CREDENCIAIS_INVALIDAS`, `TOKEN_INVALIDO`, `USUARIO_NAO_AUTENTICADO`, `ACESSO_NEGADO`
- Campanha: `CAMPANHA_NOT_FOUND`, `CAMPANHA_ACESSO_NEGADO`, `CONVITE_INVALIDO`
- Usuário: `USUARIO_NOT_FOUND`, `USUARIO_EMAIL_DUPLICADO`, `USUARIO_SENHA_INCORRETA`
- Compêndio: `COMPENDIO_CATEGORIA_NOT_FOUND`, `COMPENDIO_ARTIGO_DUPLICADO`, `COMPENDIO_BUSCA_INVALIDA`
- Inventário: `INVENTARIO_ITEM_NOT_FOUND`, `INVENTARIO_CAPACIDADE_EXCEDIDA`, `INVENTARIO_MODIFICACAO_INCOMPATIVEL`
- Suplementos: `SUPLEMENTO_NOT_FOUND`, `SUPLEMENTO_JA_ATIVO`, `SUPLEMENTO_NAO_PUBLICADO`

## Origem da verdade no código

- Implementações de exceções: `src/common/exceptions/*.ts`
- Envelope de resposta de erro: filtros em `src/common/filters/*.ts`

## Extração automatizada (auditoria)

Para listar códigos candidatos diretamente dos arquivos de exceção:

```bash
python - <<'PY'
from pathlib import Path
import re
codes=set()
for p in Path('src/common/exceptions').glob('*.ts'):
    for c in re.findall(r"'([A-Z][A-Z0-9_]+)'", p.read_text()):
        if '_' in c and len(c) > 3:
            codes.add((p.name, c))
for item in sorted(codes):
    print(f"{item[0]}\t{item[1]}")
PY
```
