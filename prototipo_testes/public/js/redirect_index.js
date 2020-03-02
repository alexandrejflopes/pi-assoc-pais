


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
        window.location.href = "index2.html";
        console.log("Vou mudar de página!");
    }
}

function installation() {
    instalacaoFinalizada = true;
    window.localStorage.setItem("instalacaoFinalizada", instalacaoFinalizada.toString());
    console.log("instalacaoFinalizada -> " + instalacaoFinalizada);
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






    