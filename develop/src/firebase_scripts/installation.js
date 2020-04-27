import {
  firestore,
  storageRef,
  initDoc,
  firebaseConfig,
} from "../firebase-config";
import firebase from "firebase";

import {getGravatarURL, defaultLogoFile, newParametersTypes, languageCode, newParametersEntities} from "../utils/general_utils";

let membersEmails = {};
let jsonCorrect = true; // controlar se o processament de JSON não teve erros
const jsonErrorMessage =
  "O ficheiro JSON fornecido é inválido!\n" +
  "Por favor, verifique se tem o formato conforme o manual de utilização e se a sintaxe está correta.\n" +
  "Obrigado.";

// ------------------------------------------------------------
// NOVOS PARAMETROS

function checkJSONparamsEntitiesAndTypes(json) {

  // check entities
  const entities = Object.keys(json).length;

  // check if null or undefined
  const parentParams = json[newParametersEntities.parent[languageCode]];
  const studentParams = json[newParametersEntities.student[languageCode]];

  console.log("parentParams -> " + parentParams);
  console.log("studentParams -> " + studentParams);

  if(entities === 0){ // sem parametros
    return true;
  }
  if(entities >=3){
    // apenas 2 entidades, no maximo (pai e filho)
    return false;
  }
  else if(1 <= entities <= 2) {
    // nenhum deles for pai nem filho, é inválido
    if((parentParams==null) && (studentParams==null)){
      return false;
    }
    else {
      // ver os parametros
      if(Object.keys(parentParams).length === 0 || Object.keys(studentParams).length === 0){
        // se algum deles existir, mas nao tiver parametros, não passa (para isso, não mete essa entidade no JSON)
        return false;
      }
      const TEXT = newParametersTypes.TEXT[languageCode];
      const INT = newParametersTypes.INT[languageCode];
      const FLOAT = newParametersTypes.FLOAT[languageCode];
      // verificar os parametros do EE
      if(parentParams!==null){
        const keys = Object.keys(parentParams);
        if(keys.length<0){
          for (let k in keys){
            console.log("k -> " + k);
            // se não for nenhum dos parametros, é inválido
            if(parentParams[k]!==TEXT && parentParams[k]!==INT && parentParams[k]!==FLOAT){
              return false;
            }
          }
        }
      }
      // verificar os parametros do aluno
      if(studentParams!==null){
        const keys = Object.keys(studentParams);
        if(keys.length<0){
          for (let k in keys){
            console.log("k -> " + k);
            // se não for nenhum dos parametros, é inválido
            if(parentParams[k]!==TEXT && parentParams[k]!==INT && parentParams[k]!==FLOAT){
              return false;
            }
          }
        }
      }

    }
  }







}

