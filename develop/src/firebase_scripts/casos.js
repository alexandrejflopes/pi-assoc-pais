import { firestore, storageRef } from "../firebase-config";
import React from "react";

/*eslint-env jquery*/

function addCasosExemplo_ajax() {
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
    },
    {
      titulo: "Material insuficiente na sala 7",
      descricao:
        "Há carência de equipamento necessário para a realização das aulas Artes Visuais na sala 7",
      privado: false,
      membros: [],
    },
    {
      titulo: "Rixa entre o Gonçalo e o João do 1º ano",
      descricao:
        "Os dois alunos entraram numa rixa após, alegadamente, o João ter usado o afinador do Gonçalo" +
        "sem a sua autorização.",
      privado: true,
      membros: [
        { nome: "Paula", id: "pljouHGIHpo" },
        { nome: "José", id: "SIdjisdnDI" },
        { nome: "Graça", id: "kjFRDLvBed" },
      ],
    },
  ];

  for (let i = 0; i < casosExemplo.length; i++) {
    alert("caso atual -> " + JSON.stringify(casosExemplo[i]));
    console.log("caso atual -> ", casosExemplo[i]);

    const titulo = encodeURIComponent(casosExemplo[i].titulo);
    const descricao = encodeURIComponent(casosExemplo[i].descricao);
    const membros = encodeURIComponent(JSON.stringify(casosExemplo[i].membros));
    const privado = casosExemplo[i].privado;

    let uri =
      "https://us-central1-associacao-pais.cloudfunctions.net/addCaso?" +
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
      privado;

    alert("urI -> " + uri);
    console.log("urI -> ", uri);

    $.ajax({
      url: uri,
      async: true,
      error: function (err) {
        console.log(err);
      },
    }).then(function (data) {
      console.log(data);
      alert("Caso adicionado com sucesso.");
    });
  }
}

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
      id_autor: "hdf4684TKF",
    },
    {
      titulo: "Material insuficiente na sala 7",
      descricao:
        "Há carência de equipamento necessário para a realização das aulas Artes Visuais na sala 7",
      privado: false,
      membros: [],
      nome_autor: "Mário Silva",
      id_autor: "75hfJ4FTE",
    },
    {
      titulo: "Rixa entre o Gonçalo e o João do 1º ano",
      descricao:
        "Os dois alunos entraram numa rixa após, alegadamente, o João ter usado o afinador do Gonçalo" +
        "sem a sua autorização.",
      privado: true,
      membros: [
        { nome: "Paula", id: "pljouHGIHpo" },
        { nome: "José", id: "SIdjisdnDI" },
        { nome: "Graça", id: "kjFRDLvBed" },
      ],
      nome_autor: "Paula",
      id_autor: "mKgfGGdg6r4f",
    },
  ];

  for (let i = 0; i < casosExemplo.length; i++) {
    //alert("caso atual -> " + JSON.stringify(casosExemplo[i]));
    console.log("caso atual -> ", casosExemplo[i]);

    const titulo = encodeURIComponent(casosExemplo[i].titulo);
    const descricao = encodeURIComponent(casosExemplo[i].descricao);
    const membros = encodeURIComponent(JSON.stringify(casosExemplo[i].membros));
    const privado = casosExemplo[i].privado;
    const nome_autor = casosExemplo[i].nome_autor;
    const id_autor = casosExemplo[i].id_autor;

    let uri =
      "https://us-central1-associacao-pais.cloudfunctions.net/api/addCaso?" +
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

    //alert("urI -> " + uri);
    console.log("urI -> ", uri);

    const request = async () => {
      await fetch(uri)
        .then(function (data) {
          console.log(data);
          //alert("Caso adicionado com sucesso.");
          console.log("Caso adicionado com sucesso.");
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
  // utilizador teste
  const nome = "Diogo Gomes";
  const id = "hdf4684TKF";

  let uri =
    "https://us-central1-associacao-pais.cloudfunctions.net/api/getUserAvailableCasos?" +
    "id=" +
    id +
    "&" +
    "nome=" +
    nome;

  const request = async () => {
    let casos;
    await fetch(uri)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        console.log("Show casosdata -> ", data);
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

// ---------------- NOVAS VERSOES --------------







export { initCasosExemplo, showAvailableCasos };
