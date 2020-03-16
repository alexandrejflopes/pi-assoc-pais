import {firestore, storageRef, initDoc} from "../firebase-config";
import React from "react";



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
      console.log("defaultUserDoc -> ", defaultUser);

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


  console.log("all_labels -> ", all_labels);
  console.log("all_inputs -> ", all_inputs);

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

  console.log("submitted que vou devolver -> ", submittedInputs);


  return submittedInputs;


}



function removeAllInvalidFeedbacks() {

  const feedbacks = Array.from(document.querySelectorAll(".invalid-feedback"));
  console.log("feedbacks -> ", feedbacks);
  const inputs = Array.from(document.querySelectorAll("input"));
  console.log("inputs -> ", inputs);


  for(let i = 0; i<feedbacks.length; i++){
    console.log("f -> ", feedbacks[i]);
    feedbacks[i].style.display = "none";
  }

  for(let i = 0; i<inputs.length; i++){
    console.log("input a remover atual -> ", inputs);
    if (inputs[i].classList.contains("is-invalid")){
      console.log("remover invalid de ", inputs[i]);
      inputs[i].classList.remove("is-invalid");
    }
  }

}


function install() {

  removeAllInvalidFeedbacks();

  let validatedFields = true;
  let policyCheckboxChecked = true;


  const inputsInfo = getFormElementsAndValues(); // { "labelText" : input }

  console.log("inputsInfo -> ", inputsInfo);

  for(const label in inputsInfo){
    let input = inputsInfo[label];
    console.log("input atual -> ", input);
      if (input.value === "" && input.required){
        input.classList.add("is-invalid");
        console.log("inputID -> ", input.id);
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

    uploadLogo("configAssocLogo");
    uploadAssocDataFiles("configAssocMembers");
    uploadAssocDataFiles("configAssocStudents");
    uploadAssocDataFiles("configAssocNewParams");

    const setupDataDoc = () => {
      let temp = {};
      for(const label in inputsInfo){
        temp[label] = inputsInfo[label].value;
      }

      return temp;
    };

    const dataDoc = setupDataDoc();

    console.log("dataDoc -> ", dataDoc);

    const docRef = firestore.doc("initialConfigs/parameters");


    docRef.set(dataDoc)
      .then(function () {
        // ------------- documento instalacao
        const doc = {
          installation : true
        };

        initDoc.set(doc)
          .then(function () {
            console.log("initDoc -> ", doc);
            createDefaultUser(); // TODO: usar Firebase Authentication
            window.location.href = "/"; // TODO: ir para o login

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
