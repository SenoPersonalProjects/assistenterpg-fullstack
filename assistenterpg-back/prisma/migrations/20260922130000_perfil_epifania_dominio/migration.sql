-- Perfil narrativo persistente para Epifania de Dominio.
-- JSON preserva compatibilidade com fichas existentes e permite evoluir o
-- editor sem transformar configuracoes narrativas em catalogo global.
ALTER TABLE `PersonagemCampanha`
  ADD COLUMN `perfilEpifaniaDominio` JSON NULL;
