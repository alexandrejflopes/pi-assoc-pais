


$(document).ready(function(){
    


});

$( window ).on( "load", function() {
    console.log( "ENTREI :)" );
    //WriteToFile();
    //WriteToFile();
    wf();
    /*const fs = require('fs');

    const path = 'test.txt';

    try {
        if (fs.existsSync(path)) {
          console.log("Ficheiro existe");
        }
      } catch(err) {
        console.error(err);
      }*/
    
});

function wf(){
    var blob = new Blob(["This is my first text."], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "testfile1.txt");
}


function WriteToFile() {

    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var s = fso.CreateTextFile("test.txt", true);
    s.WriteLine("This is a test");
    s.Close();
 }




    