import {firestore, storageRef, initDoc} from "../firebase-config";
import React from "react";





// ------------------------------------------------------------
// NOVOS PARAMETROS

function getAndSaveJSONparamsData(jsonfile) {

  let reader = new FileReader();
  let fileString = "NR";

  reader.onloadend = function(){
    fileString = reader.result;
    //console.log("reader result depois de loaded -> ", fileString);
    const json = JSON.parse(fileString);
    saveNewParamsFromJSONToDB(json);
  };

  reader.readAsText(jsonfile, "UTF-8");

}


/*
* recebe um obeto JSON e guarda-o na FireStore
* */
function saveNewParamsFromJSONToDB(json) {

  const paramsDoc = json;

  // console.log("paramsDoc -> ", paramsDoc);

  const docRef = firestore.doc("initialConfigs/newParameters");

  docRef.set(paramsDoc)
    .then(function () {
      console.log("Novos parâmetros guardados com sucesso.")

    }).catch(function (error) {
    alert("Erro: " + error);

  });

}




// ------------------------------------------------------------
// PROCESSAR CSV


/*
* funcao que processa os CSV de membros e alunos:
*   dado um CSV, extrai os cabecalhos e analisa cada linha
*   - resultado para cada linha { "header1" : info1, "header2" : info2, ...}
* */
function getandSaveCSVdata(parentsFile, childrenFile) {

  const parentReader = new FileReader();
  const childrenReader = new FileReader();
  let parentFileString = "NR";
  let childrenFileString = "NR";


  parentReader.onloadend = function(){
    parentFileString = parentReader.result;
    const parentList = setupCSVData(parentFileString);


    childrenReader.onloadend = function(){
      childrenFileString = childrenReader.result;
      const childrenList = setupCSVData(childrenFileString);

      saveParentsAndChildrenFromFileDatatoDB(parentList, childrenList);
    };
  };

  parentReader.readAsText(parentsFile, "UTF-8");
  childrenReader.readAsText(childrenFile, "UTF-8");

}


function setupCSVData(fileString) {

  const allLines = fileString.split(/\r\n|\n/).filter(item => item); // remover strings vazias
  //console.log("allLines -> ", allLines);

  const headers = allLines[0].split(/[,;]+/).filter(item => item); // remover strings vazias
  let rowsData = [];


  //console.log("headers -> ", headers);


  for (let i=1; i<allLines.length; i++){

    let lineDict = {};

    let dadosLinha = allLines[i].split(/[,;]+/).filter(item => item); // remover strings vazias

    //console.log("dadosLinha atual -> ", dadosLinha);

    console.assert(dadosLinha.length === headers.length);

    for(let j=0; j<dadosLinha.length; j++){
      lineDict[headers[j]] = dadosLinha[j];
    }

    rowsData.push(lineDict);

  }


  return rowsData;

}


/*
* analisa os dados processados do CSV e guarda-os na Firestore:
*   - para cada EE, vai ver os educandos com o seu numero de Socio
*     para esse educando ser adicionado ao array de educandos (documentos)
*     desse EE;
*   - no final, o EE (já com o seu array de educandos) é guardado na Firestore
* */
function saveParentsAndChildrenFromFileDatatoDB(parentsList, childrenList) {

  // lista de filhos e pais, ordenados pelo numero de socio do EE
  const parentDocList = parentsList
    .sort((a, b) => (parseInt(a[Object.keys(a)[0]]) > parseInt(b[Object.keys(b)[0]])) ? 1 : -1);

  const childrenDocList = childrenList
    .sort((a, b) => (parseInt(a[Object.keys(a)[0]]) > parseInt(b[Object.keys(b)[0]])) ? 1 : -1);

  //console.log("parentDocList -> ",parentDocList);
  //console.log("childrenDocList -> ",childrenDocList);

  const docRef = firestore.collection("parents");

  // adicionar a cada EE os educandos com numSocio do EE igual ao EE atual
  for(let i=0; i<parentDocList.length; i++){
    let parentDoc = parentDocList[i];

    //console.log("parentDoc atual -> ",parentDoc);
    const numSocio = parentDoc[Object.keys(parentDoc)[0]];

    //console.log("numSocio atual -> ",numSocio);

    let parentChildren = []; // educandos do encarregado de educacao atual

    // procurar por educandos com EE com o numSocio acima
    for(let j=0; j<childrenDocList.length; j++){

      const child = childrenDocList[j];

      //console.log("child atual -> ", child);

      if(numSocio !== child[Object.keys(child)[0]]) // se nao tem igual numSocio, entao nao e filho dele
        continue;

      let childDoc = child;

      //console.log("childDoc a inserir -> ", childDoc);
      // remover o numero de socio e nome do EE, pois vai para dentro do documento do seu EE
      delete childDoc[Object.keys(childDoc)[0]];
      delete childDoc[Object.keys(childDoc)[0]]; // remover o 0 porque o que estava a 1 passou a zero na linha de cima

      parentChildren.push(childDoc);
    }


    // adicionar array para educandos
    parentDoc["Educandos"] = parentChildren;


    const parentRef = docRef.doc(numSocio); // numero socio

    parentRef.set(parentDoc)
      .then(function () {
        console.log("EE e educandos guardados com sucesso.")

      }).catch(function (error) {
      alert("Erro: " + error);

    });
  }


}


