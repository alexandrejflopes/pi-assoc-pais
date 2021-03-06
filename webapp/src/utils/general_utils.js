/*
 * file to save functions (or others, like lists) that will be reused and might be more general,
 * like functions to generate randoms or get the gravatar URL from an email, etc
 * */

// --------------------------------------------- IMPORTS ----------------------------------------------
import MD5 from "crypto-js/md5";
import defaultLogoFile from "../assets/assoc-pais-logo-default.png";
import { Bounce, toast } from "react-toastify";
import { firebase_auth } from "../firebase-config";

// -------------------------------------------- CONSTANTS --------------------------------------------

export const deletedAtribute = "deleted";
export const validatedAtribute = "Validated";
export const blockedAtribute = "blocked";

const defaultIBAN = "PT50 1234 4321 12345678901 72";
const defaultAvatar =
  "https://www.gravatar.com/avatar/00000000000000000000000000000000";
/*
 * number (starting at 0) of the column with the first new parameter
 * that shall be in new parameters's JSON file*/
const membersImportFileNewParametersStartIndex = 13;
const studentsImportFileNewParametersStartIndex = 4;

export const regular_role = {
  pt_PT: "Associado(a)",
};

export const auth_providers_names = {
  GOOGLE: "google.com",
  FACEBOOK: "facebook.com",
  PASSWORD: "password",
};

const membersCSVparamsIndexes = {
  assoc_num_index: 0,
  role_index: 1,
  quotas_index: 2,
  name_index: 3,
  NIF_index: 4,
  citizen_card_index: 5,
  email_index: 6,
  phone_index: 7,
  job_index: 8,
  address_index: 9,
  zip_code_index: 10,
  city_index: 11,
  admin_index: 12,
};

const studentsCSVparamsIndexes = {
  parent_assoc_num_index: 0,
  parent_name_index: 1,
  name_index: 2,
  school_year_index: 3,
};

const countriesAndCodes = {
  Portugal: "pt_PT",
};

let currentCountry = "Portugal";

const languageCode = countriesAndCodes[currentCountry];

const zipCodeRegexes = {
  pt_PT: {
    length: 8,
    regex: new RegExp(/\d{4}\-\d{3}/),
  },
};

export const emailRegex = new RegExp(
  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
);

const notAvailableDesignation = {
  pt_PT: "ND", // nao determinado/disponivel
};

export const cargoDocKey = "titulo";
export const roleAdminPermissionDesignation = "admin";

export const assocParameters = {
  ZIP: {
    pt_PT: "Código Postal",
  },
  DAYS_TO_DELETE_REGISTRATION: {
    pt_PT: "DeleteRegistosSemPagar",
  },
  DESCRIPTION: {
    pt_PT: "Descrição",
  },
  EMAIL: {
    pt_PT: "Email da Associação",
  },
  IBAN: {
    pt_PT: "IBAN",
  },
  CITY: {
    pt_PT: "Localidade",
  },
  LOGO: {
    pt_PT: "Logótipo",
  },
  STREET: {
    pt_PT: "Morada",
  },
  NAME: {
    pt_PT: "Nome da Associação de Pais",
  },
  FEE: {
    pt_PT: "Quota",
  },
  PHONE: {
    pt_PT: "Telemóvel",
  },
};

const newParametersTypes = {
  TEXT: {
    pt_PT: "texto",
  },
  INT: {
    pt_PT: "inteiro",
  },
  FLOAT: {
    pt_PT: "decimal",
  },
};

const newParametersInputTypes = {
  TEXT: {
    type: "text",
    step: null,
  },
  INT: {
    type: "number",
    step: "1",
  },
  FLOAT: {
    type: "number",
    step: "0.1",
  },
};

const newParametersEntities = {
  parent: {
    pt_PT: "EE",
  },
  student: {
    pt_PT: "aluno",
  },
};

export const membersDesignation = {
  pt_PT: "Membros",
};

export const membersChildrenDesignation = {
  pt_PT: "Alunos",
};

export const assocDataZipName = {
  pt_PT: "Assoc_Pais_Info",
};

const parentsParameters = {
  ASSOC_NUMBER: {
    pt_PT: "Número de Sócio",
  },
  ROLE: {
    pt_PT: "Cargo",
  },
  PAYED_FEE: {
    pt_PT: "Quotas pagas",
  },
  NAME: {
    pt_PT: "Nome",
  },
  NIF: {
    pt_PT: "NIF",
  },
  CC: {
    pt_PT: "Cartão Cidadão",
  },
  EMAIL: {
    pt_PT: "Email",
  },
  PHONE: {
    pt_PT: "Telemóvel",
  },
  JOB: {
    pt_PT: "Profissão",
  },
  STREET: {
    pt_PT: "Morada",
  },
  ZIPCODE: {
    pt_PT: "Código Postal",
  },
  CITY: {
    pt_PT: "Localidade",
  },
  ADMIN: {
    pt_PT: "Admin",
  },
  // other fields (not in the CSVs)
  CHILDREN: {
    pt_PT: "Educandos",
  },
  PHOTO: {
    pt_PT: "photo",
  },
  REGISTER_DATE: {
    pt_PT: "Data inscricao",
  },
  FEES: {
    pt_PT: "Cotas",
  },
};

