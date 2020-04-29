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
  newParametersEntities}