/*
* (nao usada)
* analisa os dados processados do CSV de educandos e guarda-os na Firestore:
* */
function saveChildDataFromFiletoDB(file) {

  const childrenDocList = setupCSVData(file);

  //console.log("childrenDocList -> ", childrenDocList);

  const docRef = firestore.collection("children");


  for(let i=0; i<childrenDocList.length; i++){
    let childDoc = childrenDocList[i];

    // adicionar array para educandos
    childDoc["Educandos"] = [];

    //console.log("childDoc atual -> ", childDoc);

    const parentRef = docRef.doc(childDoc[Object.keys(childDoc)[0]]); // numero socio

    parentRef.set(childDoc)
      .then(function () {
        console.log("Aluno guardado com sucesso.")

      }).catch(function (error) {
      alert("Erro: " + error);

    });
  }


}

/*
* (nao usada)
* analisa os dados processados do CSV de EE e guarda-os na Firestore:
* */
function saveParentDataFromFiletoDB(file) {

  const parentDocList = setupCSVData(file);

  //console.log("parentDocList -> ", parentDocList);

  const docRef = firestore.collection("parents");


  for(let i=0; i<parentDocList.length; i++){
    let parentDoc = parentDocList[i];

    // adicionar array para educandos
    parentDoc["Educandos"] = [];

    //console.log("personsDoc atual -> ", parentDoc);

    const parentRef = docRef.doc(parentDoc[Object.keys(parentDoc)[0]]); // numero socio

    parentRef.set(parentDoc)
      .then(function () {
        console.log("EE guardado com sucesso.")

      }).catch(function (error) {
      alert("Erro: " + error);

    });
  }

}




function createDefaultUser() {

  const docRefUser = firestore.doc("initialConfigs/defaultUser");

  const defaultEmail = "ricardo@email.pt";
  const defaultPassword = "pass";
  const defaultName = "Ricardo Silva";

  const defaultUser = {
    email : defaultEmail,
    password : defaultPassword,
    nome : defaultName
  };

  docRefUser.set(defaultUser)
    .then(function () {
      //console.log("defaultUserDoc -> ", defaultUser);

    }).catch(function (error) {
    alert("Erro: " + error);
  });

}

function uploadLogo(inputID) {
  //var imagesRef = storageRef.child("images");

  const file = document.getElementById(inputID).files[0];

  storageRef.child('logo/' + file.name).put(file)
    .then(function(snapshot) {
      alert('Uploaded a blob or file!');
    })
    .catch(function (error) {
      alert(error);
    });
}

function uploadAssocDataFiles(inputID) {

  const file = document.getElementById(inputID).files[0];

  storageRef.child('assoc_config_files/' + file.name).put(file)
    .then(function(snapshot) {
      alert('Uploaded a blob or file!');
    })
    .catch(function (error) {
      alert(error);
    });

}

