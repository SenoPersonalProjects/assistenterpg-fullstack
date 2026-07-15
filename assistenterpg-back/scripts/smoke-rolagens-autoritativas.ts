import { executarComandoSmoke } from '../src/operacional/smoke-rolagens-autoritativas';

void executarComandoSmoke(process.argv.slice(2), process.env).then(
  (exitCode) => {
    process.exitCode = exitCode;
  },
);
