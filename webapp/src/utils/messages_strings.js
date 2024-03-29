/*
 *  file to save messages strings that might be reused along the app
 * */

// ------------------ STRINGS RELATED TO LOADING PAGES ------------------

const loadingInfo = {
  pt_PT: "A carregar informações...",
};

// ------------------ STRINGS RELATED TO FORMS ------------------

export const deleteAccountDisabledTipMessage = {
  pt_PT:
    "Se pertence a um órgão social, não poderá eliminar a sua conta. Isto acontece para prevenir que a plataforma fique sem " +
    "administradores.",
};

export const daysToDeleteRegistTipMessage = {
  pt_PT:
    "Número de dias após o qual os pedidos de registo não aprovados e sem quota paga são eliminados automaticamente.",
};

const jsonParamsErrorMessage = {
  pt_PT:
    "O ficheiro JSON fornecido é inválido!\n" +
    "Por favor, verifique se tem o formato conforme o manual de utilização e se a sintaxe está correta.\n" +
    "Obrigado.",
};

const jsonOrCsvParamsErrorMessage = {
  pt_PT:
    "Os ficheiros CSV fornecidos são inválidos! As razões incluem:\n" +
    " - parâmetros no ficheiro JSON não estão nos respetivos CSV e vice-versa;\n" +
    " - CSV estão num formato inadequado;\n" +
    " - existem parâmetros no CSV não suportados (verique o nome deles);\n" +
    " - exitem parâmetros com valores inesperados (ex: 'Quotas Pagas' ou 'Admin');\n" +
    " - há parâmetros novos no CSV que já são suportados pela plataforma.\n" +
    "Para mais informações, consulte o manual de utilização.\n" +
    "Obrigado.",
};

export const rolesFileErrorMessage = {
  pt_PT:
    "Houve um erro no processamento de cargos. As razões incluem: " +
    " - o ficheiro JSON dos cargos não tem o formato adequado;" +
    " - há membros no CSV com cargos não presentes no ficheiro de cargos fornecido;" +
    "Para mais informações, consulte o manual de utilização.\n" +
    "Obrigado.",
};

export const rolesFileErrorMessage_NewAssoc = {
  pt_PT:
    "Houve um erro no processamento de cargos. As razões incluem: " +
    " - o ficheiro JSON dos cargos não tem o formato adequado;" +
    " - o cargo que introduziu na secção 'Sobre si' não está presente no ficheiro de cargos fornecido;" +
    "Para mais informações, consulte o manual de utilização.\n" +
    "Obrigado.",
};

const importSucessMessage = {
  pt_PT:
    "A associação foi registada com sucesso e todos os seus membros foram notificados por email.\n" +
    "Por favor consulte o seu email para começar a usar a plataforma.\n\n" +
    "Nota: se não recebeu nenhum email, aguarde ou verifique a pasta de Lixo ou Spam. Obrigado.",
};

const invalidZipMessage = {
  pt_PT:
    "O Código Postal fornecido é inválido em Portugal.\nPor favor, corrija-o. Obrigado.",
};

export const invalidEmailMessage = {
  pt_PT:
    "O email fornecido tem formato inválido.\nPor favor, corrija-o. Obrigado.",
};

const provideRequiredFieldsMessage = {
  pt_PT: "Por favor, preencha os campos em falta.",
};

export const childSchoolYearTipMessage = {
  pt_PT:
    "Indique o ano escolar em que se encontra o seu educando no ensino regular (1 a 12)",
};

const aboutYouTipMessage = {
  pt_PT:
    "Esta informação é necessária para que lhe seja enviado um link para o email" +
    " para se poder autenticar na plataforma.",
};

const assocLogoFormatsTipMessage = {
  pt_PT:
    "Por favor, forneça uma imagem com um dos seguintes formatos: PNG, JPEG, SVG",
};

const membersImportFileFormatsTipMessage = {
  pt_PT:
    "Por favor, forneça um ficheiro em formato CSV com os dados dos membros da associação." +
    " Para mais informações, consulte o manual de utilização da plataforma.",
};

const studentsImportFileFormatsTipMessage = {
  pt_PT:
    "Por favor, forneça um ficheiro em formato CSV com os dados dos educandos dos membros da associação." +
    " Para mais informações, consulte o manual de utilização da plataforma.",
};

const paramsJsonFileTipMessage = {
  pt_PT:
    "Por favor, forneça um ficheiro em formato JSON com os parâmetros relacionados com o contexto " +
    "da associação e que não estão cobertos por este formulário. Pode fornecer parâmetros para os membros " +
    "da associação, para os educandos ou ambos.\nPara mais informações, consulte o manual de utilização da plataforma.",
};

