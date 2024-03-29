import { firebaseConfig, firestore, storageRef } from "../firebase-config";
import React from "react";
import { languageCode, parentsParameters } from "../utils/general_utils";

function addCasosExemplo() {
  let casosRef = firestore.collection("casos");

  // parametros
  // titulo , descricao , privado(true/false) , membros [ {'nome':'maria','id':'pljouHGIHpo'},{'nome':'jose','id':'SIdjisdnDI'} ]

  const casosExemplo = [
    {
      titulo: "Água a entrar na sala 12",
      descricao:
        "Desde terça-feira, que temos água a entrar na sala, o que coloca em questão o armazenamento de" +
        " instrumentos, uma vez que não há pouco espaço para os transferir para outro local.",
      privado: false,
      membros: [],
      nome_autor: "Diogo Gomes",
      id_autor: "dgomes@pi-assoc-pais.com",
    },
    {
      titulo: "Material insuficiente na sala 7",
      descricao:
        "Há carência de equipamento necessário para a realização das aulas Artes Visuais na sala 7",
      privado: false,
      membros: [],
      nome_autor: "Mário Silva",
      id_autor: "mario.silva@pi-assoc-pais.com",
    },
    {
      titulo: "Rixa entre o Gonçalo e o João do 1º ano",
      descricao:
        "Os dois alunos entraram numa rixa após, alegadamente, o João ter usado o afinador do Gonçalo" +
        "sem a sua autorização.",
      privado: true,
      membros: [
        { nome: "Olivério Baptista", id: "oliverio@pi-assoc-pais.com" },
        { nome: "Luísa Santos", id: "luisa.santos@pi-assoc-pais.com" },
      ],
      nome_autor: "Vera Teixeira", // autor é adicionado automaticamente ao caso
      id_autor: "vera@pi-assoc-pais.com",
    },
  ];

  for (let i = 0; i < casosExemplo.length; i++) {
    //alert("caso atual -> " + JSON.stringify(casosExemplo[i]));
    //console.log("caso atual -> ", casosExemplo[i]);

    const titulo = encodeURIComponent(casosExemplo[i].titulo);
    const descricao = encodeURIComponent(casosExemplo[i].descricao);
    const membros = encodeURIComponent(JSON.stringify(casosExemplo[i].membros));
    const privado = casosExemplo[i].privado;
    const nome_autor = casosExemplo[i].nome_autor;
    const id_autor = casosExemplo[i].id_autor;

    const project_id = firebaseConfig.projectId;

    let uri =
      "https://us-central1-" +
      project_id +
      ".cloudfunctions.net/api/addCaso?" +
      "titulo=" +
      titulo +
      "&" +
      "descricao=" +
      descricao +
      "&" +
      "membros=" +
      membros +
      "&" +
      "privado=" +
      privado +
      "&" +
      "nome_autor=" +
      nome_autor +
      "&" +
      "id_autor=" +
      id_autor;

    const request = async () => {
      await fetch(uri)
        .then(function (data) {
          //alert("Caso adicionado com sucesso.");
        })
        .catch(function (error) {
          console.log(error);
        });
    };

    request();
  }
}

function initCasosExemplo() {
  firestore
    .collection("casos")
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        console.log("Não há casos. Adicionado exemplos...");
        addCasosExemplo();
      } else console.log("Já existem casos exemplo.");
    })
    .catch((err) => {
      console.log("Error getting collection ", err);
    });
}

async function showAvailableCasos() {
  var currentUser = JSON.parse(window.localStorage.getItem("userDoc"));
  // utilizador teste

  var nome = "";
  var id = "";
  var foto = "";
  if (currentUser != null) {
    nome = currentUser[parentsParameters.NAME[languageCode]];
    id = currentUser[parentsParameters.EMAIL[languageCode]];
    foto = currentUser[parentsParameters.PHOTO[languageCode]];
  }

  const project_id = firebaseConfig.projectId;

  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/getUserAvailableCasos?" +
    "id=" +
    id;

  const request = async () => {
    let casos;
    await fetch(uri)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        casos = data;
      })
      .catch(function (error) {
        console.log(error.toString());
      });

    return casos;
  };

  return request();
}

async function addNewCaso() {
  // utilizador teste TODO: obtê-lo do Firebase
  const userAtual = "Diogo Gomes";
  const userAtualId = "hdf4684TKF";

  let titulo = "";
  let descricao = "";
  let membros = "";
  let privado = false;

  let uri =
    "https://us-central1-mytestproject-ffacc.cloudfunctions.net/addCaso?" +
    "titulo=" +
    titulo +
    "&" +
    "descricao=" +
    descricao +
    "&" +
    "membros=" +
    membros +
    "&" +
    "privado=" +
    privado +
    "&" +
    "nome_autor=" +
    userAtual +
    "&" +
    "id_autor=" +
    userAtualId;

  const request = async () => {
    let casos;
    await fetch(uri)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        console.log("Showcasosdata -> ", data);
        console.log("primeiro caso titulo -> ", data[0].titulo);
        casos = data;
      })
      .catch(function (error) {
        console.log(error);
      });

    return casos;
  };

  return request();
}


/*
* function to delete an issue/case
* */
function eraseCaso(id) {
  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/deleteCaso?" +
    "id=" + id;

  const request = async () => {
    let response = {};
    await fetch(uri)
      .then((resp) => resp.json()) // Transform the data into blob / file
      .then(function (resp) {
        response = resp;
        console.log("Case removed successfully");
      })
      .catch(function (error) {
        response = null;
        console.log("Delete case error: " + error);
      });

    return response;
  };

  return request();
}

// ---------------- NOVAS VERSOES --------------

export { initCasosExemplo, showAvailableCasos, eraseCaso};
