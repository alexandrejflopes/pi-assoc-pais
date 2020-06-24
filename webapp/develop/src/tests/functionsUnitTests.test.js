import {
  languageCode,
  parentsParameters,
  studentsParameters
} from "../utils/general_utils";


const parent = {"photo":"https://firebasestorage.googleapis.com/v0/b/associacao-pais.appspot.com/o/profilePhotos%2F9e9147ec-d202-4c98-82b6-0ce6e240a51e-hor%C3%A1rio%20EI%203_2.png?alt=media&token=f25d8474-199f-4bdf-8bef-623dc3a6837a","Cargo":"Associado(a)","Quotas pagas":true,"Cartão Cidadão":"57843920","Cotas":[],"Admin":false,"Código Postal":"3810-001","Validated":true,"Telemóvel":null,"Email":"ajflopesvideos@gmail.com","Profissão":"Estudante","Morada":"Rua Direita, Aradas","Nome":"Alex","blocked":false,"NIF":"3423423432","Data inscricao":"2020-05-22","Educandos":[{"Nome":"Sandra","Regime":"2w","Pólo":"4","Ano":"3","Foto":"https://firebasestorage.googleapis.com/v0/b/associacao-pais.appspot.com/o/childPhotos%2F303b3d19-810b-45d0-9be2-100c2836705c-child1.jpg?alt=media&token=9154aa30-e3e0-4f09-b5f4-765843334a96","Modalidade":"2","Grau":"2"},{"Ano":"2","Foto":"https://firebasestorage.googleapis.com/v0/b/associacao-pais.appspot.com/o/childPhotos%2Ff28abc07-b0cc-4435-9616-3b259938b120-child1.jpg?alt=media&token=6508a0f6-7b79-497d-a1fe-1ddf2c319ac6","Modalidade":"2","Grau":"3","Nome":"Laura","Regime":"e","Pólo":"4"}],"Número de Sócio":"98982","Localidade":"Aveiro","um parametro":"qq","id":"ajflopesvideos@gmail.com"};

const childrenPhotos = [
  "https://firebasestorage.googleapis.com/v0/b/associacao-pais.appspot.com/o/childPhotos%2F303b3d19-810b-45d0-9be2-100c2836705c-child1.jpg?alt=media&token=9154aa30-e3e0-4f09-b5f4-765843334a96",
  "https://firebasestorage.googleapis.com/v0/b/associacao-pais.appspot.com/o/childPhotos%2Ff28abc07-b0cc-4435-9616-3b259938b120-child1.jpg?alt=media&token=6508a0f6-7b79-497d-a1fe-1ddf2c319ac6"
];


test("Given a parent returns its children photos", () => {

  const children = parent[parentsParameters.CHILDREN[languageCode]];

  const photos = children.map((child) => {
    const final = [];
    final.push(child[studentsParameters.PHOTO[languageCode]]);
    return final;
  });


  expect(photos.sort()).toEqual(childrenPhotos.sort());


});