export const cargosFileTipMessage = {
  pt_PT:
    "Por favor, forneça um ficheiro em formato .txt com os cargos distintos da associação separados por vírgulas.\n" +
    "Para mais informações, consulte o manual de utilização da plataforma.",
};

const fillRequiredFieldMessage = {
  pt_PT: "Por favor, preencha este campo",
};

const errorLoginGoogle = {
  pt_PT: "Login com a Google falhou",
};

export const errorLoginFB = {
  pt_PT: "Login com o Facebook falhou",
};

const errorSignOut = {
  pt_PT: "Erro ao fazer logout, tente novamente",
};

export const deleteCasoError = {
  pt_PT: "Houve um problema a eliminar o caso. Por favor, tente novamente.",
};

export const emailAlreadyInUse = {
  pt_PT:
    "O email que inseriu já está a ser usado por outro utilizador. Por favor, forneça outro email.",
};

export const emailUsageCheckError = {
  pt_PT:
    "Houve um problema a verificar o seu email. Por favor, tente novamente.",
};

// ------------------ STRINGS RELATED TO PROFILE ------------------

// -------------------------------------- OTHERS --------------------------------------

// ------- INFOS

export const semQuotas = {
  pt_PT: "Não existem quotas registadas.",
};

export const semTransicoesDeCargos = {
  pt_PT: "Não existem transições de cargos registadas.",
};

export const exportProfileExplanation = {
  pt_PT:
    "Pode descarregar uma cópia das suas informações detidas pela plataforma em qualquer altura. \n" +
    "Descarregar as suas informações requer que entre na sua conta e só o utilizador tenm acesso a este processo. " +
    "Quando a sua cópia estiver concluída, vai ser descarregada automaticamente num ficheiro CSV para o disco do seu dispositivo.",
};

export const exportAssocDataExplanation = {
  pt_PT:
    "Pode descarregar uma cópia das informações relacionadas a membros e alunos detidas pela plataforma em qualquer altura. " +
    "Descarregar as suas informações requer que entre na sua conta com previlégios adicionais, como órgão social, " +
    "e só o utilizador e outros órgãos sociais têm acesso a este processo. " +
    "Quando a cópia estiver concluída, vai ser descarregada automaticamente num ficheiro ZIP para o disco do seu dispositivo.",
};

export const exportAssocCasosExplanation = {
  pt_PT:
    "Pode descarregar uma cópia de todos os casos criados pelos utilizadores da plataforma, incluindo comentários, " +
    "membros (no caso de casos privados) e informações sobre os documentos associados aos casos. " +
    "Quando a cópia estiver concluída, vai ser descarregada automaticamente num ficheiro PDF para o disco do seu dispositivo.",
};

export const deleteAccountExplanation = {
  pt_PT:
    "Pode eliminar a sua conta da plataforma da associação de pais. Todos os seus dados serão apagados da plataforma, " +
    "embora os órgãos sociais ainda possam mantê-los em formatos suplementares, pelo que deverá contactá-los caso queira " +
    "abandonar definitivamente a associação.\n" +
    "Depois da eliminação de conta não vai poder recuperar as suas informações, bem como mensagens ou outros conteúdos " +
    "que partilhou na plataforma. Se desejar descarregar uma cópia das suas informações pode usar a função de exportar " +
    "dados antes de apagar a sua conta. Além disso, não será possível registar-se novamente com o mesmo email desta conta " +
    "depois de eliminada.",
};

export const exportCasosOnProcess = {
  pt_PT: "A processar as informações dos casos. Por favor, aguarde.",
};

export const exportUserDataOnProcess = {
  pt_PT: "A processar as suas informações. Por favor, aguarde.",
};

export const exportAssocDataOnProcess = {
  pt_PT: "A processar as informações da associação. Por favor, aguarde.",
};

export const changeEmailOnProcess = {
  pt_PT: "A proceder à mudança de email... Por favor, aguarde.",
};

// ------- ERRORS

export const addCasoError = {
  pt_PT: "Houve um problema a guardar o caso. Por favor, tente novamente.",
};

export const addCommentMissing = {
  pt_PT: "Insira um comentário",
};

export const addDocTitleMissing = {
  pt_PT: "Insira um título para o documento",
};

export const addDocLinkMissing = {
  pt_PT: "Insira um link para o documento",
};

export const addDocError = {
  pt_PT: "Houve um problema a guardar o documento. Por favor, tente novamente.",
};