function getAndSaveJSONparamsData(jsonfile) {
  let reader = new FileReader();
  let fileString = "NR";

  reader.onloadend = function () {
    fileString = reader.result;
    //console.log("reader result depois de loaded -> ", fileString);
    try{
      const json = JSON.parse(fileString);
      saveNewParamsFromJSONToDB(json);
    }
    catch (e) {
      alert(jsonErrorMessage);
      jsonCorrect = false;
    }

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
      console.log("Novos parâmetros guardados com sucesso.");
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

function saveCaseToDB(json) {
  //console.log("Json to save to DB -> ", JSON.stringify(json));

  const docRef = firestore.collection("casos");
  const ref = docRef.doc();

  ref
    .set(json)
    .then(function () {
      alert("Sucesso!");
    })
    .catch(function (error) {
      alert("Erro no envio do caso, por favor, tente novamente!");
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

/*
 * analisa os dados processados do CSV e guarda-os na Firestore:
 *   - para cada EE, vai ver os educandos com o seu numero de Socio
 *     para esse educando ser adicionado ao array de educandos (documentos)
 *     desse EE;
 *   - no final, o EE (já com o seu array de educandos) é guardado na Firestore
 * */
/*
* TODO:
*  - funcao que faz replace dos "ND" vindos do CSV por strings vazias
*  - guardar os parametros extra que também venham do excel (verificar se são iguais ao JSON)*/
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

    const nome = parentDoc[Object.keys(parentDoc)[3]].split(" ")[0]; // primeiro nome
    const email = parentDoc[Object.keys(parentDoc)[6]];
    membersEmails[nome] = email; // armazenar nome e email para enviar email depois
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
    parentDoc["Admin"] = parentDoc["Admin"] === "true";

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

// --------- utilizador
/*
 * função para enviar email a avisar da importação */
async function sendImportEmailToParent(nome, email) {
  // TODO: remover este email hardcoded
  const tempEmail = "alexandrejflopes@ua.pt";

  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/sendUserImportEmail?" +
    "email=" +
    tempEmail +
    "&" +
    "nome=" +
    nome;

  const request = async () => {
    await fetch(uri)
      .then()
      .catch(function (error) {
        console.log("Error sending import email: " + error);
      });
  };

  return request();
}


function notifyAllParents() {
  for (let name in membersEmails) {
    const email = membersEmails[name];
    console.log(name + " : " + email);
    sendImportEmailToParent(name, email).then();
  }
}

// TODO: apagar no final
function createDefaultUser() {
  const docRefUser = firestore.doc("initialConfigs/defaultUser");

  const defaultEmail = "dgomes@pi-assoc-pais.com";
  const defaultPassword = "pass";
  const defaultName = "Diogo Gomes";

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
  //console.log("defaultLogoFile -> " + defaultLogoFile);
  const defaultLogoFileParts = defaultLogoFile.split("/");
  const defaultLogoFileName =
    defaultLogoFileParts[defaultLogoFileParts.length - 1];

  // ficar só com o nome e a extensão (porque o nome estava a ficar 'nome.<numeros>.<extensao>'....
  const fileNameParts = defaultLogoFileName.split(".");
  const nome = fileNameParts[0];
  const ext = fileNameParts[fileNameParts.length - 1];
  const filename = nome + "." + ext;

  //console.log("defaultLogoFile name -> " + filename);

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

    if (fileArray.length !== 0) {
      const file = fileArray[0]; // so da para fazer upload de 1 logo
      const uploadTask = uploadNewLogo(file);
      uploadTask.on(
        "state_changed",
        function (snapshot) {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          var progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload " + progress + "% concluído");
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log("Upload em pausa");
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log("Upload em progresso");
              break;
          }
        },
        function (error) {
          console.log("Upload não tem sucesso: " + error);
        },
        function () {
          // Handle successful uploads on complete
          // get the download URL
          uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            console.log("Logo URL -> ", downloadURL);
            continueInstallation(inputsInfo, downloadURL);
          });
        }
      );
    } else if (fileArray.length === 0) {
      const defaultLogoTask = uploadDefaultLogo();
      defaultLogoTask.then(function (downloadURL) {
        console.log("Default Logo URL -> ", downloadURL);
        continueInstallation(inputsInfo, downloadURL);
      });
    }
  } else alert("Por favor, preencha os campos em falta.");
}

function continueInstallation(inputsInfo, logoURL) {
  const setupDataDoc = () => {
    let temp = {};
    for (const label in inputsInfo) {
      // logo default, caso não seja fornecido nenhum
      if (label === "Logótipo") {
        temp[label] = logoURL;
        continue;
      }
      temp[label] = inputsInfo[label].value;
    }

    return temp;
  };

  const dataDoc = setupDataDoc();

  notifyAllParents();

  console.log("dataDoc antes de instalar -> " + JSON.stringify(dataDoc));

  const docRef = firestore.doc("initialConfigs/parameters");

  //alert("ler os consoles");

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
          createDefaultUser();
          alert(
            "A associação foi registada com sucesso e todos os seus membros foram notificados por email.\n" +
              "Por favor consulte o seu email para começar a usar a plataforma.\n\n" +
              "Nota: se não recebeu nenhum email, aguarde ou verifique a pasta de Lixo ou Spam. Obrigado."
          );
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
export { install, saveRegistToDB, saveCaseToDB, getGravatarURL };
