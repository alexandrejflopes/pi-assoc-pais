/*
* file to save functions (or others, like lists) that will be reused and might be more general,
* like functions to generate randoms or get the gravatar URL from an email, etc
* */

// --------------------------------------------- IMPORTS ----------------------------------------------
import MD5 from "crypto-js/md5";
import defaultLogoFile from "../assets/assoc-pais-logo-default.png";

// -------------------------------------------- CONSTANTS --------------------------------------------

const regular_role_PT = "Associado(a)";
const defaultIBAN = "PT50 1234 4321 12345678901 72";

/*
* number (starting at 0) of the column with the first new parameter
* that shall be in new parameters's JSON file*/
const membersImportFileNewParametersStartIndex = 13;
const studentsImportFileNewParametersStartIndex = 4;

const membersCSVparamsIndexes = {
    assoc_num_index : 0,
    role_index : 1,
    quotas_index : 2,
    name_index : 3,
    NIF_index : 4,
    citizen_card_index : 5,
    email_index : 6,
    phone_index : 7,
    job_index : 8,
    address_index : 9,
    zip_code_index : 10,
    city_index : 11,
    admin_index : 12
};

const studentsCSVparamsIndexes = {
  parent_assoc_num_index : 0,
  parent_name_index : 1,
  name_index : 2,
  school_year_index : 3
};

const countriesAndCodes = {
  "Portugal": "pt_PT"
};

let currentCountry = "Portugal";

const languageCode = countriesAndCodes[currentCountry];

const zipCodeRegexes = {
  "pt_PT" : {
    length : 8,
    regex : new RegExp(/\d{4}\-\d{3}/)
  }
};

const notAvailableDesignation = {
  "pt_PT" : "ND" // nao determinado/disponivel
};

const newParametersTypes = {
  TEXT : {
    "pt_PT" : "texto"
  },
  INT : {
    "pt_PT": "inteiro"
  },
  FLOAT : {
    "pt_PT": "decimal"
  }
};

const newParametersEntities = {
  parent : {
    "pt_PT": "EE"
  },
  student : {
    "pt_PT": "aluno"
  }
};

const parentsParameters = {
  ASSOC_NUMBER : {
    "pt_PT": "Número de Sócio"
  },
  ROLE : {
    "pt_PT": "Cargo"
  },
  PAYED_FEE : {
    "pt_PT": "Quotas pagas"
  },
  NAME : {
    "pt_PT": "Nome"
  },
  NIF : {
    "pt_PT" : "NIF"
  },
  CC : {
    "pt_PT" : "Cartão Cidadão"
  },
  EMAIL : {
    "pt_PT" : "Email"
  },
  PHONE : {
    "pt_PT" : "Telemóvel"
  },
  JOB : {
    "pt_PT" : "Profissão"
  },
  STREET : {
    "pt_PT" : "Morada"
  },
  ZIPCODE : {
    "pt_PT" : "Código Postal"
  },
  CITY : {
    "pt_PT" : "Localidade"
  },
  ADMIN : {
    "pt_PT" : "Admin"
  }
};

const studentsParameters = {
  PARENT_ASSOC_NUMBER : {
    "pt_PT": "Número de Sócio EE"
  },
  PARENT_NAME : {
    "pt_PT": "Encarregado de Educação"
  },
  NAME : {
    "pt_PT": "Nome"
  },
  SCHOOL_YEAR : {
    "pt_PT" : "Ano (ensino regular)"
  }
};













// ---------------------------------------------- FUNCTIONS ---------------------------------------------

/* hash the email with MD5 to implement Gravatar */
function getGravatarURL(email) {
  const emailProcessed = email.trim().toLowerCase();
  const hashedEmail = MD5(emailProcessed); // email hash with lowercase with MD5
  return "https://www.gravatar.com/avatar/" + hashedEmail + "?d=mp"; // default avatar when there's no one for that email
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}


// --------------------------------------------- EXPORTS ----------------------------------------------

export {
  getGravatarURL,
  regular_role_PT,
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
  zipCodeRegexes
}


