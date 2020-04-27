/*
* ficheiro para guardar funções (ou listas, etc.) que sejam para reutilizar e que sejam mais genéricas,
* como funções para gerar números aleatorios ou obter o url do gravatar a partir de um email */

// --------------------------------------------- IMPORTS ----------------------------------------------
import MD5 from "crypto-js/md5";
import defaultLogoFile from "../assets/assoc-pais-logo-default.png";

// -------------------------------------------- CONSTANTES --------------------------------------------

const languageCode = "pt_PT";

const newParametersTypes = {
  TEXT : {
    "pt_PT": "texto"
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

const regular_role_PT = "Associado(a)";
const defaultIBAN = "PT50 1234 4321 12345678901 72";









// ---------------------------------------------- FUNCOES ---------------------------------------------

/* função para fazer hash do email com MD5 para o Gravatar */
function getGravatarURL(email) {
  const emailProcessed = email.trim().toLowerCase();
  const hashedEmail = MD5(emailProcessed); // hash do email em minusculas com MD5
  return "https://www.gravatar.com/avatar/" + hashedEmail + "?d=mp"; // avatar default caso nao haja avatar para o email fornecido
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}


// --------------------------------------------- EXPORTS ----------------------------------------------

export {getGravatarURL,
  regular_role_PT,
  defaultLogoFile,
  defaultIBAN,
  getRandomInteger,
  languageCode,
  newParametersTypes,
  newParametersEntities}


