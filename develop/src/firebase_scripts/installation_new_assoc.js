import { firestore, storageRef, initDoc, firebaseConfig } from "../firebase-config";
import firebase from "firebase";

import {getGravatarURL, defaultIBAN, defaultLogoFile, getRandomInteger} from "../utils/general_utils";

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

// ------------------------------------------------------------
// PROCESSAR CSV

// TODO: apagar em detrimento do envio de email para login
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

// -------------- pessoa que instala --------------

function createInstallerParent(nome, email) {

  const docRef = firestore.collection("parents");

  let parentDoc = {};

  //console.log("parentDoc atual -> ", parentDoc);
  const numSocio = getRandomInteger(10000,100000);

  parentDoc["Admin"] = true;
  parentDoc["Cargo"] = "";
  parentDoc["Cartão Cidadão"] = "";
  parentDoc["Cotas"] = [];
  parentDoc["Código Postal"] = "";
  parentDoc["Data inscricao"] = new Date().toJSON().split("T")[0]; // obter data no formato 2015-03-25;
  // adicionar array para educandos
  parentDoc["Educandos"] = [];
  parentDoc["Email"] = email;
  parentDoc["Localidade"] = "";
  parentDoc["Morada"] = "";
  parentDoc["NIF"] = "";
  parentDoc["Nome"] = nome;
  parentDoc["Número de Sócio"] = numSocio;
  parentDoc["Profissão"] = "";
  parentDoc["Quotas pagas"] = "";
  parentDoc["Telemóvel"] = "";
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

async function sendEmailToInstallerParent(nome, email) {

  // TODO: remover este email hardcoded
  const tempEmail = "alexandrejflopes@ua.pt";

  const project_id = firebaseConfig.projectId;
  let uri = "https://us-central1-" + project_id + ".cloudfunctions.net/api/sendUserImportEmail?" +
    "email=" + tempEmail + "&" +
    "nome=" + nome;

  //alert("uri -> " + uri);
  const request = async () => {
    await fetch(uri)
      .then()
      .catch(function (error) {
        console.log("Error sendindo import email: " + error);
      });
  };

  return request();

}

// ------------------------------------------------


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

  if (validatedFields && policyCheckboxChecked) {
    // uploads
    uploadAssocDataFiles("configAssocNewParams");

    // ler ficheiros e guardar dados
    const paramsJSONfile = document.getElementById("configAssocNewParams").files[0];

    getAndSaveJSONparamsData(paramsJSONfile);

    const fileArray = document.getElementById("configAssocLogo").files;

    if(fileArray.length!==0){
      const file = fileArray[0]; // so dá para fazer upload de 1 logo
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

  } else alert("Por favor, preencha os campos em falta.");
}

function continueInstallation(inputsInfo, logoURL) {


  const setupDataDoc = () => {
    let temp = {};
    for (const label in inputsInfo) {
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
  const installerNome = dataDoc["O seu nome"];
  const installerEmail = dataDoc["O seu email"];
  // nome e email de quem instala para criar o doc do parent respetivo
  createInstallerParent(installerNome, installerEmail);

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
          sendEmailToInstallerParent(installerNome, installerEmail).then();
          alert("A associação foi registada com sucesso!\nPor favor consulte o seu email para começar a usar a plataforma.\n\n" +
            "Nota: se não recebeu nenhum email, aguarde ou verifique a pasta de Lixo ou Spam. Obrigado.");
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
export { install, saveRegistToDB, getGravatarURL };