function getFormElementsAndValues() {

  const all_labels = Array.from(document.querySelectorAll("label"));
  let all_inputs = Array.from(document.querySelectorAll("input"));
  all_inputs.push(document.querySelector("#configAssocDescricao")); // adicionar a textarea


  //console.log("all_labels -> ", all_labels);
  //console.log("all_inputs -> ", all_inputs);

  /*const assoc_name = document.querySelector("#configAssocName");
  const assoc_descricao = document.querySelector("#configAssocDescricao");
  const assoc_morada = document.querySelector("#configAssocAddress");
  const assoc_localidade = document.querySelector("#configAssocLocalidade");
  const assoc_codigo_postal = document.querySelector("#configAssocZip");
  const assoc_email = document.querySelector("#configAssocEmail");
  const assoc_telefone = document.querySelector("#configAssocPhone");
  const assoc_iban = document.querySelector("#configAssocIBAN");

  const assoc_logo = document.querySelector("#configAssocLogo");
  const assoc_members = document.querySelector("#configAssocMembers");
  const assoc_students = document.querySelector("#configAssocStudents");
  const assoc_params = document.querySelector("#configAssocNewParams");

  let allInputs = [assoc_name, assoc_descricao, assoc_morada, assoc_localidade, assoc_codigo_postal,
    assoc_email, assoc_telefone, assoc_iban, assoc_logo, assoc_members, assoc_students, assoc_params];*/

  let submittedInputs = {};

  //console.log("all_labels.length -> ", all_labels.length);
  //console.log("all_inputs.length -> ", all_inputs.length);

  for(let i = 0; i<all_labels.length; i++){
    for(let j = 0; j<all_inputs.length; j++){
      const label = all_labels[i];
      const input = all_inputs[j];

      //console.log("label atual: ", label + " : " + i);
      //console.log("input atual: ", input + " : " + j);

      let labelText = label.innerText;
      let labelHtmlFor = label.htmlFor;
      let inputId = input.id;

      //console.log("label atual text: ", labelText);
      //console.log("label atual htmlFor: ", labelHtmlFor);
      //console.log("input atual id: ", inputId);



      if (labelHtmlFor === inputId){
        if(labelText.includes("(") || labelText.includes("/")){
          labelText = labelText.split(" ")[0];
        }

        //console.log("vou adicionar: {" + labelText + " : " + inputId + "}");

        submittedInputs[labelText] = input;

        break;

      }

    }
  }

  //console.log("submitted que vou devolver -> ", submittedInputs);


  return submittedInputs;


}

function removeAllInvalidFeedbacks() {

  const feedbacks = Array.from(document.querySelectorAll(".invalid-feedback"));
  //console.log("feedbacks -> ", feedbacks);
  const inputs = Array.from(document.querySelectorAll("input"));
  //console.log("inputs -> ", inputs);


  for(let i = 0; i<feedbacks.length; i++){
    //console.log("f -> ", feedbacks[i]);
    feedbacks[i].style.display = "none";
  }

  for(let i = 0; i<inputs.length; i++){
    //console.log("input a remover atual -> ", inputs);
    if (inputs[i].classList.contains("is-invalid")){
      //console.log("remover invalid de ", inputs[i]);
      inputs[i].classList.remove("is-invalid");
    }
  }

}


function install() {

  removeAllInvalidFeedbacks();

  let validatedFields = true;
  let policyCheckboxChecked = true;


  const inputsInfo = getFormElementsAndValues(); // { "labelText" : input }

  //console.log("inputsInfo -> ", inputsInfo);

  for(const label in inputsInfo){
    let input = inputsInfo[label];
    //console.log("input atual -> ", input);
      if (input.value === "" && input.required){
        input.classList.add("is-invalid");
        //console.log("inputID -> ", input.id);
        document.querySelector("#" + input.id + "Feedback").style.display = "block";
        validatedFields = false; // se houver um input obrigatorio sem nada, não submete
        //break;
      }
  }


  // confirmar a checkBox
  const policyCheckbox = document.querySelector("input[type=checkbox]");
  if(!policyCheckbox.checked){
    policyCheckboxChecked = false;
    document.querySelector("#" + policyCheckbox.id + "Feedback").style.display = "block";
  }



  if(validatedFields && policyCheckboxChecked){

    // uploads
    uploadLogo("configAssocLogo");
    uploadAssocDataFiles("configAssocMembers");
    uploadAssocDataFiles("configAssocStudents");
    uploadAssocDataFiles("configAssocNewParams");

    // ler ficheiros e guardar dados
    const paramsJSONfile = document.getElementById("configAssocNewParams").files[0];
    const membersFile = document.getElementById("configAssocMembers").files[0];
    const studentsFile = document.getElementById("configAssocStudents").files[0];

    getAndSaveJSONparamsData(paramsJSONfile);
    getandSaveCSVdata(membersFile, studentsFile);

    const setupDataDoc = () => {
      let temp = {};
      for(const label in inputsInfo){
        temp[label] = inputsInfo[label].value;
      }

      return temp;
    };

    const dataDoc = setupDataDoc();

    //console.log("dataDoc -> ", dataDoc);

    const docRef = firestore.doc("initialConfigs/parameters");

    //alert("ler os consoles");


    docRef.set(dataDoc)
      .then(function () {
        // ------------- documento instalacao
        const doc = {
          installation : true
        };

        initDoc.set(doc)
          .then(function () {
            //console.log("initDoc -> ", doc);
            createDefaultUser(); // TODO: usar Firebase Authentication

            // redirecionar para a root, que depois da instalação redireciona para o login
            window.location.href = "/";

          }).catch(function (error) {
          alert("Erro: " + error);

        });


      }).catch(function (error) {
      alert("Erro: " + error);

    });

  }
  else alert("Campos em falta.")




}

export {install};
