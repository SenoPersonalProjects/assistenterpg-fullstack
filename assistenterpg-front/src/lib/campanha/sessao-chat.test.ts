import { describe, expect, it } from 'vitest';
import {
  LIMITE_MENSAGEM_CHAT_SESSAO,
  mensagemChatSessaoValida,
} from './sessao-chat';

describe('mensagens do chat de sessão', () => {
  it('aceita somente mensagens não vazias até o limite do contrato', () => {
    expect(mensagemChatSessaoValida('   ')).toBe(false);
    expect(mensagemChatSessaoValida('a'.repeat(LIMITE_MENSAGEM_CHAT_SESSAO))).toBe(true);
    expect(mensagemChatSessaoValida('a'.repeat(LIMITE_MENSAGEM_CHAT_SESSAO + 1))).toBe(false);
  });
});
