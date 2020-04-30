/*
*  file to save messages strings that might be reused along the app
* */

// ------------------ STRINGS RELATED TO FORMS ------------------

const jsonParamsErrorMessage = {
  "pt_PT" :
    "O ficheiro JSON fornecido é inválido!\n" +
    "Por favor, verifique se tem o formato conforme o manual de utilização e se a sintaxe está correta.\n" +
    "Obrigado."
};

const jsonOrCsvParamsErrorMessage = {
  "pt_PT" :
    "Os ficheiros CSV fornecidos são inválidos! As razões incluem:\n" +
    " - parâmetros no ficheiro JSON não estão nos respetivos CSV e vice-versa;\n" +
    " - CSV estão num formato inadequado;\n" +
    " - existem parâmetros no CSV não suportados (verique o nome deles);\n" +
    " - exitem parâmetros com valores inesperados (ex: 'Quotas Pagas' ou 'Admin');\n" +
    " - há parâmetros novos no CSV que já são suportados pela plataforma.\n" +
    "Para mais informações, consulte o manual de utilização.\n" +
    "Obrigado."
};

const importSucessMessage = {
  "pt_PT" :
    "A associação foi registada com sucesso e todos os seus membros foram notificados por email.\n" +
    "Por favor consulte o seu email para começar a usar a plataforma.\n\n" +
    "Nota: se não recebeu nenhum email, aguarde ou verifique a pasta de Lixo ou Spam. Obrigado."
};

const invalidZipMessage = {
  "pt_PT" : "O Código Postal fornecido é inválido em Portugal.\nPor favor, corrija-o. Obrigado."
};

const provideRequiredFieldsMessage = {
  "pt_PT" : "Por favor, preencha os campos em falta."
};

const aboutYouTipMessage = {
  "pt_PT" :
    "Esta informação é necessária para que lhe seja enviado um link para o email" +
    " para se poder autenticar na plataforma."
};

const assocLogoFormatsTipMessage = {
  "pt_PT" :
    "Por favor, forneça uma imagem com um dos seguintes formatos: PNG, JPEG, SVG"
};

const membersImportFileFormatsTipMessage = {
  "pt_PT" :
    "Por favor, forneça um ficheiro em formato CSV com os dados dos membros da associação." +
    " Para mais informações, consulte o manual de utilização da plataforma."
};

const studentsImportFileFormatsTipMessage = {
  "pt_PT" :
    "Por favor, forneça um ficheiro em formato CSV com os dados dos educandos dos membros da associação." +
    " Para mais informações, consulte o manual de utilização da plataforma."
};

const paramsJsonFileTipMessage = {
  "pt_PT" :
    "Por favor, forneça um ficheiro em formato JSON com os parâmetros relacionados com o contexto " +
    "da associação e que não estão cobertos por este formulário. Pode fornecer parâmetros para os membros " +
    "da associação, para os educandos ou ambos.\nPara mais informações, consulte o manual de utilização da plataforma."
};








export {
  jsonParamsErrorMessage,
  jsonOrCsvParamsErrorMessage,
  importSucessMessage,
  provideRequiredFieldsMessage,
  aboutYouTipMessage,
  assocLogoFormatsTipMessage,
  membersImportFileFormatsTipMessage,
  studentsImportFileFormatsTipMessage,
  paramsJsonFileTipMessage,
  invalidZipMessage
}



