# Atlas world textures

Texturas finais usadas pelo Atlas em `/mundo`.

Arquivos gerados:

- `earth-atlas-base-4k.webp`
  - 4096x2048, RGB, WebP otimizado.
  - Tamanho final: 218.896 bytes.
  - Textura preferencial do globo quando o navegador suporta WebP.
- `earth-atlas-borders-4k.webp`
  - 4096x2048, RGBA, WebP otimizado com alpha.
  - Tamanho final: 893.578 bytes.
  - Overlay preferencial de fronteiras.
- `earth-atlas-base.png`
  - 2048x1024, RGB, PNG otimizado.
  - Tamanho final: 865.367 bytes.
  - Fallback 2K; contem oceanos, continentes e relevo real em estilo escuro roxo/cinza.
- `earth-atlas-borders.png`
  - 2048x1024, RGBA, PNG otimizado com fundo transparente.
  - Tamanho final: 550.769 bytes.
  - Fallback 2K; contem apenas linhas cartograficas reais em ciano/azul claro.

Fontes usadas:

- Natural Earth Gray Earth 50m v2.0.0.
  - Arquivo local: `D:\RPG\assets-globo\GRAY_50M_SR_W.zip`.
  - Arquivo interno usado: `GRAY_50M_SR_W.tif`.
  - Licenca: public domain.
  - Referencia: https://www.naturalearthdata.com/
- Wikimedia Commons `BlankMap-Equirectangular.svg`.
  - Arquivo local: `D:\RPG\assets-globo\BlankMap-Equirectangular.svg`.
  - Licenca: CC0 1.0.
  - Referencia: https://commons.wikimedia.org/wiki/File:BlankMap-Equirectangular.svg

Comando executado na raiz do repositorio:

```powershell
py assistenterpg-front\scripts\generate-world-textures.py --gray-earth-zip "D:\RPG\assets-globo\GRAY_50M_SR_W.zip" --blank-map-svg "D:\RPG\assets-globo\BlankMap-Equirectangular.svg" --size 2048
```

Comando para regenerar o conjunto WebP 4K preferencial:

```powershell
py assistenterpg-front\scripts\generate-world-textures.py --gray-earth-zip "D:\RPG\assets-globo\GRAY_50M_SR_W.zip" --blank-map-svg "D:\RPG\assets-globo\BlankMap-Equirectangular.svg" --size 4096 --format webp
```

Argumentos do script:

- `--gray-earth-zip`: obrigatorio; caminho do zip Natural Earth Gray Earth.
- `--blank-map-svg`: obrigatorio; caminho do SVG equiretangular de bordas.
- `--output-dir`: opcional; por padrao usa `assistenterpg-front/public/images/world`.
- `--size`: opcional; largura da textura. Use `2048` por padrao web ou `4096` apenas se houver necessidade visual clara.
- `--format`: opcional; `png` gera os fallbacks 2K estaveis, `webp` gera os arquivos 4K preferenciais.
- `--webp-quality`: opcional; padrao `78`.

O script usa Python com Pillow/Numpy instalados localmente. Ele nao adiciona
dependencia runtime ao frontend, nao baixa assets novos e nao possui caminhos
absolutos pessoais como default.

Recomendacao de tamanho:

- O Atlas carrega primeiro o conjunto WebP 4K. Ele foi adotado porque Pillow local suporta WebP e os dois arquivos somam 1.112.474 bytes, abaixo do limite operacional de 2,5 MB.
- Manter os PNGs 2048x1024 como fallback para falha de carregamento ou navegadores sem suporte adequado.
- Usar novos 4096x2048 PNGs apenas para validacao local; eles nao devem ser commitados porque ficam grandes demais para o ganho visual.

Regras do repositorio:

- Nao commitar downloads brutos, zips, fontes GIS ou arquivos cartograficos pesados.
- Commitar apenas os PNGs finais otimizados.
- Manter a textura estilizada: oceanos escuros, terra roxo/cinza e bordas sutis.
- Kakyn nao deve ser desenhado na textura base. Kakyn permanece como camada/marker narrativo separado do Atlas.
