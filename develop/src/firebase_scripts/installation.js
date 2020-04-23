import { firestore, storageRef, initDoc, storage } from "../firebase-config";
import firebase from "firebase";
import React from "react";
import MD5 from "crypto-js/md5";

import defaultLogoFile from "../assets/assoc-pais-logo-default.png";
const defaultIBAN = "PT50 1234 4321 12345678901 72";

// ------------------------------------------------------------
// NOVOS PARAMETROS

function getAndSaveJSONparamsData(jsonfile) {
  let reader = new FileReader();
  let fileString = "NR";

  reader.onloadend = function () {
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

  //console.log("paramsDoc -> ", paramsDoc);

  const docRef = firestore.doc("initialConfigs/newParameters");

  docRef
    .set(paramsDoc)
    .then(function () {
      alert("Novos parâmetros guardados com sucesso.");
    })
    .catch(function (error) {
      alert("Erro: " + error);
    });
}

function saveRegistToDB(json) {
  //console.log("Json to save to DB -> ", JSON.stringify(json));

  const docRef = firestore.collection("parents");
  const parentRef = docRef.doc(json["Email"]);

  parentRef
    .set(json)
    .then(function () {
      alert("Sucesso no envio da inscrição!");
    })
    .catch(function (error) {
      alert("Erro no envio da inscrição, por favor, tente novamente!");
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

  parentReader.onloadend = function () {
    parentFileString = parentReader.result;
    const parentList = setupCSVData(parentFileString);

    childrenReader.onloadend = function () {
      childrenFileString = childrenReader.result;
      const childrenList = setupCSVData(childrenFileString);

      saveParentsAndChildrenFromFileDatatoDB(parentList, childrenList);
    };
  };

  parentReader.readAsText(parentsFile, "UTF-8");
  childrenReader.readAsText(childrenFile, "UTF-8");
}

function setupCSVData(fileString) {
  const allLines = fileString.split(/\r\n|\n/).filter((item) => item); // remover strings vazias
  //console.log("allLines -> ", allLines);

  const headers = allLines[0].split(/[,;]+/).filter((item) => item); // remover strings vazias
  let rowsData = [];

  //console.log("headers -> ", headers);

  for (let i = 1; i < allLines.length; i++) {
    let lineDict = {};

    let dadosLinha = allLines[i].split(/[,;]+/).filter((item) => item); // remover strings vazias

    //console.log("dadosLinha atual -> ", dadosLinha);

    //console.assert(dadosLinha.length === headers.length);

    for (let j = 0; j < dadosLinha.length; j++) {
      lineDict[headers[j]] = dadosLinha[j];
    }

    rowsData.push(lineDict);
  }

  return rowsData;
}


/* função para fazer hash do email com MD5 para o Gravatar */
function getGravatarURL(email) {
  const emailProcessed = (email.trim()).toLowerCase();
  const hashedEmail = MD5(emailProcessed); // hash do email em minusculas com MD5
  return "https://www.gravatar.com/avatar/" + hashedEmail +
    "?d=mp"; // avatar default caso nao haja avatar para o email fornecido

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
  const parentDocList = parentsList.sort((a, b) =>
    parseInt(a[Object.keys(a)[0]]) > parseInt(b[Object.keys(b)[0]]) ? 1 : -1
  );

  const childrenDocList = childrenList.sort((a, b) =>
    parseInt(a[Object.keys(a)[0]]) > parseInt(b[Object.keys(b)[0]]) ? 1 : -1
  );

  //console.log("parentDocList -> ", parentDocList);
  //console.log("childrenDocList -> ", childrenDocList);

  const docRef = firestore.collection("parents");

  // adicionar a cada EE os educandos com numSocio do EE igual ao EE atual
  for (let i = 0; i < parentDocList.length; i++) {
    let parentDoc = parentDocList[i];

    //console.log("parentDoc atual -> ", parentDoc);
    const numSocio = parentDoc[Object.keys(parentDoc)[0]];

    const email = parentDoc[Object.keys(parentDoc)[6]];
    //console.log("email parentDoc -> " + email);

    //console.log("numSocio atual -> ", numSocio);

    let parentChildren = []; // educandos do encarregado de educacao atual

    // procurar por educandos com EE com o numSocio acima
    for (let j = 0; j < childrenDocList.length; j++) {
      const child = childrenDocList[j];

      //console.log("child atual -> ", child);

      if (numSocio !== child[Object.keys(child)[0]])
        // se nao tem igual numSocio, entao nao e filho dele
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

    // converter o boolean de admin de string para boolean
    parentDoc["Admin"] = (parentDoc["Admin"] === "true");

    // adicionar outros parâmetros necessários
    parentDoc["Cotas"] = [];
    parentDoc["Data inscricao"] = new Date().toJSON().split("T")[0]; // obter data no formato 2015-03-25;
    parentDoc["Validated"] = true; // EEs importados são logo validados
    parentDoc["blocked"] = false; // EEs não estão bloqueados inicialmente

    // avatar
    parentDoc["photo"] = getGravatarURL(email);

    const parentRef = docRef.doc(email); // email como id do documento

    parentRef
      .set(parentDoc)
      .then(function () {
        //console.log("EE e educandos guardados com sucesso.");
      })
      .catch(function (error) {
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

  for (let i = 0; i < childrenDocList.length; i++) {
    let childDoc = childrenDocList[i];

    // adicionar array para educandos
    childDoc["Educandos"] = [];

    //console.log("childDoc atual -> ", childDoc);

    const parentRef = docRef.doc(childDoc[Object.keys(childDoc)[0]]); // numero socio

    parentRef
      .set(childDoc)
      .then(function () {
        //alert("EE guardado com sucesso.");
      })
      .catch(function (error) {
        alert("Erro: " + error);
      });
  }
}

/*
 * (possivelmente, nao usada)
 * analisa os dados processados do CSV de EE e guarda-os na Firestore:
 * */
function saveParentDataFromFiletoDB(file) {
  const parentDocList = setupCSVData(file);

  //console.log("parentDocList -> ", parentDocList);

  const docRef = firestore.collection("parents");

  for (let i = 0; i < parentDocList.length; i++) {
    let parentDoc = parentDocList[i];

    // adicionar array para educandos
    parentDoc["Educandos"] = [];

    //console.log("personsDoc atual -> ", parentDoc);

    const parentRef = docRef.doc(parentDoc[Object.keys(parentDoc)[0]]); // numero socio

    parentRef
      .set(parentDoc)
      .then(function () {
        //alert("EE guardado com sucesso.");
      })
      .catch(function (error) {
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
    email: defaultEmail,
    password: defaultPassword,
    nome: defaultName,
  };

  docRefUser
    .set(defaultUser)
    .then(function () {
      //console.log("defaultUserDoc -> ", defaultUser);
    })
    .catch(function (error) {
      alert("Erro: " + error);
    });
}


// --------- upload logos ---------

function uploadDefaultLogo() {
  // se não for carregado nenhum logo, considerar o default
  console.log("defaultLogoFile -> " + defaultLogoFile);
  const defaultLogoFileParts = defaultLogoFile.split("/");
  const defaultLogoFileName = defaultLogoFileParts[defaultLogoFileParts.length-1];

  // ficar só com o nome e a extensão (porque o nome estava a ficar 'nome.<numeros>.<extensao>'....
  const fileNameParts = defaultLogoFileName.split(".");
  const nome = fileNameParts[0];
  const ext = fileNameParts[fileNameParts.length-1];
  const filename = nome + "." + ext;

  console.log("defaultLogoFile name -> " + filename);

  return storageRef.child("logo/default/" + filename).getDownloadURL();
}

function uploadNewLogo(file) {
  const logoRef = storageRef.child("logo/" + file.name);
  return logoRef.put(file);
}

// --------------------------------

function uploadAssocDataFiles(inputID) {
  const file = document.getElementById(inputID).files[0];

  storageRef
    .child("assoc_config_files/" + file.name)
    .put(file)
    .then(function (snapshot) {
      //alert("Uploaded a blob or file!");
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

  for (let i = 0; i < all_labels.length; i++) {
    for (let j = 0; j < all_inputs.length; j++) {
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

      if (labelHtmlFor === inputId) {
        if (labelText.includes("(") || labelText.includes("/")) {
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

  for (let i = 0; i < feedbacks.length; i++) {
    //console.log("f -> ", feedbacks[i]);
    feedbacks[i].style.display = "none";
  }

  for (let i = 0; i < inputs.length; i++) {
    //console.log("input a remover atual -> ", inputs);
    if (inputs[i].classList.contains("is-invalid")) {
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

  for (const label in inputsInfo) {
    let input = inputsInfo[label];
    //console.log("input atual -> ", input);
    if (input.value === "" && input.required) {
      input.classList.add("is-invalid");
      //console.log("inputID -> ", input.id);
      document.querySelector("#" + input.id + "Feedback").style.display =
        "block";
      validatedFields = false; // se houver um input obrigatorio sem nada, não submete
      //break;
    }
  }

  // confirmar a checkBox
  const policyCheckbox = document.querySelector("input[type=checkbox]");
  if (!policyCheckbox.checked) {
    policyCheckboxChecked = false;
    document.querySelector("#" + policyCheckbox.id + "Feedback").style.display =
      "block";
  }

  //------------------------

  /*const setupDataDocTest = () => {
    let temp = {};
    for (const label in inputsInfo) {
      temp[label] = inputsInfo[label].value;
    }

    return temp;
  };

  const dataDocTest = setupDataDocTest();
  console.log("dataDocTest -> ", dataDocTest);*/

  //-------------------------

  if (validatedFields && policyCheckboxChecked) {
    // uploads
    //uploadNewLogo("configAssocLogo");
    uploadAssocDataFiles("configAssocMembers");
    uploadAssocDataFiles("configAssocStudents");
    uploadAssocDataFiles("configAssocNewParams");

    // ler ficheiros e guardar dados
    const paramsJSONfile = document.getElementById("configAssocNewParams")
      .files[0];
    const membersFile = document.getElementById("configAssocMembers").files[0];
    const studentsFile = document.getElementById("configAssocStudents")
      .files[0];

    getAndSaveJSONparamsData(paramsJSONfile);
    getandSaveCSVdata(membersFile, studentsFile);

    const fileArray = document.getElementById("configAssocLogo").files;

    if(fileArray.length!==0){
      const file = fileArray[0]; // so da para fazer upload de 1 logo
      const uploadTask = uploadNewLogo(file);
      uploadTask.on('state_changed', function(snapshot){
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload ' + progress + '% concluído');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload em pausa');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload em progresso');
            break;
        }
      }, function(error) {
          console.log("Upload não tem sucesso: " + error);
      }, function() {
        // Handle successful uploads on complete
        // get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
          console.log('Logo URL -> ', downloadURL);
          continueInstallation(inputsInfo, downloadURL);
        });
      });
    }
    else if(fileArray.length===0){
      const defaultLogoTask = uploadDefaultLogo();
      defaultLogoTask
        .then(function(downloadURL) {
          console.log('Default Logo URL -> ', downloadURL);
          continueInstallation(inputsInfo, downloadURL);
        });

    }

  } else alert("Campos em falta.");
}


function continueInstallation(inputsInfo, logoURL) {

  const setupDataDoc = () => {
    let temp = {};
    for (const label in inputsInfo) {
      // IBAN default, caso não seja fornecido nenhum
      if(label==="IBAN" && inputsInfo[label].value===""){
        temp[label] = defaultIBAN;
        continue;
      }
      // logo default, caso não seja fornecido nenhum
      if(label==="Logótipo"){
        temp[label] = logoURL;
        continue;
      }
      temp[label] = inputsInfo[label].value;
    }

    return temp;
  };

  const dataDoc = setupDataDoc();

  console.log("dataDoc antes de instalar -> " + JSON.stringify(dataDoc));

  const docRef = firestore.doc("initialConfigs/parameters");

  alert("ler os consoles");

  docRef
    .set(dataDoc)
    .then(function () {
      // ------------- documento instalacao
      const doc = {
        installation: true,
      };

      initDoc
        .set(doc)
        .then(function () {
          //console.log("initDoc -> ", doc);
          createDefaultUser(); // TODO: enviar link de auth para os emails
          window.location.href = "/";
        })
        .catch(function (error) {
          alert("Erro: " + error);
        });
    })
    .catch(function (error) {
      alert("Erro: " + error);
    });

}
export { install, saveRegistToDB };
