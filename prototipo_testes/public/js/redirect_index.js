


$(document).ready(function(){
    


});


document.onreadystatechange = function(e){
    if(document.readyState === "complete"){
        console.log("PRONTO!");
        //checkInstallation();
    }
};


$( window ).on( "load", function() {
    console.log( "ENTREI :)" );

    
});

$(document).ready(function(){
    //
});

function wf(){
    var blob = new Blob(["This is my first text."], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "testfile1.txt");
}

function checkInstallation() {
    instalacaoFinalizada = window.localStorage.getItem("instalacaoFinalizada");
    console.log("instalacaoFinalizadaRefresh -> " + instalacaoFinalizada);
    //instalacaoFinalizada = false;
    if(instalacaoFinalizada){
        window.location.href = "login.html";
        console.log("Vou mudar de página!");
    }
}

function installation() {

    // TODO: get all page elements and create registration document

    var validatedFields = false;

    const associacaoInput = document.querySelector("#associacaoInput").value;
    //const logoInput = document.querySelector("#logoInput").value;
    const emailInput = document.querySelector("#emailInput").value;
    const ibanInput = document.querySelector("#ibanInput").value;
    //const fileInput = document.querySelector("#fileInput");

    if(associacaoInput !== "" && emailInput !== "" && ibanInput !== ""){
        validatedFields = true;
    }


    if(validatedFields){

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
                        window.location.href = "login.html";

                    }).catch(function (error) {
                    alert("Erro: " + error);

                });


            }).catch(function (error) {
            alert("Erro: " + error);

        });

    }
    else alert("Campos em falta.");




}

function resetInstallation() {
    instalacaoFinalizada = false;
    window.localStorage.setItem("instalacaoFinalizada", instalacaoFinalizada.toString());
    console.log("instalacaoFinalizada -> " + instalacaoFinalizada);
}


function WriteToFile() {

    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var s = fso.CreateTextFile("test.txt", true);
    s.WriteLine("This is a test");
    s.Close();
 }






    