

$(document).ready(function(){

    const docRef = firestore.doc("novaCol/Uum9eMHQUef8YV5mj0y6");

    const associacaoInput = document.getElementById("associacaoInput");
    const escolaInput = document.getElementById("escolaInput");
    const showDocButton = document.getElementById("showDocButton");

    const assocBD = document.getElementById("assocBD");
    const escolaBD = document.getElementById("escolaBD");
    const saveDocButton = document.getElementById("saveDocButton");



    saveDocButton.addEventListener("click", function () {

        const assoc_name = associacaoInput.value;
        const escola_name = escolaInput.value;

        alert(assoc_name);
        alert(escola_name);

        docRef.set({
            assoc_name : assoc_name,
            escola_name : escola_name
        }).then(function () {
            alert("Documento guardado!");
            //console.log("Documento guardado!");
            //await sleep(5000);
        }).catch(function (error) {
            alert("Erro: " + error);
            //console.log("Erro: ", error);
            //await sleep(5000);
        });

    });

    showDocButton.addEventListener("click", function () {

        //alert(assoc_name);
        //alert(escola_name);
        alert("Clicaste em mostrar documento");
        docRef.get().then(function (doc) {
            alert(doc);
            if(doc && doc.exists){
                const data = doc.data();
                assocBD.innerHTML = data.assoc_name;
                escolaBD.innerHTML = data.escola_name;

                alert("Recebi: " + data.assoc_name);
                alert("Recebi: " + data.escola_name);
            }
        }).catch(function (error) {
            alert(error);
        })

    });

});

