export const MSG = {
  sistema: {
    erroInterno: 'Erro interno do servidor. Tente novamente mais tarde.',
    erroInesperado: 'Ocorreu um erro inesperado. Tente novamente.',
  },

  auth: {
    sessaoExpirada: 'Sua sessão expirou. Faça login novamente.',
    loginIncorreto: 'E-mail ou senha incorretos.',
    usuarioObrigatorio: 'Informe seu usuário',
    senhaMinima: 'A senha deve ter no mínimo 8 caracteres',
  },

  senha: {
    alteradaProvisoria: 'Senha alterada com sucesso. Faça login novamente com sua nova senha.',
    alteradaSucesso: 'Sua senha foi alterada com sucesso.',
    erroFallback: 'Erro ao alterar senha. Tente novamente.',
  },

  usuario: {
    criadoSucesso: 'Uma senha temporária foi enviada para o e-mail cadastrado.',
    atualizadoSucesso: 'Usuário atualizado com sucesso.',
    inativadoSucesso: (nome: string) => `Usuário "${nome}" inativado com sucesso.`,
    nomeObrigatorio: 'Nome é obrigatório',
    emailObrigatorio: 'E-mail é obrigatório',
    perfilObrigatorio: 'Selecione um perfil',
    nomeMinimo: 'Nome deve ter ao menos 3 caracteres',
    emailInvalido: 'Informe um e-mail válido',
  },

  responsavel: {
    cadastradoSucesso: 'Responsável cadastrado com sucesso.',
    atualizadoSucesso: 'Responsável atualizado com sucesso.',
    excluidoSucesso: 'Responsável excluído com sucesso.',
  },
};
