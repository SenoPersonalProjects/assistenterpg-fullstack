# Atlas world textures

Texturas finais usadas pelo Atlas em `/mundo`.

Arquivos gerados:

- `earth-atlas-base.png`
  - 2048x1024, RGB, PNG otimizado.
  - Tamanho final: 865.367 bytes.
  - Contem oceanos, continentes e relevo real em estilo escuro roxo/cinza.
- `earth-atlas-borders.png`
  - 2048x1024, RGBA, PNG otimizado com fundo transparente.
  - Tamanho final: 550.769 bytes.
  - Contem apenas linhas cartograficas reais em ciano/azul claro.

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

Argumentos do script:

- `--gray-earth-zip`: obrigatorio; caminho do zip Natural Earth Gray Earth.
- `--blank-map-svg`: obrigatorio; caminho do SVG equiretangular de bordas.
- `--output-dir`: opcional; por padrao usa `assistenterpg-front/public/images/world`.
- `--size`: opcional; largura da textura. Use `2048` por padrao web ou `4096` apenas se houver necessidade visual clara.

O script usa Python com Pillow/Numpy instalados localmente. Ele nao adiciona
dependencia runtime ao frontend, nao baixa assets novos e nao possui caminhos
absolutos pessoais como default.

Recomendacao de tamanho:

- Preferir 2048x1024 para web. Foi a escolha atual porque reduziu o total de aproximadamente 4,6 MB para aproximadamente 1,4 MB sem perder a leitura geral do globo.
- Usar 4096x2048 somente se uma futura revisao visual demonstrar necessidade real.

Regras do repositorio:

- Nao commitar downloads brutos, zips, fontes GIS ou arquivos cartograficos pesados.
- Commitar apenas os PNGs finais otimizados.
- Manter a textura estilizada: oceanos escuros, terra roxo/cinza e bordas sutis.
- Kakyn nao deve ser desenhado na textura base. Kakyn permanece como camada/marker narrativo separado do Atlas.
