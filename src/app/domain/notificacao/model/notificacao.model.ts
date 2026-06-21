export type CanalNotificacao = 'whatsapp' | 'email';
export type StatusNotificacao = 'enviado' | 'falhou' | 'pendente';

export interface Notificacao {
  id: string;
  alunoId: string;
  alunoNome: string;
  canal: CanalNotificacao;
  mensagem: string;
  status: StatusNotificacao;
  enviadoEm?: string;
}
