


$(document).ready(function(){

    showLogo();
    showUser();
    showAssocInfo();


});



function showLogo() {

    var listRef = storageRef.child("logo");


    // Find all the prefixes and items.
    listRef.listAll().then(function(res) {
        console.log("res: ", res);
        console.log("res itens: ", res.items.length);
        console.log("res itens 0: ", res.items[0]);

        console.log("fullPath: ", res.items[0].fullPath);
        var logoPath = res.items[0].fullPath;


        var objURL = "https://firebasestorage.googleapis.com/v0/b/" + firebaseConfig.storageBucket + "/o/" + encodeURIComponent(logoPath);

        $.ajax({
            url: objURL,
            async: false,
            error: function($xhr)
            {
                //
            }

        }).then(function(data) {

            var URL = objURL + "?alt=media&" + data.downloadTokens;

            console.log("URL: ", URL);

            document.getElementById("assoc_logo").src = URL;

        });


        /*res.items.forEach(function(itemRef) {
            console.log("itemRef: ", itemRef);
            console.log("itemRef fullPath: ", itemRef.fullPath);
        });*/

    }).catch(function(error) {
        console.log("error: ", error);
    });


}


function showAssocInfo() {

    var assocHeader = document.getElementById("assoc_name_header");
    var assocHeader2 = document.getElementById("assoc_name_h3");
    var assocEmailSpan = document.getElementById("assoc_email");
    var ibanEmailSpan = document.getElementById("assoc_iban");

    var uri = "https://us-central1-associacao-de-pais-prototipo.cloudfunctions.net/api/assocInfo";

    $.ajax({
        url: uri,
        async: false,
        error: function($xhr)
        {
            //
        }

    }).then(function(data) {

        //alert("recebi: " + JSON.stringify(data));

        var assocDoc = data["associacao"];

        var assocRecebida = assocDoc["associacao"];
        var emailRecebido = assocDoc["email"];
        var ibanRecebido = assocDoc["iban"];

        assocHeader.innerText = assocRecebida;
        assocHeader2.innerHTML = assocRecebida;
        assocEmailSpan.innerHTML = emailRecebido;
        ibanEmailSpan.innerHTML = ibanRecebido;

    });

}




function showUser() {

    var userNameHTML = document.getElementById("nomeUser");
    var nomeSpan = document.getElementById("nomeSpan");
    var userEmailHTML = document.getElementById("userEmailSpan");

    //alert("entrei na funcao");

    var uri = "https://us-central1-associacao-de-pais-prototipo.cloudfunctions.net/api/defaultUser";

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
        var nomeRecebido = userDoc["nome"];

        userNameHTML.innerHTML = nomeRecebido;
        nomeSpan.innerHTML = nomeRecebido;
        userEmailHTML.innerHTML = emailRecebido;

    });


}