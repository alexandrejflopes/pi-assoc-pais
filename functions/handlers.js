const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();


const auth_URL = "http://localhost:3000/login"; // https://www.google.com/


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

// Nome da aplicação
const APP_NAME = 'associacao-pais';

/**
 * Funções relacionadas com os casos.
 */

/**
 * Função que quando chamada sem argumentos retorna todos os casos presentes na base de dados (na coleção casos)
 */
exports.getCasos = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let a = [];
    db.collection('casos').get().then((snapshot) => {
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
 * Leva os seguintes argumentos: titulo , descricao , privado(true/false) , membros (array de ficheiros json em string no caso de ser privado)
 * Ex de membros: [ {'nome':'maria','id':'pljouHGIHpo'},{'nome':'jose','id':'SIdjisdnDI'} ]
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
    caso["autor"] = {"nome":request.query.nome_autor, "id":request.query.id_autor};

    if (request.query.privado === "true"){
        caso["membros"] = JSON.parse(request.query.membros);
        caso["membros"].push(caso["autor"]);
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

    db.collection('casos').doc(id).delete().then((caso)=>{
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

    db.collection('casos').doc(id).update({"membros":members}).then((caso)=>{
        return response.send(caso);
    }).catch(err => {
        console.log("Failed to archive -> ", err);
        return response.status(405).send({"error" : err});
    });
});
/**
 * Esta função adiciona um membro a um caso
 * Leva como argumentos: id , membro_nome , membro_id
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
    let docRef = db.collection('casos').doc(id);

    let transaction = db.runTransaction(t => {
        let members = [];
        return t.get(docRef).then(doc => {
            let data = doc.data();
            members = data["membros"];
            members.push({"nome":member_name,"id":member_id});
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
            for (i = 0; i < members.length; i++){
                //console.log(typeof members[i]["id"]);
                //console.log(typeof member_id);
                if(members[i]["id"] === member_id){
                    members.splice(i,1);
                    //console.log("CANCELED");
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
 * Leva como argumento: id , user_id , user_name , observacao
 * Sendo id o id do caso a adicionar o comentário , user_id o id do utilizador que realizou o comentário, user_name o seu nome,
 * e a observacao o conteúdo do comentário
 * Devolve a lista de observações após este ter sido adicionado
 */
exports.addCommentCaso = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let id = request.query.id;
    let user_id = request.query.user_id;
    let user_name = request.query.user_name;
    let observacao = request.query.observacao;
    let docRef = db.collection('casos').doc(id);

    let transaction = db.runTransaction(t => {
        let observacoes = []
        return t.get(docRef).then(doc => {
            let data = doc.data();
            observacoes = data["observacoes"];
            observacoes.push({"user":{"nome":user_name,"id":user_id}, "conteudo":observacao, "tempo":new Date(), "editado":false});
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
                //console.log("database user id ->",observacoes[i]["user"]["id"]," | type:",typeof observacoes[i]["user"]["id"]);
                //console.log("input user id ->",user_id," | type:",typeof user_id);
                //console.log("database seconds ->",observacoes[i]["tempo"]["_seconds"]," | type:",typeof observacoes[i]["tempo"]["_seconds"]);
                //console.log("input seconds ->",timestamp_sec," | type:",typeof timestamp_sec);
                //console.log("database nanoseconds ->",observacoes[i]["tempo"]["_nanoseconds"]," | type:",typeof observacoes[i]["tempo"]["_nanoseconds"]);
                //console.log("input nanoseconds ->",timestamp_nanosecs," | type:",typeof timestamp_nanosecs);
                if(observacoes[i]["user"]["id"] === user_id && observacoes[i]["tempo"]["_seconds"]===timestamp_sec && observacoes[i]["tempo"]["_nanoseconds"]===timestamp_nanosecs ){
                    observacoes.splice(i,1);
                    //console.log("CANCELED");
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
            for (i = 0; i < anexos.length; i++){
                if(anexos[i]["nome"] === file_name && anexos[i]["referencia"] === file_ref){
                    anexos.splice(i,1);
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
 * Leva como argumentos: id (id do utilizador), nome (nome do utilizador)
 * Devolve uma lista de casos que um utilizador tem acesso
 * No entanto a lista de casos têm apenas alguns atributos, não tem todos
 * Tem apenas os atributos titulo, descricao, privado, arquivado e o id do caso
 */
exports.getUserAvailableCasos = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let user_id = request.query.id;
    let user_name = request.query.nome;
    let casosRef = db.collection('casos');
    let availableCases = [];

    let public_cases = casosRef.where('privado','==',false).get();
    let private_cases = casosRef.where('privado','==',true).where('membros','array-contains',{'id':user_id,'nome':user_name}).get();

    Promise.all([public_cases, private_cases]).then((query_snapshots) => {
        let public_cases_array = query_snapshots[0].forEach((doc) => {
            let data = doc.data();
            data["id"] = doc.id;
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
            availableCases.push(caso);
        });
        let private_cases_array = query_snapshots[1].forEach((doc) => {
            let data = doc.data();
            data["id"] = doc.id;
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
            availableCases.push(caso);
        });

        return response.send(availableCases);
    })
    .catch(err => {
        console.log('Query error:', err);
        return response.status(405).send({"error" : err});
    });
});
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
 * Funções relacionadas com os pais/encarregados de educação
 */


/**
 * Função devolve todos os documentos completos de pais/enc de educação.
 */
exports.getParents = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let a = [];
    db.collection('parents').get().then((snapshot) => {
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
    let a = [];
    db.collection('parents').get().then((snapshot) => {
        snapshot.forEach((doc) => {
            let encarregado = {};
            encarregado[doc.id] = doc.get("Educandos")
            a.push(encarregado);
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
    db.collection('parents').get().then((snapshot) => {
        snapshot.forEach((doc) => {
            a.push(doc.get("Número de Sócio"));
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
 * ano (letivo da cota), valor (a pagar pela cota), nome (do pagante)
 * A cota criada vai ter os atributos de confirmação e pagamento negativos e o recetor também vai ser um campo vazio
 */
exports.addCota = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let user_id = request.query.id;
    let ano_letivo = request.query.ano;
    let valor = parseFloat(request.query.valor);
    let user_nome = request.query.nome;

    let cota = {"Pagante":{"Nome":user_nome,"Id":user_id}, "Recetor":null, "Confirmado_Pagante":false, "Confirmado_Recetor":false,"Pago":false, "Valor":valor, "Ano_Letivo":ano_letivo}

    db.collection('cotas').add(cota).then(ref => {
        console.log("Added cota");
        return response.send(cota);
    })
    .catch(err => {
        console.log("Error -> ,", err);
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

    let docRef = db.collection('cotas').doc(id);

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

    let docRef = db.collection('cotas').doc(id);

    let transaction = db.runTransaction(t => {
        return t.get(docRef).then(doc => {
            let cota = doc.data();
            if (!confirmar && !cota["Pago"]){
                cota["Recetor"] = null;
            }
            else if (confirmar && !cota["Pago"]){
                cota["Recetor"] = {"Nome":recetor_nome,"Id":recetor_id};
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

    let docRef = db.collection('cotas').doc(id);

    let transaction = db.runTransaction(t => {
        return t.get(docRef).then(doc => {
            let cota = doc.data();
            if (pago && !cota["Pago"]){
                cota["Recetor"] = {"Nome":recetor_nome,"Id":recetor_id};
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
 * Funcão utilizada para obter uma lista de cotas de um dado ano (independentemente do utilizador).
 * Leva como argumento: o ano (letivo das cotas).
 * Devolve uma lista com os atributos da entidade cota.
 */
exports.getCotas = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let ano_letivo = request.query.ano;
    let cota_table = [];

    db.collection('cotas').where('Ano_Letivo','==',ano_letivo).get().then((snapshot) => {
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

    let docRefsParents = db.collection('parents').get();
    let docRefsCotas = db.collection('cotas').where('Ano_Letivo','==',ano_letivo).get();

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
                cota = {"Pagante":{"Nome":nome, "Id":id}, "Recetor":null, "Confirmado_Pagante":false, "Confirmado_Recetor":false,"Pago":false, "Valor":valor, "Ano_Letivo":ano_letivo}
                cotas_adicionadas.push(cota);
                db.collection('cotas').add(cota)
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
 */
exports.checkPagamento = functions.https.onRequest((request, response) => {
    let db = admin.firestore();
    let parent_id = request.query.id;
    let ano_letivo = request.query.ano;

    let docRefsCotas = db.collection('cotas').where('Ano_Letivo','==',ano_letivo).get()
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

    let message = "Olá, "+nome+"\nObrigado por se ter submetido o registo na plataforma. O seu formulário foi submetido com sucesso e está a aguardar aprovação dos órgãos sociais.\nPor favor, fique atento à sua caixa de entrada para o resultado da avaliação.\n\nAtenciosamente,\nA Equipa\n";

    let subject = `Registo para associação de pais - ${APP_NAME}!`;

    response.status(204).send();
    return sendEmail(email, subject, message)
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
