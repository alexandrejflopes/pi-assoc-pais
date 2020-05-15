/*
 *  file to save messages strings that might be reused along the app
 * */

// ------------------ STRINGS RELATED TO LOADING PAGES ------------------

const loadingInfo = {
  "pt_PT": "A carregar informações...",
};

// ------------------ STRINGS RELATED TO FORMS ------------------

const jsonParamsErrorMessage = {
  "pt_PT":
    "O ficheiro JSON fornecido é inválido!\n" +
    "Por favor, verifique se tem o formato conforme o manual de utilização e se a sintaxe está correta.\n" +
    "Obrigado.",
};

const jsonOrCsvParamsErrorMessage = {
  "pt_PT":
    "Os ficheiros CSV fornecidos são inválidos! As razões incluem:\n" +
    " - parâmetros no ficheiro JSON não estão nos respetivos CSV e vice-versa;\n" +
    " - CSV estão num formato inadequado;\n" +
    " - existem parâmetros no CSV não suportados (verique o nome deles);\n" +
    " - exitem parâmetros com valores inesperados (ex: 'Quotas Pagas' ou 'Admin');\n" +
    " - há parâmetros novos no CSV que já são suportados pela plataforma.\n" +
    "Para mais informações, consulte o manual de utilização.\n" +
    "Obrigado.",
};

const importSucessMessage = {
  "pt_PT":
    "A associação foi registada com sucesso e todos os seus membros foram notificados por email.\n" +
    "Por favor consulte o seu email para começar a usar a plataforma.\n\n" +
    "Nota: se não recebeu nenhum email, aguarde ou verifique a pasta de Lixo ou Spam. Obrigado.",
};

const invalidZipMessage = {
  "pt_PT":
    "O Código Postal fornecido é inválido em Portugal.\nPor favor, corrija-o. Obrigado.",
};

export const invalidEmailMessage = {
  "pt_PT" : "O email fornecido tem formato inválido.\nPor favor, corrija-o. Obrigado."
};

const provideRequiredFieldsMessage = {
  "pt_PT": "Por favor, preencha os campos em falta.",
};

export const childSchoolYearTipMessage = {
  "pt_PT" :
    "Indique o ano escolar em que se encontra o seu educando no ensino regular (1 a 12)"
};

const aboutYouTipMessage = {
  "pt_PT":
    "Esta informação é necessária para que lhe seja enviado um link para o email" +
    " para se poder autenticar na plataforma.",
};

const assocLogoFormatsTipMessage = {
  "pt_PT":
    "Por favor, forneça uma imagem com um dos seguintes formatos: PNG, JPEG, SVG",
};

const membersImportFileFormatsTipMessage = {
  "pt_PT":
    "Por favor, forneça um ficheiro em formato CSV com os dados dos membros da associação." +
    " Para mais informações, consulte o manual de utilização da plataforma.",
};

const studentsImportFileFormatsTipMessage = {
  "pt_PT":
    "Por favor, forneça um ficheiro em formato CSV com os dados dos educandos dos membros da associação." +
    " Para mais informações, consulte o manual de utilização da plataforma.",
};

const paramsJsonFileTipMessage = {
  "pt_PT":
    "Por favor, forneça um ficheiro em formato JSON com os parâmetros relacionados com o contexto " +
    "da associação e que não estão cobertos por este formulário. Pode fornecer parâmetros para os membros " +
    "da associação, para os educandos ou ambos.\nPara mais informações, consulte o manual de utilização da plataforma.",
};


const fillRequiredFieldMessage = {
  "pt_PT": "Por favor, preencha este campo",
};

const errorLoginGoogle = {
  "pt_PT": "Login com a Google falhou",
};

const errorSignOut = {
  "pt_PT": "Erro ao fazer logout, tente novamente",
};

// ------------------ STRINGS RELATED TO PROFILE ------------------



// -------------------------------------- OTHERS --------------------------------------



// ------- ERRORS

export const emailAlreadyTaken = {
  "pt_PT" : "Houve um problema a atualizar o email. Por favor, tente novamente."
};

export const genericEmailUpdateErrorMsg = {
  "pt_PT" : "Houve um problema a atualizar o email. Por favor, tente novamente."
};

export const childAddPhotoError = {
  "pt_PT" : "Houve um problema a carregar a foto do seu educando. Por favor, tente novamente."
};

export const parentUpdatePhotoError = {
  "pt_PT" : "Houve um problema a atualizar a foto de perfil. Por favor, tente novamente."
};

export const parentUpdateError = {
  "pt_PT" : "Houve um problema a atualizar as informações. Por favor, tente novamente."
};

export const childUpdateError = {
  "pt_PT" : "Houve um problema a atualizar o seu educando. Por favor, tente novamente."
};

export const installError = {
  "pt_PT" : "Houve um ou mais erros durante a instalação.\nPor favor, verifique forneceu todos os dados " +
    "conforme o manual de utilização. Se sim, por favor, tente novamente."
};

export const uploadLogoError = {
  "pt_PT" : "Erro ao carregar o logótipo. Por favor, tente novamente."
};

export const saveImportedParentsError = {
  "pt_PT" : "Erro ao guardar os membros da associação e respetivos dados. Por favor, tente novamente."
};

export const addCaseError = {
  "pt_PT" : "Erro no envio do caso, por favor, tente novamente!"
};

export const registationError = {
  "pt_PT" : "Erro no envio da inscrição, por favor, tente novamente!"
};

export const childDeleteError = {
  "pt_PT" : "Houve um problema a eliminar o seu educando. Por favor, tente novamente."
};


// ------- CONFIRMATIONS

export const confirmDeleteChild = {
  "pt_PT" : "Tem a certeza que pretender eliminar este educando?\n" +
    "Esta ação não é revertível, a menos que volte a adicionar o educando à plataforma."
};

export const confirmUpdateEmail = {
  "pt_PT" : "Ao alterar o seu email, deixa de se conseguir autenticar com o email atual, passando a ser " +
    "usado o novo para o efeito.\n Após a atualização, irá sair da sua conta e receber um link " +
    "no novo email para se autenticar com o mesmo.\n" +
    "Deseja continuar?"
};

export const confirmLogoutAndNewLink = {
  "pt_PT" : "Foi-lhe enviado um link para o novo " +
    " email para se autenticar.\nSe não o receber, proceda ao login normalmente, pedindo um novo link. \n"
};

// ------- SUCCESS

export const emailUpdateSuccess = {
  "pt_PT" : "Email atualizado com sucesso"
};

export const parentUpdatePhotoSuccess = {
  "pt_PT" : "Foto de perfil atualizada com sucesso."
};

export const parentUpdateSuccess = {
  "pt_PT" : "Informações atualizadas com sucesso."
};

export const childUpdateSucess = {
  "pt_PT" : "Educado atualizado com sucesso."
};

export const saveImportedParentsSuccess = {
  "pt_PT" : "Membros da associação e respetivos dados guardados com sucesso."
};

export const addCaseSucess = {
  "pt_PT" : "Caso criado com sucesso."
};


export const registationSuccess = {
  "pt_PT" : "Sucesso no envio da inscrição!"
};

export const childAddedSuccess = {
  "pt_PT" : "Educando adicionado!"
};

export const changesCommitSuccess = {
  "pt_PT" : "Alterações efetuadas com sucesso!"
};

export const sameChildNameError = {
  "pt_PT" : "Não é possível ter educandos com o mesmo nome!"
};

export const childDeleteSuccess = {
  "pt_PT" : "Educando eliminado com sucesso!"
};

const errorNoLogedInUser = {
  "pt_PT": "Utilizador não registado!",
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