export const deleteCommentError = {
  pt_PT:
    "Houve um problema a eliminar o comentário. Por favor, tente novamente.",
};

export const childAddedError = {
  pt_PT:
    "Houve um problema a adicionar o seu educando. Por favor, tente novamente.",
};

export const linkAccountError = {
  pt_PT:
    "Ocorreu um erro ao tentar associar a sua conta.\n As causas incluem: - A conta a associar já esta a ser " +
    "usada;\n " +
    " - Já tem associada uma conta deste serviço.",
};

export const unlinkAccountError = {
  pt_PT:
    "Ocorreu um erro ao tentar desassociar a sua conta. \n As causas incluem: - A conta a desassociar não está " +
    "associada.",
};

export const deleteAccountGenericErrorMsg = {
  pt_PT:
    "Ocorreu um erro ao tentar eliminar a sua conta. Pode ser necessário sair (logout) e voltar a entrar. Obrigado.",
};

export const exportMembersDataError = {
  pt_PT:
    "Ocorreu um erro a processar as informações dos membros da associação. Por favor, tente novamente mais tarde.",
};

export const exportChildrenDataError = {
  pt_PT:
    "Ocorreu um erro a processar as informações dos alunos. Por favor, tente novamente mais tarde.",
};

export const exportUserDataError = {
  pt_PT:
    "Ocorreu um erro a processar as suas informações. Por favor, tente novamente mais tarde.",
};

export const exportCasosError = {
  pt_PT:
    "Ocorreu um erro a processar as suas informações. Por favor, tente novamente mais tarde.",
};

export const emailAlreadyTaken = {
  pt_PT: "Houve um problema a atualizar o email. Por favor, tente novamente.",
};

export const genericEmailUpdateErrorMsg = {
  pt_PT: "Houve um problema a atualizar o email. Por favor, tente novamente.",
};

export const childAddPhotoError = {
  pt_PT:
    "Houve um problema a carregar a foto do seu educando. Por favor, tente novamente.",
};

export const parentUpdatePhotoError = {
  pt_PT:
    "Houve um problema a atualizar a foto de perfil. Por favor, tente novamente.",
};

export const parentUpdateError = {
  pt_PT:
    "Houve um problema a atualizar as informações. Por favor, tente novamente.",
};

export const childUpdateError = {
  pt_PT:
    "Houve um problema a atualizar o seu educando. Por favor, tente novamente.",
};

export const installError = {
  pt_PT:
    "Houve um ou mais erros durante a instalação.\nPor favor, verifique forneceu todos os dados " +
    "conforme o manual de utilização. Se sim, por favor, tente novamente.",
};

export const installDefaultLogoError = {
  pt_PT:
    "Houve um problema a processar o logótipo por omissão.\nPor favor, forneça um logótipo para a associação ou" +
    " contacte o responsável pela instalação da plataforma.\n Obrigado.",
};

export const uploadLogoError = {
  pt_PT: "Erro ao carregar o logótipo. Por favor, tente novamente.",
};

export const saveImportedParentsError = {
  pt_PT:
    "Erro ao guardar os membros da associação e respetivos dados. Por favor, tente novamente.",
};

export const addCaseError = {
  pt_PT: "Erro no envio do caso, por favor, tente novamente!",
};

export const registationError = {
  pt_PT: "Erro no envio da inscrição, por favor, tente novamente!",
};

export const childDeleteError = {
  pt_PT:
    "Houve um problema a eliminar o seu educando. Por favor, tente novamente.",
};

export const assocDataUpdateError = {
  pt_PT:
    "Houve um problema a atualizar as informações. Por favor, tente novamente.",
};

export const assocUpdateLogoError = {
  pt_PT:
    "Houve um problema a atualizar o logótipo. Por favor, tente novamente.",
};

export const cargosGetError = {
  pt_PT: "Erro ao obter cargos da base de dados. Por favor, tente novamente.",
};

export const cargosUpdateError = {
  pt_PT: "Erro ao gravar a transição. Por favor, tente novamente.",
};

export const cargosNothingToUpdateWarning = {
  pt_PT: "Transição sem dados para atualizar.",
};

export const erroUpdateCargos = {
  pt_PT: "Erro ao fazer a atualização. Por favor, tente novamente.",
};

export const erroCargosRepetidos = {
  pt_PT: "Existem cargos de administrador repetidos. Por favor, verifique novamente.",
};


export const erroCargosAdminEmFalta = {
  pt_PT: "Existem cargos de administrador não atribuídos. Por favor, verifique novamente.",
};

