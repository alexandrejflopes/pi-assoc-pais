const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const json2csv = require("json2csv").parse;
const pdfkit = require('pdfkit');

const { 
    APP_NAME,
    auth_URL
} = require('./globals');

admin.initializeApp();


// Configure the email transport using the default SMTP transport and a GMail account.
// For Gmail, enable these:
// 1. https://www.google.com/settings/security/lesssecureapps
// 2. https://accounts.google.com/DisplayUnlockCaptcha
// Estes links servem para mudar definições no email que usarmos para enviar notificações
// firebase functions:config:set gmail.email=<EmailEnvioNotificações>
// firebase functions:config:set gmail.password=<PalavrapasseEmailEnvioNotificações>

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
service: 'gmail',
auth: {
  user: gmailEmail,
  pass: gmailPassword,
},
});


/**
 * Funções relacionadas com os casos.
 */

/**
 * Função que quando chamada sem argumentos retorna todos os casos presentes na base de dados (na coleção casos)
 */
exports.getCasos = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let a = [];
    db.collection('casos').where("deleted", "==", false).get().then((snapshot) => {
        snapshot.forEach((doc) => {
            let data = doc.data();
            data["id"] = doc.id; 
            a.push(data);
        });
        return response.send(a);
    })
    .catch((err) => {
        console.log('Error getting documents', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função que serve para criar um novo caso na base de dados.
 * Leva os seguintes argumentos: titulo , descricao , privado(true/false) , membros (array de ficheiros json em string no caso de ser privado) e foto_autor (url fotografia criador)
 * Ex de membros: [ {'nome':'maria','id':'pljouHGIHpo', 'photo':'url'},{'nome':'jose','id':'SIdjisdnDI', 'photo':'url'} ]
 * Os argumentos deverão especificados nos query params.
 * O caso criado tem por defeito nenhum ficheiro, arquivado a false, observações vazias.
 * A função devolve o documento (JSON) do caso criado.
 * Os booleans da variavel privado são tratados como strings na função, por isso pode-se mandar diretamente estes valore sescritos no URL
 */
exports.addCaso = functions.https.onRequest((request, response) => {
    let db = admin.firestore();

    let caso = {};
    caso["titulo"] = request.query.titulo;
    caso["descricao"] = request.query.descricao;
    caso["privado"] = (request.query.privado === "true");
    caso["ficheiros"] = [];
    caso["arquivado"] = false;
    caso["observacoes"] = [];
    caso["autor"] = {"nome":request.query.nome_autor, "id":request.query.id_autor, "photo":request.query.foto_autor, "deleted":false};
    caso["deleted"] = false;
    
    if (request.query.privado === "true"){
        caso["membros"] = JSON.parse(request.query.membros);
        let c = 0;
        for (i = 0; i<caso["membros"].length; i++){
            if (caso["membros"][i]["id"] === request.query.id_autor){
                c = c + 1;
            }
        }
        if (c === 0) {
            caso["membros"].push(caso["autor"]);
        }   
    }
    else{
        caso["membros"] = [caso["autor"]];
    }
    caso["data_criacao"] = new Date();
    console.log("caso -> ", caso);
    

    db.collection('casos').add(caso).then(ref => {
        console.log("Added document");
        return response.send(caso);
    })
    .catch(err => {
        console.log("Error -> ,", err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função serve para eliminar um caso da base de dados.
 * Leva o seguinte argumento : id
 * Este argumento corresponde ao id do ficheiro/caso a ser eliminado.
 * Devolve apenas o tempo da eliminação do documento
 */
exports.deleteCaso = functions.https.onRequest((request, response) => {
    let db = admin.firestore();

    let id = request.query.id;

    db.collection('casos').doc(id).update({"deleted":true}).then((caso)=>{
        return response.send(caso);
    }).catch(err => {
        console.log("Failed to delete -> ", err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função serve para arquivar um caso (mudar o seu estado de arquivo)
 * Leva os seguintes argumentos: id , arquivado (true,false)
 * Sendo o id o id do caso a mudar de estado e a variavel arquivado um valor entre true ou false
 * Estes boleans são tratados como strings na função, por isso pode-se mandar diretamente estes valore sescritos no URL
 * Devolve apenas o tempo do update do documento
 */
exports.archiveCaso = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let archive = (request.query.arquivado === "true");

    db.collection('casos').doc(id).update({"arquivado":archive}).then((caso)=>{
        return response.send(caso);
    }).catch(err => {
        console.log("Failed to archive -> ", err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função serve para alterar o estado de privacidade de um caso
 * Leva os seguintes argumentos: id , privado (true ou false)
 * Sendo o id o id do caso a mudar de estado e a variavel privado um valor entre true ou false
 * Estes boleans são tratados como strings na função, por isso pode-se mandar diretamente estes valore sescritos no URL
 * Devolve apenas o tempo do update do documento
 */
exports.privacyCaso = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let privacy = (request.query.privado === "true");

    db.collection('casos').doc(id).update({"privado":privacy}).then((caso) => {
        return response.send(caso);
    }).catch(err => {
        console.log("Failed to archive -> ", err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Esta função faz um simples overwrite dos membros de um caso
 * Leva como argumentos: id , membros
 * Sendo o id o id do caso e o argumento membros um array de documentos como o referenciado na função addCaso
 * Devolve apenas o tempo do update do documento 
 * A seguir também estão implementadas funções de adicionar e remover utilizadores sem overwrite completo de forma a não haverem problemas de concorrencia
 */
exports.updateMembrosCaso = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let members = JSON.parse(request.query.membros);

    db.collection('casos').doc(id).get().then(doc => {
        if (!doc.exists) {
            console.log('No such document!');
            return response.status(404).send({"error":"No such document"});
        }
        else {
            let c = 0;
            for (i=0;i<members.length;i++) {
                if (members[i]['id'] === doc.get("autor")['id']) {
                    c = c + 1;
                }
            }
            if (c === 0) {
                members.push(doc.get("autor"))
            }
            return db.collection('parents').where("deleted","==", false).get().then(snapshot => {
                let l = []
                snapshot.forEach((doc) => {
                    l.push(doc.id);
                });
                console.log("Lista -> ", l)
                for (i=0;i<members.length;i++) {
                    if (!l.includes(members[i]['id'])) {
                        console.log("Failed to update membros, update contains nonexistent/deleted members ->", members[i]['id']);
                        return response.status(405).send({"error" : "Failed to update membros, update contains nonexistent/deleted members"});
                    }
                    members[i]["deleted"] = false;
                }
                return db.collection('casos').doc(id).update({"membros":members}).then((caso)=>{
                    return response.send(caso);
                }).catch(err => {
                    console.log("Failed to update membros -> ", err);
                    return response.status(405).send({"error" : err});
                });
            }).catch(err => {
                console.log("Failed to update membros -> ", err);
                return response.status(405).send({"error" : err});
            });
        }
    })
    .catch((err) => {
        console.log('Error getting documents', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Esta função adiciona um membro a um caso
 * Leva como argumentos: id , membro_nome , membro_id, membro_foto
 * Sendo o id o id do caso, membro nome o nome do utilizador a ser adicionado e membro_id o seu id
 * Devolve a lista de membros do caso após o update/adição
 * Todas as funções de adição e remoção de elementos de uma lista de documentos(como adicionar ou remover membros a casos, comentários ou anexos)
 * de forma a evitar problemas de concorrência de escritas utilizam uma transação e um read antes do write
 */
exports.addMembroCaso = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    //let member = JSON.parse(request.query.membro);
    let member_name = request.query.membro_nome;
    let member_id = request.query.membro_id;
    let member_photo = request.query.membro_foto;
    let docRef = db.collection('casos').doc(id);

    let transaction = db.runTransaction(t => {
        let members = [];
        return t.get(docRef).then(doc => {
            let data = doc.data();
            members = data["membros"];
            members.push({"nome":member_name,"id":member_id, "photo":member_photo});
            response.send(members);
            return (t.update(docRef,{"membros":members}));
        }).catch(err => {
            console.log("Failed to add member -> ", err);
            return response.status(405).send({"error" : err});
        });
    })
    .then(result => {
        console.log('Transaction success! -> ',result);
        return result;
    }).catch(err => {
        console.log('Transaction failure:', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Esta função remove um membro a um caso
 * Leva como argumentos: id , membro_id
 * Sendo o id o id do caso,e o membro_id o id do utilizador a ser removido
 * Devolve a lista de membros após o update
 */
exports.removeMembroCaso = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let member_id = request.query.membro_id;
    let docRef = db.collection('casos').doc(id);

    let transaction = db.runTransaction(t => {
        let members = [];
        return t.get(docRef).then(doc => {
            let data = doc.data();
            members = data["membros"];
            let i = 0;
            while (i < members.length) {
                if (members[i]["id"] === member_id) {
                    members.splice(i, 1);
                }
                else {
                    ++i;
                }
            }            
            response.send(members);
            return (t.update(docRef,{"membros":members}));
        }).catch(err => {
            console.log("Failed to remove member -> ", err);
            return response.status(405).send({"error" : err});
        });
    })
    .then(result => {
        console.log('Transaction success! -> ',result);
        return result;
    }).catch(err => {
        console.log('Transaction failure:', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Esta função edita a descrição de um caso
 * Leva como argumentos: id , descricao
 * Sendo o id o id do caso,e a descricao a descricao nova do caso
 * Devolve o documento do caso após o update
 */
exports.editDescricaoCaso = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let descricao = request.query.descricao;

    db.collection('casos').doc(id).update({"descricao":descricao}).then((caso)=>{
        return response.send(caso);
    }).catch(err => {
        console.log("Failed to update descricao -> ", err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Esta função permite um update overwrite de um documento de um caso completo
 * Leva como argumentos: id , titulo , descricao , privado (true ou false) , arquivado(true ou false) , membros
 * Os argumentos têm o mesmo significado que os da função addCaso, e o id é o id do caso a ser atualizado/overwritten
 * Devolve o tempo a que foi realizado o update
 */
exports.updateFullCaso = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let caso = {};
    caso["titulo"] = request.query.titulo;
    caso["descricao"] = request.query.descricao;
    caso["privado"] = (request.query.privado === "true");
    caso["arquivado"] = (request.query.arquivado === "true");
    if (request.query.privado === "true"){
        caso["membros"] = JSON.parse(request.query.membros);
    }
    else{
        caso["membros"] = [];
    }

    db.collection('casos').doc(id).update(caso).then((caso) => {
        return response.send(caso);
    }).catch(err => {
        console.log("Failed to update full case -> ", err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Esta função permite adicionar um comentário a um caso
 * Leva como argumento: id , user_id , user_name , observacao, photo
 * Sendo id o id do caso a adicionar o comentário , user_id o id do utilizador que realizou o comentário, user_name o seu nome,
 * , a observacao o conteúdo do comentário e photo a fotografia do utilizador que realizou o comentário
 * Devolve a lista de observações após este ter sido adicionado
 */
exports.addCommentCaso = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let user_id = request.query.user_id;
    let user_name = request.query.user_name;
    let observacao = request.query.observacao;
    let user_photo = request.query.photo;
    let docRef = db.collection('casos').doc(id);

    let transaction = db.runTransaction(t => {
        let observacoes = []
        return t.get(docRef).then(doc => {
            let data = doc.data();
            observacoes = data["observacoes"];
            observacoes.push({"user":{"nome":user_name,"id":user_id, "photo":user_photo, "deleted":false}, "conteudo":observacao, "tempo":new Date(), "editado":false, "deleted":false});
            response.send(observacoes);
            return (t.update(docRef,{"observacoes":observacoes}));
        })
        .catch(err => {
            console.log("Failed to add comment -> ", err);
            return response.status(405).send({"error" : err});
        });
    })
    .then(result => {
        console.log('Transaction success! -> ',result);
        return result;
    }).catch(err => {
        console.log('Transaction failure:', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Esta função serve remover um comentárioa um caso
 * Leva como argumentos: id , seconds , nanoseconds , user_id
 * O id refere-se ao id do caso, o seconds e nanoseconds são dois valores da timestamp de criação do comentário(quando
 * uma timestamp é enviada pelo pedido esta divide-se nestes dois valores) e o user_id é o id do utilizador que realizou o comentário
 * Esta função devolve a lista de comentários após a remoção
 */
exports.removeCommentCaso = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let timestamp_sec = parseInt(request.query.seconds,10);
    let timestamp_nanosecs = parseInt(request.query.nanoseconds,10);
    let user_id = request.query.user_id;
    let docRef = db.collection('casos').doc(id);

    let transaction = db.runTransaction(t => {
        let observacoes = [];
        return t.get(docRef).then(doc => {
            let data = doc.data();
            observacoes = data["observacoes"];
            for (i = 0; i < observacoes.length; i++){
                if(observacoes[i]["user"]["id"] === user_id && observacoes[i]["tempo"]["_seconds"]===timestamp_sec && observacoes[i]["tempo"]["_nanoseconds"]===timestamp_nanosecs ){
                    observacoes[i]['deleted'] = true;
                }
            }
            response.send(observacoes);
            return (t.update(docRef,{"observacoes":observacoes}));
        }).catch(err => {
            console.log("Failed to remove comment -> ", err);
            return response.status(405).send({"error" : err});
        });
    }).then(result => {
        console.log('Transaction success! -> ',result);
        return result;
    }).catch(err => {
        console.log('Transaction failure:', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Esta função serve para editar comentários
 * Esta função leva os mesmos argumentos que a função removeCommentCaso (porque precisa de pidentificar o comentário a ser alterado)
 * com a adicção do parametro observacao que representa o novo conteúdo do comentário
 * Esta função muda automáticamente o estado do comentário para editado
 * Devolve todos os comentários do caso após este update
 */
exports.editCommentCaso =functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let timestamp_sec = parseInt(request.query.seconds,10);
    let timestamp_nanosecs = parseInt(request.query.nanoseconds,10);
    let user_id = request.query.user_id;
    let observacao = request.query.observacao;
    let docRef = db.collection('casos').doc(id);

    let transaction = db.runTransaction(t => {
        let observacoes = [];
        return t.get(docRef).then(doc => {
            let data = doc.data();
            observacoes = data["observacoes"];
            for (i = 0; i < observacoes.length; i++){
                if(observacoes[i]["user"]["id"] === user_id && observacoes[i]["tempo"]["_seconds"]===timestamp_sec && observacoes[i]["tempo"]["_nanoseconds"]===timestamp_nanosecs ){
                    let obs = observacoes[i];
                    obs["editado"] = true;
                    obs["conteudo"] = observacao;
                    observacoes.splice(i,1,obs);
                }
            }
            response.send(observacoes);
            return (t.update(docRef,{"observacoes":observacoes}));
        }).catch(err => {
            console.log("Failed to edit comment -> ", err);
            return response.status(405).send({"error" : err});
        });
    }).then(result => {
        console.log('Transaction success! -> ',result);
        return result;
    }).catch(err => {
        console.log('Transaction failure:', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Esta função adiciona um anexo a um caso
 * Leva como argumentos id , nome_ficheiro , referencia
 * O id é o id do caso a que se vai adicionar o anexo, o nome_ficheiro o nome do ficheiro e a referência a referência do ficheiro
 * na storage
 * Devolve a lista de anexos após a adição do novo
 */
exports.addAnexoCaso = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let file_name = request.query.nome_ficheiro;
    let file_ref = request.query.referencia;

    let docRef = db.collection('casos').doc(id);

    let transaction = db.runTransaction(t => {
        let anexos = [];
        return t.get(docRef).then(doc => {
            let data = doc.data();
            anexos = data["ficheiros"];
            anexos.push({"nome": file_name,"referencia":file_ref});
            response.send(anexos);
            return (t.update(docRef,{"ficheiros":anexos}));
        })
        .catch(err => {
            console.log("Failed to add file -> ", err);
            return response.status(405).send({"error" : err});
        });
    })
    .then(result => {
        console.log('Transaction success! -> ',result);
        return result;
    }).catch(err => {
        console.log('Transaction failure:', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Esta funçãos remove um anexo a um caso
 * Recebe os mesmos argumentos da função addAnexoCaso de forma a identificar o anexo a remover
 * Devolve a lista de anexos após a remoção
 */
exports.removeAnexoCaso = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let file_name = request.query.nome_ficheiro;
    let file_ref = request.query.referencia;
    
    let docRef = db.collection('casos').doc(id);

    let transaction = db.runTransaction(t => {
        let anexos = [];
        return t.get(docRef).then(doc => {
            let data = doc.data();
            anexos = data["ficheiros"];
            let i= 0;
            while (i < anexos.length) {
                if (anexos[i]["nome"] === file_name && anexos[i]["referencia"] === file_ref) {
                    anexos.splice(i, 1);
                } else {
                    ++i;
                }
            }            
            response.send(anexos);
            return (t.update(docRef,{"ficheiros":anexos}));
        }).catch(err => {
            console.log("Failed to remove file -> ", err);
            return response.status(405).send({"error" : err});
        });
    })
    .then(result => {
        console.log('Transaction success! -> ',result);
        return result;
    }).catch(err => {
        console.log('Transaction failure:', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Esta função devolve uma lista de casos que serão disponíveis a um utilizador
 * Ou seja devolve os casos publicos juntamente com os privados a que um utilizador tem acesso
 * Leva como argumentos: id (id do utilizador)
 * Devolve uma lista de casos que um utilizador tem acesso 
 * No entanto a lista de casos têm apenas alguns atributos, não tem todos
 */
exports.getUserAvailableCasos = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let user_id = request.query.id;

    db.collection('parents').doc(user_id).get().then(doc => {
        if (!doc.exists) {
            console.log('No such document!');
            return response.status(404).send({"error":"No such document"});
        }
        else {
            if (doc.get('Admin')){
                return getAdminCasos(response);
            }
            else {
                return getNonAdminCasos(response, user_id);
            }
        }
    })
    .catch((err) => {
        console.log('Error getting documents', err);
        return response.status(405).send({"error" : err});
    });
});

async function getNonAdminCasos(response, user_id) {
    let db = admin.firestore();
    let availableCases = [];
    
    db.collection('casos').where("deleted", "==", false).get().then((snapshot) => {
        snapshot.forEach((doc) => {
            let c = 0;
            for (i=0;i<doc.get('membros').length;i++) {
                if (doc.get('membros')[i]['id'] === user_id) {
                    c = c + 1;
                }
            }
            if(!doc.get("privado") || c !== 0){
                let caso = {};
                caso["id"] = doc.id;
                caso["descricao"] = doc.get("descricao");
                caso["titulo"] = doc.get("titulo");
                caso["privado"] = doc.get("privado");
                caso["arquivado"] = doc.get("arquivado");
                caso["autor"] = doc.get("autor");
                caso["data_criacao"] = doc.get("data_criacao");
                caso["ficheiros"] = doc.get("ficheiros");
                caso["membros"] = doc.get("membros");
                caso["observacoes"] = doc.get("observacoes");
                caso["deleted"] = doc.get("deleted");
                availableCases.push(caso);
            }
        });
        return response.send(availableCases);
    })
    .catch((err) => {
        console.log('Error getting documents', err);
        return response.status(405).send({"error" : err});
    });
}

async function getAdminCasos(response) {
    let db = admin.firestore();
    let availableCases = [];
    
    db.collection('casos').where("deleted", "==", false).get().then((snapshot) => {
        snapshot.forEach((doc) => {
            let caso = {};
            caso["id"] = doc.id;
            caso["descricao"] = doc.get("descricao");
            caso["titulo"] = doc.get("titulo");
            caso["privado"] = doc.get("privado");
            caso["arquivado"] = doc.get("arquivado");
            caso["autor"] = doc.get("autor");
            caso["data_criacao"] = doc.get("data_criacao");
            caso["ficheiros"] = doc.get("ficheiros");
            caso["membros"] = doc.get("membros");
            caso["observacoes"] = doc.get("observacoes");
            caso["deleted"] = doc.get("deleted");
            availableCases.push(caso);
        });
        return response.send(availableCases);
    })
    .catch((err) => {
        console.log('Error getting documents', err);
        return response.status(405).send({"error" : err});
    });
}
/**
 * Função devolve um caso atravéz do seu id.
 * Leva como argumento um id de um caso
 * Devolve toda a informação sobre o mesmo
 */
exports.getCaso = functions.https.onRequest((request, response) =>{
    let db = admin.firestore();
    let id = request.query.id;
    db.collection('casos').doc(id).get().then(doc => {
        if (!doc.exists) {
            console.log('No such document!');
            return response.status(404).send({"error":"No such document"});
        }
        else {
            //console.log('Document data:', doc.data());
            let data = doc.data();
            data["id"] = doc.id;
            return response.send(data);
        }
    })
    .catch(err => {
        console.log('Query error:', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função altera o titulo de um caso
 * Leva como argumento um id de um caso (id) e o seu titulo novo (titulo).
 * Devolve o update time
 */
exports.updateTituloCaso = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let titulo = request.query.titulo;

    db.collection('casos').doc(id).update({"titulo":titulo}).then((caso) => {
        return response.send(caso);
    }).catch(err => {
        console.log("Failed to update titulo -> ", err);
        return response.status(405).send({"error" : err});
    });
})
/**
 * Funções relacionadas com os pais/encarregados de educação
 */


/**
 * Função devolve todos os documentos completos de pais/enc de educação.
 */
exports.getParents = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let a = [];
    db.collection('parents').where("deleted", "==", false).get().then((snapshot) => {
        snapshot.forEach((doc) => {
            let data = doc.data();
            data["id"] = doc.id; 
            a.push(data);
        });
        return response.send(a);
    })
    .catch((err) => {
        console.log('Error getting documents', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função devolve o documento completo de um utilizador levanto como argumento id o id do documento/utilizador
 */
exports.getParent = functions.https.onRequest((request, response) =>{
    let db = admin.firestore();
    let id = request.query.id;
    db.collection('parents').doc(id).get().then(doc => {
        if (!doc.exists) {
            console.log('No such document!');
            return response.status(404).send({"error":"No such document"});
        }
        else {
            //console.log('Document data:', doc.data());
            let data = doc.data();
            data["id"] = doc.id;
            return response.send(data);
        }
    })
    .catch(err => {
        console.log('Query error:', err);
        return response.status(405).send({"error" : err});
    });
});

/**
 * Função que devolve um dicionário a que a cada id de documento de um Encarregado de educação corresponde
 * uma lista com os seus educandos.
 * A função não leva nenhum argumento.
 */
exports.getEducandos = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let a = {};
    db.collection('parents').where("deleted", "==", false).get().then((snapshot) => {
        snapshot.forEach((doc) => {
            let encarregado = {};
            let educandos = doc.get("Educandos");
            let i = 0;
            while (i < educandos.length) {
                if (educandos[i]["deleted"]) {
                    educandos.splice(i, 1);
                } else {
                    ++i;
                }
            }
            a[doc.id] = educandos;
        });
        return response.send(a);
    })
    .catch((err) => {
        console.log('Error getting documents', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função que devolve uma lista com todos os números de sócio de todos os Encarregados de educação presentes na base de dados
 */
exports.getParentsNumeroSocio = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let a = [];
    db.collection('parents').where("deleted", "==", false).get().then((snapshot) => {
        snapshot.forEach((doc) => {
            if (!doc.get("deleted")) {
                a.push(doc.get("Número de Sócio"));
            }
        });
        return response.send(a);
    })
    .catch((err) => {
        console.log('Error getting documents', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função utlizada para adicionar um educando a um ficheiro de um parent
 * Leva como argumento o id do documento do parent e um educando (JSON com o educando a adicionar)
 * Devolve o ficheiro na integra do parent ao qual foi adicionado o educando.
 */
exports.addEducando = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let educando = JSON.parse(request.query.educando);
    let docRef = db.collection('parents').doc(id);

    let transaction = db.runTransaction(t => {
        let educandos = []
        return t.get(docRef).then(doc => {
            let data = doc.data();
            educandos = data["Educandos"];
            //educandos = doc.get("Educandos");
            educando["deleted"] = false;
            educandos.push(educando);
            data["Educandos"] = educandos;
            response.send(data);
            return (t.update(docRef,{"Educandos":educandos}));
        })
        .catch(err => {
            console.log("Failed to add educando -> ", err);
            return response.status(405).send({"error" : err});
        });
    })
    .then(result => {
        console.log('Transaction success! -> ',result);
        return result;
    }).catch(err => {
        console.log('Transaction failure:', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função utilizada para eliminar um educando do ficheiro de um parent
 * Leva como argumentos o id do documento do parent e o nome do educando.
 * Retorna o documento na integra do parent correspondente após a alteração
 */
exports.removeEducando = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let nome_educando = request.query.nome_educando;

    let docRef = db.collection('parents').doc(id);

    let transaction = db.runTransaction(t => {
        let educandos = [];
        return t.get(docRef).then(doc => {
            let data = doc.data();
            educandos = data["Educandos"];
            let i = 0;
            while (i < educandos.length) {
                if (educandos[i]["Nome"] === nome_educando) {
                    educandos[i]["deleted"] = true;
                }
                ++i;
            }
            data["Educandos"] = educandos;
            response.send(data);
            return (t.update(docRef,{"Educandos":educandos}));
        }).catch(err => {
            console.log("Failed to remove educando -> ", err);
            return response.status(405).send({"error" : err});
        });
    }).then(result => {
        console.log('Transaction success! -> ',result);
        return result;
    }).catch(err => {
        console.log('Transaction failure:', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função serve para alterar um número arbitrário de atributos de um ficheiro de parent
 * Isto significa que permite um Overwrite completo de um documento
 * Leva como argumento o id do documento a alterar e um doc que corresponde a um ficheiro na forma JSON.
 * Esse doc vai ser utilizado para fazer update aos atributos do documento.
 * Todos os atributos presentes nesse doc vão ser atualizados para o valor lá presente. No caso de existirem
 * atributos do documento parent da base de dados que não estão no doc, eles vão se manter inalterados.
 * Ou seja, os atributos que vão ser atualizados são os do doc enviado como argumento.
 * Warning : Os nomes dos atributos enviados no doc têm de ser os mesmos que têm na base de dados, se não vão ser criados atributos
 * novos com esses nomes no documento do parent.
 * Devolve o documento inteiro do parent depois do update
 */
exports.updateParent = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let doc = JSON.parse(request.query.doc);

    let docRef = db.collection('parents').doc(id);

    let nome;
    let foto;
    if ('Nome' in doc){
        nome = doc['Nome'];
    }
    else {
        nome = null;
    }
    if ('photo' in doc){
        foto = doc['photo'];
    }
    else {
        foto = null;
    }

    docRef.update(doc).then((parent)=>{
        if ('Nome' in doc || 'photo' in doc) {
            alterNomeFotoInCasos(id, nome, foto);
        }
        if ('Nome' in doc) {
            alterNomeInCotas(id, nome);
            alterNomeInCargoTransitions(id, nome);
        }
        docRef.get().then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
                return response.status(404).send({"error":"No such document"});
            }
            else {
                //console.log('Document data:', doc.data());
                let data = doc.data();
                data["id"] = doc.id;
                return response.send(data);
            }
        })
        .catch(err => {
            console.log("Failed to get doc -> ", err);
            return response.status(405).send({"error" : err});
        });
        return parent;
    }).catch(err => {
        console.log("Failed to update -> ", err);
        return response.status(405).send({"error" : err});
    });
});

async function alterNomeFotoInCasos(email, nome, foto) {
    let db = admin.firestore();
    
    return db.collection('casos').where("deleted", "==", false).get().then(snapshot => {
        arr = [];
        snapshot.forEach((doc) => {
            let c = 0;
            let data = doc.data();
            if (data['autor'] && data['autor']['id'] === email) {
                if (nome) {
                    data['autor']['nome'] = nome;
                }
                if (foto) {
                    data['autor']['photo'] = foto;
                }
                c = c + 1;
            }
            if (data['membros']) {
                for (i = 0; i < data['membros'].length; i++) {
                    if (data['membros'][i]['id'] === email){
                        if (nome) {
                            data['membros'][i]['nome'] = nome;
                        }
                        if (foto) {
                            data['membros'][i]['photo'] = foto;
                        }
                        c = c + 1;
                    }
                }
            }
            if (data['observacoes']) {
                for (i = 0; i < data['observacoes'].length; i++) {
                    if (data['observacoes'][i]['user']['id'] === email){
                        if (nome) {
                            data['observacoes'][i]['user']['nome'] = nome;
                        }
                        if (foto) {
                            data['observacoes'][i]['user']['photo'] = foto;
                        }
                        c = c + 1;
                    }
                }
            }
            if (c !== 0) {
                let v = db.collection('casos').doc(doc.id).update(data);
                arr.push(v);
            }
        });
        return arr;
    })
    .catch(err => {
        console.log('Error altering nome/foto in casos:', err);
        return err;
    });
}

async function alterNomeInCotas(email, nome) {
    let db = admin.firestore();
    
    return db.collection('quotas').where("deleted", "==", false).get().then(snapshot => {
        arr = [];
        snapshot.forEach((doc) => {
            let c = 0;
            let data = doc.data();
            if (data['Pagante'] && data['Pagante']['Id'] === email) {
                data['Pagante']['Nome'] = nome;
                c = c + 1;
            }
            if (data['Recetor'] && data['Recetor']['Id'] === email) {
                data['Recetor']['Nome'] = nome;
                c = c + 1;
            }
            if (c !== 0) {
                let v = db.collection('quotas').doc(doc.id).update(data);
                arr.push(v);
            }
        });
        return arr;
    })
    .catch(err => {
        console.log('Error altering nome in cotas:', err);
        return err;
    });
}

async function alterNomeInCargoTransitions(email, nome) {
    let db = admin.firestore();
    
    db.collection('cargoTransition').where("deleted", "==", false).get().then(snapshot => {
        snapshot.forEach((doc) => {
            let c = 0;
            let data = doc.data();
            if (data['email'] && data['email'] === email) {
                data['nome'] = nome;
                c = c + 1;
            }
            if (c !== 0) {
                db.collection('cargoTransition').doc(doc.id).update(data);
            }
        });
        return;
    })
    .catch(err => {
        console.log('Error altering email in cargo Transitions:', err);
        return err;
    });
}
/**
 * Função que elimina um parent
 * Leva como argumento o email do parent
 * Return o documento removido
 */
exports.deleteParent = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.email;
    let docRef = db.collection('parents').doc(id);

    docRef.get().then(doc => {
        if (!doc.exists) {
            console.log('No such document!');
            return response.status(404).send({"error":"No such document"});
        }
        else {
            //console.log('Document data:', doc.data());
            let data = doc.data();
            data["id"] = doc.id;
            db.collection('parents').doc(id).update({"deleted":true}).then((parent)=>{
                return response.send(data);
            }).catch(err => {
                console.log("Failed to delete -> ", err);
                return response.status(405).send({"error" : err});
            });
            return data;
        }
    })
    .catch(err => {
        console.log("Failed to get doc -> ", err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função que elimina um parent e as suas informações de authenticação/ do Google Auth
 * Leva como argumento o email do parent
 * Return o documento removido
 */
exports.deleteAccount = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.email;
    let docRef = db.collection('parents').doc(id);

    docRef.get().then(doc => {
        if (!doc.exists) {
            console.log('No such document!');
            return response.status(404).send({"error":"No such document"});
        }
        else if (doc.get("deleted")){
            console.log('User already deleted!');
            return response.status(404).send({"error":"User already deleted"});
        }
        else if (doc.get("admin")){
            console.log('User has admin cargo!');
            return response.status(404).send({"error":"User is admin"});
        }
        else {
            //console.log('Document data:', doc.data());
            let data = doc.data();
            data["deleted"] = true;
            db.collection('parents').doc(id).delete().then((parent)=>{
                db.collection('parents').doc('deleted_'+id).set(data);
                return admin.auth().getUserByEmail(id).then((userRecord) => {
                    return admin.auth().deleteUser(userRecord.uid).then(() => {
                        alterParentDeletedStatusInCotas(id, true)
                        alterParentDeletedInCasos(id, true)
                        data["id"] = doc.id;
                        return response.send(data);
                    })
                    .catch(err => {
                        console.log("Failed to delete auth record -> ", err);
                        return response.status(405).send({"error" : err});
                    });
                })
                .catch(err => {
                    console.log("Failed to get auth record -> ", err);
                    return response.status(405).send({"error" : err});
                });
            }).catch(err => {
                console.log("Failed to delete database record -> ", err);
                return response.status(405).send({"error" : err});
            });
            return data;
        }
    })
    .catch(err => {
        console.log("Failed to get doc -> ", err);
        return response.status(405).send({"error" : err});
    });
});
async function alterParentDeletedStatusInCotas(email, deleted) {
    let db = admin.firestore();
    
    return db.collection('quotas').where("deleted", "==", false).get().then(snapshot => {
        arr = [];
        snapshot.forEach((doc) => {
            let c = 0;
            let data = doc.data();
            if (data['Pagante'] && data['Pagante']['Id'] === email) {
                data['Pagante']['deleted'] = deleted;
                c = c + 1;
            }
            if (data['Recetor'] && data['Recetor']['Id'] === email) {
                data['Recetor']['deleted'] = deleted;
                c = c + 1;
            }
            if (c !== 0) {
                let v = db.collection('quotas').doc(doc.id).update(data);
                arr.push(v);
            }
        });
        return arr;
    })
    .catch(err => {
        console.log('Error altering deleted status in cotas:', err);
        return err;
    });
}
async function alterParentDeletedInCasos(email, deleted) {
    let db = admin.firestore();
    
    return db.collection('casos').where("deleted", "==", false).get().then(snapshot => {
        arr = [];
        snapshot.forEach((doc) => {
            let c = 0;
            let data = doc.data();
            if (data['autor'] && data['autor']['id'] === email) {
                data['autor']['deleted'] = deleted;
                c = c + 1;
            }
            if (data['membros'] && deleted) {
                let i = 0;
                while (i < data['membros'].length) {
                    if (data['membros'][i]['id'] === email) {
                        data['membros'].splice(i, 1);
                        c = c + 1;
                    } else {
                        ++i;
                    }
                }
            }
            if (data['observacoes']) {
                for (i = 0; i < data['observacoes'].length; i++) {
                    if (data['observacoes'][i]['user']['id'] === email){
                        data['observacoes'][i]['user']['deleted'] = deleted;
                        c = c + 1;
                    }
                }
            }
            if (c !== 0) {
                let v = db.collection('casos').doc(doc.id).update(data);
                arr.push(v);
            }
        });
        return arr;
    })
    .catch(err => {
        console.log('Error altering deleted status in casos:', err);
        return err;
    });
}
/**
 * Função que altera o estado de Validated de um parent para true
 * Leva como argumento o email do parent
 * Retorna o documento completo do parent após a alteração
 */
exports.approveParent = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.email;
    let data = request.query.data;
   
    let docRef = db.collection('parents').doc(id);

    let transaction = db.runTransaction(t => {
        return t.get(docRef).then(doc => {
            let parent = doc.data();
            parent["Validated"] = true;
            parent["Data inscricao"] = data;
            response.send(parent);
            return (t.update(docRef,{"Validated":true,"Data inscricao":data}));
        });
    })
    .then(result => {
        console.log('Transaction success! -> ',result);
        return result;
    }).catch(err => {
        console.log('Transaction failure:', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função que altera o valor do parametro Quotas Pagas para true em um documento parent
 * Leva como argumento o email do parent
 * Devolve o documento inteiro do parent depois do update
 */
exports.addFirstPayment = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.email;
    let docRef = db.collection('parents').doc(id);

    docRef.update({"Quotas Pagas":true}).then((parent)=>{
        docRef.get().then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
                return response.status(404).send({"error":"No such document"});
            }
            else {
                //console.log('Document data:', doc.data());
                let data = doc.data();
                data["id"] = doc.id;
                return response.send(data);
            }
        })
        .catch(err => {
            console.log("Failed to get doc -> ", err);
            return response.status(405).send({"error" : err});
        });
        return parent;
    }).catch(err => {
        console.log("Failed to update -> ", err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função utilizada para alterar o email de um parent
 * Leva os argumentos email (antigo) e new_email (novo email)
 * Devolve o documento do parent com o email alterado
 * Nota: De forma a manter o serviço de autenticação e a base de dados coerentes o email enviado terá de estar presente em ambos
 * os serviços e o novo email não poderá já existir nem na base de dados nem no serviço de autenticação 
 */
exports.alterParentEmail = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let email = request.query.email;
    let new_email = request.query.new_email;
    let document;
    
    admin.auth().getUserByEmail(email)
    .then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log('Successfully fetched user data:', userRecord.toJSON());
        console.log('Old email', email);
        console.log('New email', new_email);
        admin.auth().updateUser(userRecord.uid, {"email":new_email});
        return;
        //return response.send();
    })
    .then(() => {
        db.collection('parents').doc(email).get().then(doc => {
            if (!doc.exists) {
                console.log('Parent document with first email not found!');
                return response.status(404).send({"error":"No such document"});
            }
            else {
                document = doc.data();
                document["Email"] = new_email;
                console.log('Successfully fetched database parent data:', document);
                return db.collection('parents').doc(email).delete()
                .then(() => {
                    db.collection('parents').doc(new_email).set(document)
                    .then(() => {
                        console.log("Document successfully written!");
                        alterEmailInCasos(email, new_email);
                        alterEmailInCotas(email, new_email);
                        alterEmailInCargoTransitions(email, new_email);
                        response.send(document);
                        return;
                    })
                    .catch((error) => {
                        console.error("Error writing document: ", error);
                        return response.status(405).send({"error" : err});
                    });
                    return;
                })
                .catch(err => {
                    console.log('Error deleting user first email:', error);
                    return response.status(405).send({"error" : err});
                });
                //return;
            }
        }).catch(err => {
            console.log('Error getting user first email:', error);
            return response.status(405).send({"error" : err});
        });
        return;
    })
    .catch((error) => {
        console.log('Error updating user auth email:', error);
        console.log('data:', document);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função auxiliar da cloud function alterParentEmail
 */
async function alterEmailInCasos(oldEmail, newEmail) {
    let db = admin.firestore();
    
    db.collection('casos').where('deleted', '==', false).get().then(snapshot => {
        snapshot.forEach((doc) => {
            let c = 0;
            let data = doc.data();
            if (data['autor'] && data['autor']['id'] === oldEmail) {
                data['autor']['id'] = newEmail;
                c = c + 1;
            }
            if (data['membros']) {
                for (i = 0; i < data['membros'].length; i++) {
                    if (data['membros'][i]['id'] === oldEmail){
                        data['membros'][i]['id'] = newEmail;
                        c = c + 1;
                    }
                }
            } 
            if (data['observacoes']) {
                for (i = 0; i < data['observacoes'].length; i++) {
                    if (data['observacoes'][i]['user']['id'] === oldEmail){
                        data['observacoes'][i]['user']['id'] = newEmail;
                        c = c + 1;
                    }
                }
            }
            if (c !== 0) {
                db.collection('casos').doc(doc.id).update(data);
            }
        });
        return;
    })
    .catch(err => {
        console.log('Error altering email in casos:', err);
        return err;
    });
}
/**
 * Função auxiliar da cloud function alterParentEmail
 */
async function alterEmailInCotas(oldEmail, newEmail) {
    let db = admin.firestore();
    
    db.collection('quotas').where('deleted', '==', false).get().then(snapshot => {
        snapshot.forEach((doc) => {
            let c = 0;
            let data = doc.data();
            if (data['Pagante'] && data['Pagante']['Id'] === oldEmail) {
                data['Pagante']['Id'] = newEmail;
                c = c + 1;
            }
            if (data['Recetor'] && data['Recetor']['Id'] === oldEmail) {
                data['Recetor']['Id'] = newEmail;
                c = c + 1;
            }
            if (c !== 0) {
                db.collection('quotas').doc(doc.id).update(data);
            }
        });
        return;
    })
    .catch(err => {
        console.log('Error altering email in cotas:', err);
        return err;
    });
}
async function alterEmailInCargoTransitions(oldEmail, newEmail) {
    let db = admin.firestore();
    
    db.collection('cargoTransition').where('deleted', '==', false).get().then(snapshot => {
        snapshot.forEach((doc) => {
            let c = 0;
            let data = doc.data();
            if (data['email'] && data['email'] === oldEmail) {
                data['email'] = newEmail;
                c = c + 1;
            }
            if (c !== 0) {
                db.collection('cargoTransition').doc(doc.id).update(data);
            }
        });
        return;
    })
    .catch(err => {
        console.log('Error altering email in cargo Transitions:', err);
        return err;
    });
}
/**
 * Função devolve duas listas. Uma tem todos os cargs definidos na base de dados. Outra tem objetos que têm os 
 * campos id (id/email do utilizador) e o Cargo (cargo desse utilizador).
 * Formato da respoesta : {"cargos":["Associado(a)", ... ], "users": [ {"id":"email@gmail.com", "Cargo":"Associado(a)"} ]} 
 */
exports.getUserCargos = functions.https.onRequest((request, response) => {
    let db = admin.firestore();

    let res = {};

    return db.collection('cargos').get().then(snapshot => {
        let cargos = [];
        snapshot.forEach((doc) => {
            cargos.push(doc.id);
        });
        res['cargos'] = cargos;
        return db.collection('parents').where('deleted', '==', false).get().then(docs => {
            let users = [];
            docs.forEach((doc) => {
                let user = {'id':doc.id, 'Cargo':doc.get("Cargo")};
                users.push(user);
            });
            res['users'] = users;
            return response.send(res);
        })
        .catch((err) => {
            console.log('Error getting documents', err);
            return response.status(405).send({"error" : err});
        });
    })
    .catch((err) => {
        console.log('Error getting documents', err);
        return response.status(405).send({"error" : err});
    });

});

/**
 * Função executa a transição d eum cargo.
 * Isto inclui tomar com aceite o documento de transição e fazer o update das variáveis admin e cargo do utilizador associado.
 * Leva como argumento o id do documento da coleção cargoTransition correspondente á transição a ser efetuada.
 */
exports.executeCargoTransition = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    
    let id = request.query.id;

    return db.collection('cargoTransition').doc(id).get().then(doc => {
        if (!doc.exists) {
            console.log('No such document!');
            return response.status(404).send({"error":"No such document"});
        }
        let email = doc.get('email');
        let cargo = doc.get('cargo');
        return db.collection('cargos').get().then(snapshot => {
            let c = 0;
            let admin = false;
            snapshot.forEach((doc) => {
                if (doc.get('titulo') === cargo) {
                    admin = doc.get('admin');
                    c = c + 1;
                }
            });
            if (c === 0) {
                console.log("Nome de cargo desconhecido : ", cargo);
                return response.status(404).send({"error":"No such document"});
            }

            let transitionUpdate = db.collection('cargoTransition').doc(id).update({'aceite':true});
            let parentUpdate = db.collection('parents').doc(email).update({'Cargo':cargo, 'Admin':admin});
            
            return Promise.all([transitionUpdate, parentUpdate]).then((query_snapshots) => {
                return response.status(204).send();
            })
            .catch(err => {
                console.log('Update error:', err);
                return response.status(405).send({"error" : err});
            });
        })
        .catch(err => {
            console.log('Query error:', err);
            return response.status(405).send({"error" : err});
        });
    })
    .catch(err => {
        console.log('Query error:', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função que quando chamada sem argumentos retorna todos os documentos da coleção cargoTransitions relativos
 * ás transições de cargo.
 */
exports.getCargoTransitions = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let a = [];
    db.collection('cargoTransition').where('deleted', '==', false).get().then((snapshot) => {
        snapshot.forEach((doc) => {
            let data = doc.data();
            data['id'] = doc.id;
            a.push(data);
        });
        return response.send(a);
    })
    .catch((err) => {
        console.log('Error getting documents', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Funções relacionadas com as partes das cotas dos enc de educação
 */

/**
 * Função que adiciona um cota á coleção de cotas
 * Leva como argumentos: id (do utilizador ao qual se vai adicionar a cota/pagante), nome (do utilizador ao qual se vai adicionar a cota),
 * ano (letivo da cota), valor (a pagar pela cota), recetor_id, recetor_nome, confirmado_recetor, confirmado_emissor e notas
 * Os argumentos confirmado_recetor, confirmado_emissor, recetor_id e recetor_nome se não forem dados, os seus valores vão ser
 * automáticamente falso ou null, por default dependendo do tipo do atributo.
 */
exports.addCota = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let user_id = request.query.id;
    let user_nome = request.query.nome;
    let ano_letivo = request.query.ano;
    let valor = parseFloat(request.query.valor);
    let recetor_id = request.query.recetor_id;
    let recetor_nome = request.query.recetor_nome;
    let confirmado_recetor = (request.query.confirmado_recetor === "true");
    let confirmado_emissor = (request.query.confirmado_emissor === "true");
    let notas = request.query.notas;
    let data = request.query.data;

    let cota = {"Pagante":{"Nome":user_nome,"Id":user_id, "deleted":false},"Confirmado_Pagante":confirmado_emissor, "Confirmado_Recetor":confirmado_recetor,"Pago":false, "Valor":valor, "Ano_Letivo":ano_letivo, "Notas":notas, "Data":data, "deleted":false};

    if (recetor_id){
        cota["Recetor"] = {"Nome":recetor_nome,"Id":recetor_id, "deleted":false};
    }
    else {
        cota["Recetor"] = null;
    }

    db.collection('quotas').add(cota).then(ref => {
        console.log("Added cota");
        cota["id"] = ref.id;
        return response.send(cota);
    })
    .catch(err => {
        console.log("Error -> ,", err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função que altera alguns parametros de um documento de Cota
 * Leva como argumentos: id (do documento da cota), recetor_id (id do recetor), recetor_nome (nome do recetor), confirmado_recetor
 * (novo valor da confirmação do recetor), confirmado_emissor (novo valor da confirmação do emissor), notas (novo valor de notas)
 * Os parametros de recetor id e nome são opcionais, sendo que o valor de recetor vai se manter se o recetor id nãp for apresentado
 */
exports.updateCota = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let recetor_id = request.query.recetor_id;
    let recetor_nome = request.query.recetor_nome;
    let confirmado_recetor = (request.query.confirmado_recetor === "true");
    let confirmado_emissor = (request.query.confirmado_emissor === "true");
    let notas = request.query.notas;

    let docRef = db.collection('quotas').doc(id);

    let transaction = db.runTransaction(t => {
        return t.get(docRef).then(doc => {
            let cota = doc.data();
            if (recetor_id){
                cota["Recetor"] = {"Nome":recetor_nome,"Id":recetor_id, "deleted":false};
            }
            cota["Confirmado_Pagante"] = confirmado_emissor;
            cota["Confirmado_Recetor"] = confirmado_recetor;
            cota["Notas"] = notas;
            //response.send(cota);
            return (t.update(docRef,{"Confirmado_Pagante":confirmado_emissor,"Confirmado_Recetor":confirmado_recetor, "Recetor":cota["Recetor"], "Notas":notas}));
        });
    })
    .then(result => {
        console.log('Transaction success! -> ',result);
        response.send({"UpdateCota" : "success"});
        return result;
    }).catch(err => {
        console.log('Transaction failure:', err);
        return response.status(405).send({"error" : err});
    });

});
/**
 * Função utilizada para alterar para qualquer valor booleano o atributo Confirmado_Pagante quando este confirma ou "desconfirma"
 * o seu pagamento.
 * Leva como argumentos: id (da cota), confirmado (valor true ou false que se pretende colocar
 * em Confirmado_Pagante)
 * Nota: Se o valor de "Confirmado_Pagante" for colocado em true nesta função e o valor do atributo "Confirmado_Recetor" já for true, etão o valor de Pago também toma o valor
 * true.
 */
exports.confirmarPaganteCota = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let confirmar = (request.query.confirmado === "true");

    let docRef = db.collection('quotas').doc(id);

    let transaction = db.runTransaction(t => {
        let cotas = [];
        return t.get(docRef).then(doc => {
            let cota = doc.data();
            cota["Confirmado_Pagante"] = confirmar;
            if (confirmar && cota["Confirmado_Recetor"]) {
                cota["Pago"] = true;
            }
            response.send(cota);
            return (t.update(docRef,{"Confirmado_Pagante":cota["Confirmado_Pagante"],"Pago":cota["Pago"]}));
        });
    })
    .then(result => {
        console.log('Transaction success! -> ',result);
        return result;
    }).catch(err => {
        console.log('Transaction failure:', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função utilizada para alterar para qualquer valor booleano o atributo Confirmado_Recetor quando este confirma ou "desconfirma"
 * o pagamento do pagante de uma cota.
 * Leva como argumentos: id (da cota), confirmado (valor true ou false que se pretende colocar
 * em Confirmado_Recetor), recetor_id (id do recetor do pagamento), recetor_nome (nome do recetor do pagamento)
 * Os dois últimos atributos relativos ao recetor só são necessários quando o valor é colocado a true, de forma
 * a registar quem confirmou o pagamento, fora essa situação eles são opcionais
 * Nota: Se o valor de "Confirmado_Recetor" for colocado em true nesta função e o valor do atributo "Confirmado_Pagante" já for true, etão o valor de Pago também toma o valor
 * true.
 * Quando o valor de "Confirmado_Recetor" é colocado a true o valor de "Recetor" toma os valores referentes ao mesmo passados
 * nos argumentos. Quando o valor de "Confirmado_Recetor" é colocado a false, o valor de "Recetor" toma o valor null
 * apenas se o valor "Pago" ainda for false. Caso contrário o valor de "Recetor" não toma quaisquer alterações
 * de forma a não interferir com casos em que o valor "Pago" é alterado diretamente(em que o recetor também fica registado).
 */
exports.confirmarRecetorCota = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let confirmar = (request.query.confirmado === "true");
    //Estes próximos dois atributos só serão necessários se o pedido for para colocar a confirmação a true.
    let recetor_id = request.query.recetor_id;
    let recetor_nome = request.query.recetor_nome;
   
    let docRef = db.collection('quotas').doc(id);

    let transaction = db.runTransaction(t => {
        return t.get(docRef).then(doc => {
            let cota = doc.data();
            if (!confirmar && !cota["Pago"]){
                cota["Recetor"] = null;
            }
            else if (confirmar && !cota["Pago"]){
                cota["Recetor"] = {"Nome":recetor_nome,"Id":recetor_id, "deleted":false};
            }
            cota["Confirmado_Recetor"] = confirmar;
            if (confirmar && cota["Confirmado_Pagante"]){
                cota["Pago"] = true;
            }
            response.send(cota);
            return (t.update(docRef,{"Confirmado_Recetor":cota["Confirmado_Recetor"],"Pago":cota["Pago"],"Recetor":cota["Recetor"]}));
        });
    })
    .then(result => {
        console.log('Transaction success! -> ',result);
        return result;
    }).catch(err => {
        console.log('Transaction failure:', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função utilizada para alterar para qualquer valor booleano diretamente o atributo "Pago" de uma determinada cota por um recetor.
 * Leva como argumentos: id (da cota), pago (valor true ou false que se pretende colocar
 * em Pago), recetor_id (id do recetor do pagamento), recetor_nome (nome do recetor do pagamento)
 * Os dois últimos atributos relativos ao recetor só são necessários quando o valor é colocado a true, de forma
 * a registar quem confirmou o pagamento, fora essa situação eles são opcionais.
 * Nota: Quando o valor é colocado a true e ele antes da operação não era true o valor de Recetor é alterado para os valores
 * dados como argumento. Quando é colocado a falso e ambas as confirmações(pagante e recetor) estiverem a falso as informações do
 * recetor voltam a ser null. E quando é colocado a falso, mas ambas as confirmações estiverem a verdadeiro o pedido vai ser
 * recusado (por representar uma impossibilidade, em que ambos os lados confirmaram o pagamento mas este não está realizado)
 * pelo que vai responder com uma mensagem e com status 403.
 */
exports.pagoCota = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let pago = (request.query.pago === "true");

    //Estes próximos dois atributos só serão necessários se o pedido for para colocar o pagamento a true.
    //De forma a recolher quem verificou o pagamento diretamente
    let recetor_id = request.query.recetor_id;
    let recetor_nome = request.query.recetor_nome;
   
    let docRef = db.collection('quotas').doc(id);

    let transaction = db.runTransaction(t => {
        return t.get(docRef).then(doc => {
            let cota = doc.data();
            if (pago && !cota["Pago"]){
                cota["Recetor"] = {"Nome":recetor_nome,"Id":recetor_id, "deleted":false};
            }
            else if (!pago && !cota["Confirmado_Recetor"]){
                cota["Recetor"] = null;
            }
            if (!pago && cota["Confirmado_Recetor"] && cota["Confirmado_Pagante"]){
                return response.status(403).send("Não é possível colocar o valor de pago a falso se as confirmações do pagante e recetor foram ambas realizadas.");
            }
            else {
                cota["Pago"] = pago;
                response.send(cota);
                return (t.update(docRef,{"Pago":cota["Pago"],"Recetor":cota["Recetor"]}));   
            }
            
        });
    })
    .then(result => {
        console.log('Transaction success! -> ',result);
        return result;
    }).catch(err => {
        console.log('Transaction failure:', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Funcão utilizada para obter uma lista com todas as cotas.
 * Devolve uma lista com os atributos da entidade cota.
 */
exports.getCotas = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let cota_table = [];

    db.collection('quotas').where("deleted", "==", false).get().then((snapshot) => {
        snapshot.forEach((doc) => {
            let data = doc.data();
            data["id"] = doc.id; 
            cota_table.push(data);
        });
        if (cota_table.length === 0){
            return response.status(204).send('');
        }
        else {
            return response.send(cota_table);
        }   
    })
    .catch((err) => {
        console.log('Error getting documents', err);
        return response.status(405).send({"error" : err});
    });

});
/**
 * Funcão utilizada para obter uma lista de cotas de um dado ano (independentemente do utilizador).
 * Leva como argumento: o ano (letivo das cotas).
 * Devolve uma lista com os atributos da entidade cota.
 */
exports.getCotasByAno = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let ano_letivo = request.query.ano;
    let cota_table = [];

    db.collection('quotas').where('Ano_Letivo','==',ano_letivo).where('deleted', '==', false).get().then((snapshot) => {
        snapshot.forEach((doc) => {
            let data = doc.data();
            data["id"] = doc.id; 
            cota_table.push(data);
        });
        if (cota_table.length === 0){
            return response.status(204).send('');
        }
        else {
            return response.send(cota_table);
        }   
    })
    .catch((err) => {
        console.log('Error getting documents', err);
        return response.status(405).send({"error" : err});
    });

});
/**
 * Esta função adiciona para um ano uma cota para cada utilizador de esse ano com um determinado valor
 * Se um utilizador já possuir uma cota para esse ano não é adicionada nenhuma nova referente a ele nesse ano
 * Leva como argumentos : ano (letivo das cotas), valor (das cotas)
 * Retorna uma lista das cotas adicionadas
 * Nota: Não consegui realizar todas as adições com uma transação, pelo que operações que sejam realizadas
 * ao mesmo tempo podem constituir uma ameaça para a integridade dos dados (por exemplo cotas do mesmo ano para o mesmo utilizador)
 */
exports.addCotasAllUsers = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let ano_letivo = request.query.ano;
    let valor = parseFloat(request.query.valor);

    let docRefsParents = db.collection('parents').where('deleted', '==', false).get();
    let docRefsCotas = db.collection('quotas').where('Ano_Letivo','==',ano_letivo).where("deleted", "==", false).get();

    Promise.all([docRefsParents, docRefsCotas]).then((query_snapshots) => {
        let parent_ids = [];
        let cota_ids = [];
        let cotas_adicionadas = [];
        let cota_snapshot = query_snapshots[1].forEach((doc) => {
            let data = doc.data();
            cota_ids.push(data["Pagante"]["Id"]);
        });
        let parent_snapshot = query_snapshots[0].forEach((doc) => {
            let data = doc.data();
            let id = doc.id;
            let nome = data["Nome"];
            if (!cota_ids.includes(id)){
                cota = {"Pagante":{"Nome":nome, "Id":id, "deleted":false}, "Recetor":null, "Confirmado_Pagante":false, "Confirmado_Recetor":false,"Pago":false, "Valor":valor, "Ano_Letivo":ano_letivo, "deleted":false}
                cotas_adicionadas.push(cota);
                db.collection('quotas').add(cota)
                .catch(err => {
                    console.log("Error -> ,", err);
                    return response.status(405).send({"error" : err});
                });
            }
        });
        return response.send(cotas_adicionadas);
    })
    .catch(err => {
        console.log('Query error:', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Esta função serve apenas para devolver um atributo "Pago" de um caso de forma a confirmar se esta já foi pago ou não.
 * Leva como argumentos: o id (uuid/numero de membro do utilizador relacionado á cota), ano(letivo da cota)
 * Retorna um JSON com um atributo (Pago) com um valor true ou false
 */exports.checkPagamento = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let parent_id = request.query.id;
    let ano_letivo = request.query.ano;

    let docRefsCotas = db.collection('quotas').where('Ano_Letivo','==',ano_letivo).where('deleted', '==', false).get()
    .then(snapshot => {
        let c = null;
        snapshot.forEach((doc) => {
            if(doc.data()["Pagante"]["Id"] === parent_id){
                c = {"Pago":doc.data()["Pago"]};
            }
        });
        if (!c){
            return response.status(404).send("Cota de esse ano para esse utilizador não encontrada");
        }
        else {
            return response.send(c);
        }
    })
    .catch(err => {
        console.log('Error getting documents', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função envia um email enviado quando um utilizador se inscreve/candidata a membro da associação
 * Leva como argumentos email (do utilizador) e nome .
 * Devolve uma mensagem vazia sem conteúudo.
 * O email demora um pouco a chegar, mesmo a respoesta já tendo sido enviada (assíncrona)
 */
exports.sendRegisterEmail = functions.https.onRequest((request, response) => {
    let email = request.query.email;
    let nome = request.query.nome;

    var actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be whitelisted in the Firebase Console.
        url: auth_URL,
        // This must be true.
        handleCodeInApp: true,
    };
    admin.auth().generateSignInWithEmailLink(email, actionCodeSettings).then(link => {
        let message = "Olá, "+nome+"\n\nObrigado por se ter submetido o registo na plataforma. O seu formulário foi submetido com sucesso e está a aguardar aprovação dos órgãos sociais.\n\nInformamos que é necessário proceder ao pagamento da primeira cota para poder usar a plataforma.\nPara confirmar que já efetuou o pagamento desta, clique no link abaixo para entrar na sua conta e confirmar o pagamento. Após a confirmação, fique atento à sua caixa de entrada para obter o resultado da avaliação do seu registo.\n\nLink: "+link+"\n\nSe considera que este email se trata de um erro, por favor contacte os órgãos sociais da associação.\n\nAtenciosamente,\nA Equipa";

        let subject = `Registo para associação de pais - ${APP_NAME}!`;

        response.status(204).send();
        return sendEmail(email, subject, message)
    })
    .catch(err => {
        console.log('Error creating sign in link email', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função envia um email enviado quando um utilizador é rejeitado como membro da associação
 * Leva como argumentos email (do utilizador) e nome .
 * Devolve uma mensagem vazia sem conteúudo.
 * O email demora um pouco a chegar, mesmo a respoesta já tendo sido enviada (assíncrona)
 */
exports.sendRejectedEmail = functions.https.onRequest((request, response) => {
    let email = request.query.email;
    let nome = request.query.nome;

    let message = "Olá, "+nome+"\n\nObrigado por se ter submetido o registo na plataforma. Infelizmente, os órgãos sociais da associação não aprovaram o seu registo. Uma das razões pode incluir o facto de poder não pertencer a esta associação.\nSe considera que se trata de um erro, por favor contacte os órgãos sociais da associação.\n\nAtenciosamente,\nA Equipa";

    let subject = `Registo para associação de pais - ${APP_NAME}!`;

    response.status(204).send();
    return sendEmail(email, subject, message)
});
/**
 * Função envia um email enviado quando um utilizador é aprovado por um orgão social como a membro da associação
 * Este email tem um link que permite o utilizador se autenticar/inscrever e redireciona-o para a aplicação
 * Leva como argumentos email (do utilizador) e nome .
 * Devolve uma mensagem vazia sem conteúudo.
 * O email demora um pouco a chegar, mesmo a respoesta já tendo sido enviada (assíncrona)
 * Nota: É necessário mudar o url da variável actionCodeSettings. Esse url vai ser a página para o qual o utilizador
 * vai ser redirecionado quando clica no link de registo/autenticação
 */
exports.sendApprovedEmail = functions.https.onRequest((request, response) => {
    let email = request.query.email;
    let nome = request.query.nome;

    var actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be whitelisted in the Firebase Console.
    url: auth_URL, // https://www.google.com/
    // This must be true.
    handleCodeInApp: true,
    };
    //firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
    admin.auth().generateSignInWithEmailLink(email, actionCodeSettings).then(link => {
        let message = "Olá, "+nome+"\n\nObrigado por se ter submetido o registo na plataforma. O seu formulário foi verificado pelos órgãos sociais da associação e foi aprovado.\n\nPor favor, clique no link abaixo para entrar na sua conta e se juntar aos seus colegas na plataforma. Se considera que se trata de um erro, por favor contacte os órgãos sociais da associação.\n\nLink: "+link+"\n\nAtenciosamente,\nA Equipa";

        let subject = `Registo para associação de pais - ${APP_NAME}!`;

        response.status(204).send();
        return sendEmail(email, subject, message)
    })
    .catch(err => {
        console.log('Error creating sign in email', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função envia um email enviado quando um utilizador se autentica
 * Este email tem um link que permite o utilizador se autenticar e redireciona-o para a aplicação
 * Leva como argumentos email (do utilizador) e nome .
 * Devolve uma mensagem vazia sem conteúudo.
 * O email demora um pouco a chegar, mesmo a respoesta já tendo sido enviada (assíncrona)
 * Nota: É necessário mudar o url da variável actionCodeSettings. Esse url vai ser a página para o qual o utilizador
 * vai ser redirecionado quando clica no link de registo/autenticação
 */
exports.sendAuthenticationEmail = functions.https.onRequest((request, response) => {
    let email = request.query.email;
    let nome = request.query.nome;

    var actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be whitelisted in the Firebase Console.
    url: auth_URL,
    // This must be true.
    handleCodeInApp: true,
    };
    //firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
    admin.auth().generateSignInWithEmailLink(email, actionCodeSettings).then(link => {
        let message = "Olá, "+nome+"\n\nRecebemos um pedido de autenticação para a sua conta na plataforma da sua associação de pais. Para entrar, por favor clique no link abaixo.\n\nLink: "+link+"\n\nSe considera que se trata de um erro, por favor ignore este email ou contacte os órgãos sociais da associação.\n\nAtenciosamente,\nA Equipa";

        let subject = `Autenticação para associação de pais - ${APP_NAME}!`;

        response.status(204).send();
        return sendEmail(email, subject, message)
    })
    .catch(err => {
        console.log('Error creating sign in email', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função envia um email enviado quando um utilizador é importado
 * Este email tem um link que permite o utilizador se autenticar/registar e redireciona-o para a aplicação
 * Leva como argumentos email (do utilizador) e nome .
 * Devolve uma mensagem vazia sem conteúudo.
 * O email demora um pouco a chegar, mesmo a respoesta já tendo sido enviada (assíncrona)
 * Nota: É necessário mudar o url da variável actionCodeSettings. Esse url vai ser a página para o qual o utilizador
 * vai ser redirecionado quando clica no link de registo/autenticação
 */
exports.sendUserImportEmail = functions.https.onRequest((request, response) => {
    let email = request.query.email;
    let nome = request.query.nome;

    var actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be whitelisted in the Firebase Console.
    url: auth_URL,
    // This must be true.
    handleCodeInApp: true,
    };
    //firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
    admin.auth().generateSignInWithEmailLink(email, actionCodeSettings).then(link => {
        let message = "Olá, "+nome+"\n\nFoi adicionado(a) com sucesso à plataforma de associação de pais "+APP_NAME+". Por favor, clique no link abaixo para entrar e se juntar aos seus colegas na plataforma. Se considera que se trata de um erro, por favor contacte os órgãos sociais da associação.\n\nLink: "+ link +"\n\nAtenciosamente,\nA Equipa";

        let subject = `Autenticação para associação de pais - ${APP_NAME}!`;

        response.status(204).send();
        return sendEmail(email, subject, message)
    })
    .catch(err => {
        console.log('Error creating sign in link in email', err);
        return response.status(405).send({"error" : err});
    });
});




/**
 * Função genérica que envia um email com a mensagem recebida como argumento
 * Este email tem um link que permite o utilizador se autenticar/registar e redireciona-o para a aplicação
 * Leva como argumentos email (do utilizador), nome e mensagem .
 * Devolve uma mensagem vazia sem conteúudo.
 * O email demora um pouco a chegar, mesmo a respoesta já tendo sido enviada (assíncrona)
 * Nota: É necessário mudar o url da variável actionCodeSettings. Esse url vai ser a página para o qual o utilizador
 * vai ser redirecionado quando clica no link de registo/autenticação
 */

exports.sendNotificationEmail = functions.https.onRequest((request, response) => {
    let email = request.query.email;
    let nome = request.query.nome;
    let message = request.query.message;

    var actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be whitelisted in the Firebase Console.
    url: auth_URL,
    // This must be true.
    handleCodeInApp: true,
    };
    //firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
    admin.auth().generateSignInWithEmailLink(email, actionCodeSettings).then(link => {
        let subject = `Autenticação para associação de pais - ${APP_NAME}!`;

        response.status(204).send();
        return sendEmail(email, subject, message)
    })
    .catch(err => {
        console.log('Error creating sign in email', err);
        return response.status(405).send({"error" : err});
    });
});


/**
 * Função envia um email enviado quando um utilizador passa o cargo para outro
 * Este email tem um link que permite o utilizador se autenticar/registar e redireciona-o para a aplicação
 * Leva como argumentos email (do utilizador) e nome .
 * Devolve uma mensagem vazia sem conteúudo.
 * O email demora um pouco a chegar, mesmo a respoesta já tendo sido enviada (assíncrona)
 * Nota: É necessário mudar o url da variável actionCodeSettings. Esse url vai ser a página para o qual o utilizador
 * vai ser redirecionado quando clica no link de registo/autenticação
 */

exports.sendPositionEmail = functions.https.onRequest((request, response) => {
    let email = request.query.email;
    let nome = request.query.nome;
    let nome2 = request.query.nome2;
    let cargo = request.query.cargo;

    var actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be whitelisted in the Firebase Console.
    url: auth_URL,
    // This must be true.
    handleCodeInApp: true,
    };
    //firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
    admin.auth().generateSignInWithEmailLink(email, actionCodeSettings).then(link => {
        let message = "Olá, "+nome+"\n\nFoi feita um transição do cargo "+cargo+" do utilizador "+nome2+" para si. Para entrar, por favor clique no link abaixo.\n\nLink: "+link+"\n\nSe considera que se trata de um erro, por favor ignore este email ou contacte os órgãos sociais da associação.\n\nAtenciosamente,\nA Equipa";

        let subject = `Autenticação para associação de pais - ${APP_NAME}!`;

        response.status(204).send();
        return sendEmail(email, subject, message)
    })
    .catch(err => {
        console.log('Error creating sign in email', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função envia um email de autenticação quando um utilizador muda de email
 * Este email tem um link que permite o utilizador se autenticar/registar e redireciona-o para a aplicação
 * Leva como argumentos email (do utilizador) e nome .
 * Devolve uma mensagem vazia sem conteúdo.
 * O email demora um pouco a chegar, mesmo a respoesta já tendo sido enviada (assíncrona)
 * Nota: É necessário mudar o url da variável actionCodeSettings. Esse url vai ser a página para o qual o utilizador
 * vai ser redirecionado quando clica no link de registo/autenticação
 */
exports.sendAuthenticationEmailAfterEmailChange = functions.https.onRequest((request, response) => {
    let email = request.query.email;
    let nome = request.query.nome;

    var actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be whitelisted in the Firebase Console.
        url: auth_URL,
        // This must be true.
        handleCodeInApp: true,
    };
    
    admin.auth().generateSignInWithEmailLink(email, actionCodeSettings).then(link => {
        let message = "Olá, "+ nome +"\n\nRecebemos um pedido de mudança de email da sua conta da plataforma da sua associação de pais para este endereço. Por favor, clique no link abaixo para se autenticar com este novo email.\n\nLink: "+ link +"\n\nSe considera que se trata de um erro, por favor ignore este email ou contacte os órgãos sociais da associação.\n\nAtenciosamente,\nA Equipa";

        let subject = `Mudança de email - Autenticação para associação de pais - ${APP_NAME}!`;

        response.status(204).send();
        return sendEmail(email, subject, message)
    })
    .catch(err => {
        console.log('Error creating sign in email', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função envia um email enviado quando um utilizador não paga a primeira cota a tempo e não entra na associação
 * Este email tem um link que permite o utilizador se autenticar/registar e redireciona-o para a aplicação
 * Leva como argumentos email (do utilizador) e nome.
 * Devolve uma mensagem vazia sem conteúdo.
 * O email demora um pouco a chegar, mesmo a respoesta já tendo sido enviada (assíncrona)
 * Nota: É necessário mudar o url da variável actionCodeSettings. Esse url vai ser a página para o qual o utilizador
 * vai ser redirecionado quando clica no link de registo/autenticação
 */
exports.sendRegisterEliminationEmail = functions.https.onRequest((request, response) => {
    let email = request.query.email;
    let nome = request.query.nome;

    let message = "Olá, "+nome+"\n\nApós ter efetuado o pedido de registo na associação, passou o limite de tempo para efetuar o pagamento da 1ª quota e o seu registo foi automaticamente eliminado. Se efetuou o pagamento da quota, por favor, contacte os órgãos sociais da associação para proceder à reinserção do registo e validação.\n\nSe considera que se trata de um erro, por favor ignore este email ou contacte os órgãos sociais da associação.\n\nAtenciosamente,\nA Equipa";    
    
    let subject = `Registo para associação de pais - ${APP_NAME}!`;
    
    response.status(204).send();
    return sendEmail(email, subject, message)
});
/**
 * Função envia um email enviado quando um utilizador elimina a sua conta 
 * Leva como argumentos email (do utilizador) e nome .
 * Devolve uma mensagem vazia sem conteúdo.
 * O email demora um pouco a chegar, mesmo a respoesta já tendo sido enviada (assíncrona)
 */
exports.sendAccountEliminationEmail = functions.https.onRequest((request, response) => {
    let email = request.query.email;
    let nome = request.query.nome;

    let message = "Olá, "+ nome +"\n\nA sua conta na plataforma da sua associação de pais foi eliminada com sucesso, bem como todos os seus dados. Obrigado por ser nosso utilizador.\n\nSe considera que este email não é dirigido a si, por favor ignore este email. Se acha que foi um erro, por favor, volte a registar-se ou contacte os órgãos sociais da associação.\n\nAtenciosamente,\nA Equipa\n";    
    
    let subject = `Eliminação de conta - Associação de pais - ${APP_NAME}!`;
    
    response.status(204).send();
    return sendEmail(email, subject, message)
});
/**
 * Função que manda email a vários utilizadores relativamente a uma transferência de cargo para os mesmos.
 * Formato do argumento membros : [{"id":"email@gmail.com", "nome":"Edgar", "cargo":"Vogal", "data":"10-10-2020"}]
 */
exports.sendCargoChangeEmail = functions.https.onRequest((request, response) => {
    let members = JSON.parse(request.query.membros);

    for (i=0 ; i<members.length ; i++) {
        let nome = members[i]["nome"];
        let email = members[i]["id"];
        let cargo = members[i]["cargo"];
        let data = members[i]["data"];
        let message = "Olá, "+nome+"\n\nFoi feita um transição do cargo "+cargo+" para si. Para aceitar esse cargo terá de realizar a confirmação na plataforma.\n\nSe considera que se trata de um erro, por favor ignore este email ou contacte os órgãos sociais da associação.\n\nAtenciosamente,\nA Equipa";
        let subject = `Transferência de cargo - Autenticação para associação de pais - ${APP_NAME}!`;
        createCargoTransition(nome, email, data, cargo);
        sendEmail(email, subject, message);
    }
    return response.status(204).send();
});
/**
 * Função auxiliar utilizada para enviar emails
 */
async function sendEmail(email, subject, message) {
    const mailOptions = {
      from: `${APP_NAME} <noreply@firebase.com>`,
      to: email,
    };

    // The user subscribed to the newsletter.
    mailOptions.subject = subject;
    mailOptions.text = message;
    await mailTransport.sendMail(mailOptions);
    //console.log('New welcome email sent to:', email);
    return null;
}
/**
 * Função auxiliar que cria os documentos de CargoTransition
 */
async function createCargoTransition(nome, email, data, cargo) {
    let db = admin.firestore();

    let document = {'nome':nome, 'email':email, 'data':data, 'cargo':cargo, 'aceite':false, 'deleted':false}
    db.collection('cargoTransition').add(document).then(ref => {
        console.log("Added document");
        return document
    })
    .catch(err => {
        console.log("Error creating cargoTransition Document-> ,", err);
        return response.status(405).send({"error" : err});
    });
}
/**
 * Funções relacionadas com a exportação de dados
 */
/**
 * Função devolve/inicia o download de um ficheiro de extensão CSV com todos os parents presentes na base de dados.
 * Devolve os dados dos utilizadores não incluindo os seus educandos nem as suas cotas.
 */
exports.exportParentCSV = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let a = [];
    db.collection('parents').get().then((snapshot) => {
        snapshot.forEach((doc) => {
            let data = doc.data();
            delete data["Educandos"]
            delete data["Cotas"]
            delete data["Data inscrição"]
            delete data["photo"]
            a.push(data);
        });
        const csv = json2csv(a);
        response.setHeader(
            "Content-disposition",
            "attachment; filename=parents.csv"
        );
        response.set("Content-Type", "text/csv");
        
        return response.status(200).send(csv);
    })
    .catch((err) => {
        console.log('Error exporting data', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função devolve/inicia o download de um ficheiro de extensão CSV com todos os educandos de todos os parents presentes na base de dados.
 * Devolve os dados dos educandos com o email, nome e número de sócio do seu encarregado de educação.
 */
exports.exportEducandosCSV = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let a = [];
    db.collection('parents').get().then((snapshot) => {
        snapshot.forEach((doc) => {
            if (doc.get("Educandos")){
                doc.get("Educandos").forEach((value, index) => {
                    value["Encarregado de Educação"] = doc.get("Nome");
                    value["Número Sócio Enc de Educação"] = doc.get("Número de Sócio");
                    value["Email de Encarregado de Educação"] = doc.get("Email");
                    a.push(value)
                });
            }
        });
        const csv = json2csv(a);
        response.setHeader(
            "Content-disposition",
            "attachment; filename=educandos.csv"
        );
        response.set("Content-Type", "text/csv");
        return response.status(200).send(csv);
    })
    .catch((err) => {
        console.log('Error exporting data', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função devolve/inicia o download de um ficheiro de extensão CSV com um parent.
 * Devolve as informações de um utilizador não incluindo os seus educandos nem as suas cotas.
 * Leva como argumento o id do documento do utilizador.
 */
exports.exportSingleParentCSV = functions.https.onRequest((request, response) => {
    let db = admin.firestore();

    let id = request.query.id;

    db.collection('parents').doc(id).get().then(doc => {
        if (!doc.exists) {
            console.log('No such document!');
            return response.status(404).send({"error":"No such document"});
        }
        else {
            //console.log('Document data:', doc.data());
            let data = doc.data();
            console.log("data -> ",data);
            const csv = json2csv(data);
            response.setHeader(
                "Content-disposition",
                "attachment; filename=parent"+id+".csv"
            );
            response.set("Content-Type", "text/csv");
            return response.status(200).send(csv);
        }
    })
    .catch((err) => {
        console.log('Error exporting data', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função devolve/inicia o download de um ficheiro PDF com as informações do utilizador presentes na base de dados.
 * Estas informações não incluem as suas cotas.
 * Leva como argumento o id do documento do parent a ser exportado.
 */
exports.exportSingleParentPDF = functions.https.onRequest((request, response) => {
    let db = admin.firestore();

    let id = request.query.id;
    
    db.collection('parents').doc(id).get().then(doc => {
        if (!doc.exists) {
            console.log('No such document!');
            return response.status(404).send({"error":"No such document"});
        }
        else {
            //console.log('Document data:', doc.data());
            let data = doc.data();
            const pdf = new pdfkit();
            response.setHeader(
                "Content-disposition",
                "attachment; filename=User"+doc.get("Nome")+".pdf"
            );
            response.set("Content-Type", "application/pdf");
            pdf.pipe(response);
            pdf.fontSize(25).text('Parent info\n\n');
            pdf.fontSize(14).text('Nome: '+doc.get("Nome")+'\nEmail: '+doc.get("Email")+'\n');
            delete data['Nome']
            delete data['Email']
            let educandos = data["Educandos"]
            delete data['Educandos']
            for (var k in data) {
                pdf.fontSize(14).text(k+': '+data[k]+'\n');
            }
            pdf.fontSize(14).text('Educandos:\n');
            for(i = 0;i<educandos.length;i++) {
                pdf.fontSize(14).text('-> Educando '+i+': \n');
                for (var nk in educandos[i]){
                    pdf.fontSize(14).text('     '+nk+' : '+educandos[i][nk]+'\n');
                }
            }
            return pdf.end();
        }
    })
    .catch((err) => {
        console.log('Error exporting data', err);
        return response.status(405).send({"error" : err});
    });
});

/**
 * Retorna os parametros adicionados pelo administrador do sistema á entidade "parents"/encarregados de educação
 */
exports.getParentsNewParams = functions.https.onRequest((request, response) => {
    let db = admin.firestore();

    db.collection("initialConfigs").doc("newParameters").get().then(doc => {
        if (!doc.exists) {
            console.log('New parameters not defined on the database.');
            return response.status(404).send({"error":"No such document"});
        }
        else {
            let data = doc.get("EE");
            return response.send(data);
        }
    })
    .catch(err => {
        console.log('Query error:', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Retorna os parametros adicionados pelo administrador do sistema á entidade educandos/alunos
 */
exports.getEducandosNewParams = functions.https.onRequest((request, response) => {
    let db = admin.firestore();

    db.collection("initialConfigs").doc("newParameters").get().then(doc => {
        if (!doc.exists) {
            console.log('New parameters not defined on the database.');
            return response.status(404).send({"error":"No such document"});
        }
        else {
            let data = doc.get("aluno");
            return response.send(data);
        }
    })
    .catch(err => {
        console.log('Query error:', err);
        return response.status(405).send({"error" : err});
    });
});

/**
 * Retorna todos os parametros adicionados pelo administrador do sistema
 */
exports.getAllNewParams = functions.https.onRequest((request, response) => {
    let db = admin.firestore();

    db.collection("initialConfigs").doc("newParameters").get().then(doc => {
        if (!doc.exists) {
            console.log('New parameters not defined on the database.');
            return response.status(404).send({"error":"No such document"});
        }
        else {
        	let data = doc.data();
            return response.send(data);
        }
    })
    .catch(err => {
        console.log('Query error:', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Retorna todos os documentos da coleção dos cargos.
 */
exports.getCargos = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let a = [];
    db.collection('cargos').get().then((snapshot) => {
        snapshot.forEach((doc) => {
            let data = doc.data();
            data["id"] = doc.id; 
            a.push(data);
        });
        return response.send(a);
    })
    .catch((err) => {
        console.log('Error getting documents', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função que exporta um documento de um caso presente na base de dados no formato de um pdf.
 * Leva como argumento o id do docuemnto do caso a exportar.
 */
exports.exportCasoPdf = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;

    db.collection('casos').doc(id).get().then(doc => {
        if (!doc.exists) {
            console.log('No such document!');
            return response.status(404).send({"error":"No such document"});
        }
        else {
            const pdf = new pdfkit();
            response.setHeader(
                "Content-disposition",
                "attachment; filename=Caso"+doc.get("titulo")+".pdf"
            );
            response.set("Content-Type", "application/pdf");
            pdf.pipe(response);
            convertCasoToPDF(pdf, doc);
            return pdf.end();
        }
    })
    .catch((err) => {
        console.log('Error exporting data', err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Função que exporta um PDF com todos os casos da base de dados.
 */
exports.exportCasosPDF = functions.https.onRequest((request, response) => {
    let db = admin.firestore();

    db.collection('casos').get().then((snapshot) => {
        const pdf = new pdfkit();
        response.setHeader(
            "Content-disposition",
            "attachment; filename=Casos.pdf"
        );
        response.set("Content-Type", "application/pdf");
        pdf.pipe(response);
        snapshot.forEach((doc) => {
            convertCasoToPDF(pdf, doc);
        });
        return pdf.end();
    })
    .catch((err) => {
        console.log('Error exporting caso documents', err);
        return response.status(405).send({"error" : err});
    });
});

async function convertCasoToPDF(pdf, doc){
    pdf.fontSize(25).text('Caso: '+doc.get("titulo")+'\n\n');
    pdf.fontSize(14).text('Autor: '+doc.get("autor")["nome"]+'\n\nEmail: '+doc.get("autor")["id"]+'\n\n');
    let tc =  doc.get("data_criacao").toDate();
    //let tc = new Date();
    pdf.fontSize(14).text('Data criação (UTC): '+tc.getUTCDate()+'/'+(tc.getUTCMonth()+1)+'/'+tc.getUTCFullYear()+' '+tc.getUTCHours()+':'+tc.getUTCMinutes()+':'+tc.getUTCSeconds()+'\n\n');
    pdf.fontSize(14).text('Descrição:\n'+doc.get("descricao")+'\n\n');
    pdf.fontSize(14).text('Arquivado: '+(doc.get("arquivado") ? 'Sim' : 'Não')+'\n\n');
    pdf.fontSize(14).text('Privado: '+(doc.get("privado") ? 'Sim' : 'Não')+'\n\n');
    pdf.fontSize(14).text('Membros: \n');
    for(i = 0;i<doc.get("membros").length;i++) {
        pdf.fontSize(14).text('-> Nome: '+doc.get("membros")[i]["nome"]+' ; Email: '+doc.get("membros")[i]["id"]+'\n');
    }
    pdf.fontSize(14).text('\nObservações: \n');
    for(i = 0;i<doc.get("observacoes").length;i++) {
        let to = doc.get("observacoes")[i]["tempo"].toDate();
        pdf.fontSize(14).text('-> Obs. '+i+': \n');
        pdf.fontSize(14).text('     Nome: '+doc.get("observacoes")[i]["user"]["nome"]+' ; Email: '+doc.get("observacoes")[i]["user"]["id"]+' \n');
        pdf.fontSize(14).text('     Editado: '+(doc.get("observacoes")[i]["editado"] ? 'Sim' : 'Não')+'\n');
        pdf.fontSize(14).text('     Data (UTC): '+to.getUTCDate()+'/'+(to.getUTCMonth()+1)+'/'+to.getUTCFullYear()+' '+to.getUTCHours()+':'+to.getUTCMinutes()+':'+to.getUTCSeconds()+'\n');
        pdf.fontSize(14).text('     Conteúdo: '+doc.get("observacoes")[i]["conteudo"]+'\n');
    }
    pdf.fontSize(14).text('\nFicheiros: \n');
    for(i = 0;i<doc.get("ficheiros").length;i++) {
        pdf.fontSize(14).text('-> Ficheiro '+i+': \n');
        pdf.fontSize(14).text('     Nome: '+doc.get("ficheiros")[i]["nome"]+' \n');
        pdf.fontSize(14).text('     Referência: '+doc.get("ficheiros")[i]["referencia"]+'\n');
    }
    pdf.fontSize(14).text('\n\n');
}

/**
 * Função serve para alterar um número arbitrário de atributos do documento de parameters da coleção initialConfigs
 * Isto significa que permite um Overwrite completo do documento
 * Leva como argumento um doc que corresponde a um ficheiro na forma JSON.
 * Esse doc vai ser utilizado para fazer update aos atributos do documento.
 * Todos os atributos presentes nesse doc vão ser atualizados para o valor lá presente. No caso de existirem
 * atributos do documento parent da base de dados que não estão no doc, eles vão se manter inalterados.
 * Ou seja, os atributos que vão ser atualizados são os do doc enviado como argumento.
 * Warning : Os nomes dos atributos enviados no doc têm de ser os mesmos que têm na base de dados, se não vão ser criados atributos
 * novos com esses nomes no documento do parent.
 * Devolve o documento inteiro de parameters depois do update
 */
exports.updateDadosAssociacao = functions.https.onRequest((request, response) => {
    let db = admin.firestore();

    let doc = JSON.parse(request.query.doc);

    let docRef = db.collection('initialConfigs').doc("parameters");

    docRef.update(doc).then((parent)=>{
        docRef.get().then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
                return response.status(404).send({"error":"No such document"});
            }
            else {
                //console.log('Document data:', doc.data());
                let data = doc.data();
                data["id"] = doc.id;
                return response.send(data);
            }
        })
        .catch(err => {
            console.log("Failed to get doc -> ", err);
            return response.status(405).send({"error" : err});
        });
        return parent;
    }).catch(err => {
        console.log("Failed to update -> ", err);
        return response.status(405).send({"error" : err});
    });
});

