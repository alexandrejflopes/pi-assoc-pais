

function requestUser() {

    var insertedEmail = document.getElementById("emailInput").value;
    var insertedPassword = document.getElementById("passwordInput").value;

    console.log("insertedEmail: " + insertedEmail);
    console.log("insertedPassword: " + insertedPassword);

    //alert("entrei na funcao");


    var uri = "https://us-central1-associacao-pais.cloudfunctions.net/api/defaultUser";

    var loginSuccess = false;

    $.ajax({
        url: uri,
        async: false,
        error: function($xhr)
        {
            //
        }

    }).then(function(data) {


        //alert("recebi: " + JSON.stringify(data));

        var userDoc = data["defaultUser"];

        var emailRecebido = userDoc["email"];
        var passwordRecebida = userDoc["password"];

        //console.log("email recebido: " + emailRecebido);
        //console.log("password recebida: " + passwordRecebida);

        if(emailRecebido === insertedEmail && passwordRecebida === insertedPassword){
            removeDangerAlerts();
            loginSuccess = true;
            //alert("loginSucess!");
        }

        if(emailRecebido !== insertedEmail){
            showDangerAlerts(true, false);
        }
        else if(passwordRecebida !== insertedPassword){
            showDangerAlerts(false, true);
        }
        else{
            showCannotCheckLoginAlert();
        }

    });

    return loginSuccess;

}

function getDefaultUser() {

    var insertedEmail = document.getElementById("emailInput").value;
    var insertedPassword = document.getElementById("passwordInput").value;

    var loginSuccess = false;

    var defaultUserDoc = firestore.doc("initialConfigs/defaultUser");

    defaultUserDoc.get()
        .then((doc) => {
            alert(doc);
            if(doc && doc.exists){
                if(doc.email === insertedEmail && doc.password === insertedPassword){
                    removeDangerAlerts();
                    loginSuccess = true;
                    alert("loginSucess!");
                }

                if(doc.email !== insertedEmail){
                    showDangerAlerts(true, false);
                }
                if(doc.password !== insertedPassword){
                    showDangerAlerts(false, true);
                }
                else{
                    showCannotCheckLoginAlert();
                }

            }
            else console.log("erro: ", doc);
        })
        .catch((err) => {
            console.log(err);
        });

    console.log("vou devolver ", loginSuccess);

    return loginSuccess;

}

function showCannotCheckLoginAlert() {
    var verificacaoAlert = document.getElementById("alertaVerificacao");
    verificacaoAlert.style.display = "block";
}

function showDangerAlerts(showUserAlert, showPasswordAlert) {

    var alertaEmail = document.getElementById("alertaEmail");
    var passwordAlert = document.getElementById("alertaPassword");

    if(showUserAlert){
        alertaEmail.style.display = "block";
    }
    if(showPasswordAlert){
        passwordAlert.style.display = "block";
    }

}

function removeDangerAlerts() {
    var emailAlert = document.getElementById("alertaEmail");
    var passwordAlert = document.getElementById("alertaPassword");
    var verificacaoAlert = document.getElementById("alertaVerificacao");

    if (emailAlert.style.display === "block") {
        emailAlert.style.display = "none";
    }

    if (passwordAlert.style.display === "block") {
        passwordAlert.style.display = "none";
    }

    if (verificacaoAlert.style.display === "block") {
        verificacaoAlert.style.display = "none";
    }
}


function resetInstallation_v1() {
    // TODO: não está a dar -_-

    var initDoc = firestore.doc("installations/installationDoc");
    var parametersDoc = firestore.doc("initialConfigs/parameters");

    console.log("ENTREI no reset!");


    initDoc.delete()
        .then(function () {

            console.log("initDoc -> ", doc);
            console.log("initDoc eliminado com sucesso.")

        }).catch(function (error) {
        alert("Erro: " + error);

    });

    parametersDoc.delete()
        .then(function () {

            console.log("parametersDoc -> ", doc);
            console.log("parametersDoc eliminado com sucesso.")

        }).catch(function (error) {
        alert("Erro: " + error);

    });

    window.location.href = "installation.html";

}

function deleteLogos() {

    // Create a reference to the file to delete
    var listRef = storageRef.child("logo");

    listRef.listAll()
        // eslint-disable-next-line promise/always-return
        .then(() => {
            // eslint-disable-next-line promise/always-return
            for(i=0; i<res.items.length; i++){

                var logoPath = res.items[i].fullPath;
                var logoRef = storageRef.child(logoPath);

                logoRef.delete()
                    // eslint-disable-next-line promise/always-return
                    .then(() => {
                        console.log('logo ' + logoPath + ' eliminado com sucesso');
                    })
                    .catch((err) => {
                        console.error("Não consegui eliminar o logo " + logoPath + ": " + err);
                        return response.json({error:"Não consegui eliminar o logo " + logoPath + ": " + err});
                    });

            }

        }).catch((err) => {
        console.error(err);
    });

}

function resetInstallation() {

    var uri = "https://us-central1-associacao-pais.cloudfunctions.net/api/resetInstallation";

    //deleteLogos();


    $.ajax({
        url: uri,
        async: false,
        error: function($xhr)
        {
            //
        }

    }).then(function(data) {

        //alert("recebi: " + JSON.stringify(data));

        window.location.href = "installation.html";

    });

}



$(document).ready(function(){

    removeDangerAlerts();

    $( "#loginForm" ).submit(function( event ) {
        //alert("Cliquei.");
        removeDangerAlerts();

        var sucesso = requestUser();

        //alert("sucesso: " + sucesso);

        if (!sucesso) {
            event.preventDefault();
        } else {
            removeDangerAlerts();
        }

    });


});