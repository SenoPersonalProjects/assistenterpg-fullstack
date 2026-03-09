-- CreateIndex
CREATE INDEX `Campanha_donoId_criadoEm_idx` ON `Campanha`(`donoId`, `criadoEm`);

-- CreateIndex
CREATE INDEX `ConviteCampanha_email_status_criadoEm_idx` ON `ConviteCampanha`(`email`, `status`, `criadoEm`);

-- CreateIndex
CREATE INDEX `ConviteCampanha_campanhaId_status_idx` ON `ConviteCampanha`(`campanhaId`, `status`);

-- CreateIndex
CREATE INDEX `homebrews_usuarioId_criadoEm_idx` ON `homebrews`(`usuarioId`, `criadoEm`);

-- CreateIndex
CREATE INDEX `homebrews_status_criadoEm_idx` ON `homebrews`(`status`, `criadoEm`);

-- CreateIndex
CREATE INDEX `MembroCampanha_usuarioId_campanhaId_idx` ON `MembroCampanha`(`usuarioId`, `campanhaId`);

-- CreateIndex
CREATE INDEX `PersonagemBase_donoId_nome_idx` ON `PersonagemBase`(`donoId`, `nome`);
