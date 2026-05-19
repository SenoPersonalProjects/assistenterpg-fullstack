DIRETRIZES OBRIGATÓRIAS PARA O AGENTE:
1. Nenhuma quebra: Suas alterações não podem quebrar o funcionamento atual da página ou de outras partes do sistema. Analise os imports e dependências antes de modificar arquivos.
2. Build e Validação: Sempre, após realizar qualquer alteração no código, abra o terminal e rode o comando de build (ex: `npm run build` ou equivalente do projeto) para verificar se existem erros de compilação. Corrija-os autonomamente caso apareçam.
3. Componentização: Mantenha estritamente o padrão estrutural do projeto. Reutilize componentes sempre que possível. Se for necessário adicionar funcionalidade, ajuste os componentes existentes (adicionando props, por exemplo) ou crie componentes novos modularizados. 
4. Zero Hardcode: Evite hardcode ao máximo. Extraia textos, valores e lógicas repetitivas para constantes, variáveis de configuração, dicionários ou hooks.