const studentsParameters = {
  PARENT_ASSOC_NUMBER: {
    pt_PT: "Número de Sócio EE",
  },
  PARENT_NAME: {
    pt_PT: "Encarregado de Educação",
  },
  NAME: {
    pt_PT: "Nome",
  },
  SCHOOL_YEAR: {
    pt_PT: "Ano", // (ensino regular)
  },
  // others
  PHOTO: {
    pt_PT: "Foto", // (ensino regular)
  },
};

export const toastTypes = {
  // warning, success, error, info, default, dark
  WARNING: "warning",
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
  DEFAULT: "default",
  DARK: "dark",
};

// ---------------------------------------------- BUTTON TITLES ---------------------------------------------

export const cleanButton = {
  pt_PT: "Limpar",
};

export const closeButton = {
  pt_PT: "Fechar",
};

export const cancelButton = {
  pt_PT: "Cancelar",
};

export const saveButton = {
  pt_PT: "Gravar",
};

export const newCaseButton = {
  pt_PT: "Abrir um novo caso",
};

export const showArquivedCases = {
  pt_PT: "Mostrar casos arquivados",
};

export const casesLoading = {
  pt_PT: "A obter casos...",
};

export const approvalPageLoading = {
  pt_PT: "A obter pedidos...",
};

export const formFeedback = {
  pt_PT: "Por favor, preencha este campo",
};

export const studentName = {
  pt_PT: "Nome Aluno",
};

export const studentYear = {
  pt_PT: "Ano Escolaridade",
};

export const cargosSemCargo = {
  pt_PT: "Sem Cargo",
};

export const cargosSemMudanca = {
  pt_PT: "Sem Mudança",
};

export const newCargoTransactionButton = {
  pt_PT: "Iniciar mudança de cargos",
};

export const seeMoreButton = {
  pt_PT: "Ver mais",
};

export const newCargosTitle = {
  pt_PT: "Nova Transição de Cargos",
};

export const newCargosHeaderName = {
  pt_PT: "Nome",
};

export const newCargosHeaderEmail = {
  pt_PT: "Email",
};

export const newCargosHeaderCargoAtual = {
  pt_PT: "Cargo Atual",
};

export const newCargosHeaderNovoCargo = {
  pt_PT: "Novo Cargo",
};

// ---------------------------------------------- OBJECTS ---------------------------------------------

// ---------------------------------------------- FUNCTIONS ---------------------------------------------

/* hash the email with MD5 to implement Gravatar */
function getGravatarURL(email) {
  const emailProcessed = email.trim().toLowerCase();
  const hashedEmail = MD5(emailProcessed); // email hash with lowercase with MD5
  return "https://www.gravatar.com/avatar/" + hashedEmail + "?d=mp"; // default avatar when there's no one for that email
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function showToast(message, duration, type) {
  // type: warning, success, error, info, default
  toast.configure();
  toast(message, {
    transition: Bounce,
    closeButton: true,
    autoClose: duration,
    position: "top-right",
    type: type,
  });
}

function updateFirebaseUserPhoto(photo_url) {
  const firebaseUser = firebase_auth.currentUser;
  return firebaseUser.updateProfile({
    photoURL: photo_url,
  });
}

function updateFirebaseUserDisplayName(newName) {
  const firebaseUser = firebase_auth.currentUser;
  return firebaseUser.updateProfile({
    displayName: newName,
  });
}

function updateFirebaseUserDisplayNameAndPhoto(newName, photo_url) {
  const firebaseUser = firebase_auth.currentUser;
  return firebaseUser.updateProfile({
    displayName: newName,
    photoURL: photo_url,
  });
}

// --------------------------------------------- EXPORTS ----------------------------------------------

export {
  getGravatarURL,
  defaultLogoFile,
  defaultIBAN,
  getRandomInteger,
  languageCode,
  newParametersTypes,
  newParametersEntities,
  membersImportFileNewParametersStartIndex,
  studentsImportFileNewParametersStartIndex,
  membersCSVparamsIndexes,
  studentsCSVparamsIndexes,
  parentsParameters,
  studentsParameters,
  notAvailableDesignation,
  zipCodeRegexes,
  defaultAvatar,
  newParametersInputTypes,
  showToast,
};