export const addQuotaError = {
  pt_PT: "Erro na gravação. Por favor, tente novamente.",
};


// ------- CONFIRMATIONS / PROMPTS
export const confirmAceitarCargo = {
  pt_PT:
    "Tem a certeza que pretender aceitar o cargo? Após aceitar, se os seus privilégios mudarem, terá que efetuar o login novamente.\n" +
    "Esta ação não é revertível.",
};

export const confirmDeleteCaso = {
  pt_PT:
    "Tem a certeza que pretender eliminar este caso?\n" +
    "Esta ação não é revertível.",
};

export const confirmDeleteChild = {
  pt_PT:
    "Tem a certeza que pretender eliminar este educando?\n" +
    "Esta ação não é revertível.",
};

export const confirmUpdateEmail = {
  pt_PT:
    "Ao alterar o seu email, deixa de se conseguir autenticar com o email atual, passando a ser " +
    "usado o novo para o efeito.\n Após a atualização, irá sair da sua conta e receber um link " +
    "no novo email para se autenticar com o mesmo.\n" +
    "Deseja continuar?",
};

export const confirmLogoutAndNewLink = {
  pt_PT:
    "Foi-lhe enviado um link para o novo " +
    " email para se autenticar.\nSe não o receber, proceda ao login normalmente, pedindo um novo link. \n",
};

export const confirmDeleteAccount = {
  pt_PT:
    "Deixará de ter acesso à plaforma através desta conta. Esta ação não pode ser revertida!",
};

export const commitChangesQuotasMessage = {
  pt_PT:
    "Existem alterações não gravadas nesta página que serão perdidas! Deseja gravá-las? (OK-Sim | Cancelar-Não)",
};

export const confirmLogoutAfterDelete = {
  pt_PT:
    "A sua conta foi apagada com sucesso. Será redirecionado para a página de início de sessão. \n" +
    "Obrigado por ter usado a plataforma. Até breve!",
};

// ------- SUCCESS

export const sucessoGeral = {
  pt_PT: "Sucesso",
};

export const deleteAccountSuccess = {
  pt_PT: "Conta eliminada com sucesso",
};

export const exportCasosSuccess = {
  pt_PT: "Casos exportados com sucesso.",
};

export const exportAssocDataSuccess = {
  pt_PT: "Informações exportadas com sucesso.",
};

export const exportUserDataSuccess = {
  pt_PT: "Informações exportadas com sucesso.",
};

export const emailUpdateSuccess = {
  pt_PT: "Email atualizado com sucesso",
};

export const parentUpdatePhotoSuccess = {
  pt_PT: "Foto de perfil atualizada com sucesso.",
};

export const parentUpdateSuccess = {
  pt_PT: "Informações atualizadas com sucesso.",
};

export const childUpdateSucess = {
  pt_PT: "Educado atualizado com sucesso.",
};

export const saveImportedParentsSuccess = {
  pt_PT: "Membros da associação e respetivos dados guardados com sucesso.",
};

export const addCaseSucess = {
  pt_PT: "Caso criado com sucesso.",
};

export const registationSuccess = {
  pt_PT: "Sucesso no envio da inscrição!",
};

export const childAddedSuccess = {
  pt_PT: "Educando adicionado!",
};

export const changesCommitSuccess = {
  pt_PT: "Alterações efetuadas com sucesso!",
};

export const sameChildNameError = {
  pt_PT: "Não é possível ter educandos com o mesmo nome!",
};

export const childDeleteSuccess = {
  pt_PT: "Educando eliminado com sucesso!",
};

const errorNoLogedInUser = {
  pt_PT: "Utilizador não registado!",
};

export const assocDataUpdateSuccess = {
  pt_PT: "Informações da associação atualizadas com sucesso.",
};

export const assocUpdateLogoSuccess = {
  pt_PT: "Logótipo atualizado com sucesso.",
};

export const deleteCasoSuccess = {
  pt_PT: "Caso eliminado.",
};

export {
  loadingInfo,
  // forms
  jsonParamsErrorMessage,
  jsonOrCsvParamsErrorMessage,
  importSucessMessage,
  provideRequiredFieldsMessage,
  aboutYouTipMessage,
  assocLogoFormatsTipMessage,
  membersImportFileFormatsTipMessage,
  studentsImportFileFormatsTipMessage,
  paramsJsonFileTipMessage,
  invalidZipMessage,
  fillRequiredFieldMessage,
  errorLoginGoogle,
  errorSignOut,
  errorNoLogedInUser,
};
