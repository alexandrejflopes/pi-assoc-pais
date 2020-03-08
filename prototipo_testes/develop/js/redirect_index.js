


function createDefaultUser() {

    var docRefUser = firestore.doc("initialConfigs/defaultUser");

    var defaultEmail = "ricardo@email.pt";
    var defaultPassword = "pass";
    var defaultName = "Ricardo Silva";

    var defaultUser = {
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

function uploadLogo() {
    //var imagesRef = storageRef.child("images");

    var file = document.getElementById('logoInput').files[0];

    storageRef.child('logo/' + file.name).put(file)
        .then(function(snapshot) {
        console.log('Uploaded a blob or file!');
    })
        .catch(function (error) {
            console.log(error);
        });
}

function installation() {

    //var alert_panel = document.getElementById("alertaVerificacao");

    var validatedFields = false;

    const associacaoInput = document.querySelector("#associacaoInput").value;
    const logoInput = document.querySelector("#logoInput").value;
    const emailInput = document.querySelector("#emailInput").value;
    const ibanInput = document.querySelector("#ibanInput").value;
    //const fileInput = document.querySelector("#fileInput");


    if(associacaoInput !== "" && emailInput !== "" && ibanInput !== "" && logoInput!== ""){
        validatedFields = true;
    }


    if(validatedFields){

        //alert_panel.style.display = "none";

        uploadLogo();

        var dataDoc = {
            associacao : associacaoInput,
            email : emailInput,
            iban : ibanInput
        };

        var docRef = firestore.doc("initialConfigs/parameters");


        docRef.set(dataDoc)
            .then(function () {
                // ------------- documento instalacao
                var doc = {
                    installation : true
                };

                initDoc.set(doc)
                    .then(function () {
                        console.log("initDoc -> ", doc);
                        createDefaultUser(); // TODO: usar Firebase Authentication
                        window.location.href = "login.html";

                    }).catch(function (error) {
                    alert("Erro: " + error);

                });


            }).catch(function (error) {
            alert("Erro: " + error);

        });

    }
    else alert("Campos em falta.")




}

/*
function resetInstallation() {
    instalacaoFinalizada = false;
    window.localStorage.setItem("instalacaoFinalizada", instalacaoFinalizada.toString());
    console.log("instalacaoFinalizada -> " + instalacaoFinalizada);
}*/








    