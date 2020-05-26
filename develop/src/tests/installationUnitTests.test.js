import "firebase/storage"
import {
  checkJSONparamsEntitiesAndTypes,
  compareCSVandJsonParameters,
  getandSaveCSVdata,
  setupTXTRoles,
  validZip
} from "../firebase_scripts/installation";
import valid1 from "./json-params-test-files/valid-jsons/v1";
import valid2 from "./json-params-test-files/valid-jsons/v2";
import valid3 from "./json-params-test-files/valid-jsons/v3";
import valid4 from "./json-params-test-files/valid-jsons/v4";

import invalid1 from "./json-params-test-files/invalid-jsons/1";
import invalid2 from "./json-params-test-files/invalid-jsons/2";
import invalid3 from "./json-params-test-files/invalid-jsons/3";
import invalid4 from "./json-params-test-files/invalid-jsons/4";
import invalid5 from "./json-params-test-files/invalid-jsons/5";
import invalid6 from "./json-params-test-files/invalid-jsons/6";
import invalid7 from "./json-params-test-files/invalid-jsons/7";
// invalid JSON number 8 has incorrect syntax on purpose, but cannot be imported with bad syntax
import invalid9 from "./json-params-test-files/invalid-jsons/9";

import cargosValid1 from "./cargos-test-files/cargosDoCSV.txt";

const fs = require('fs');


test("Returns true when valid parameters JSON file is provided", () => {
  expect(checkJSONparamsEntitiesAndTypes(valid1)).toBe(true);
  expect(checkJSONparamsEntitiesAndTypes(valid2)).toBe(true);
  expect(checkJSONparamsEntitiesAndTypes(valid3)).toBe(true);
  expect(checkJSONparamsEntitiesAndTypes(valid4)).toBe(true);
});

test("Returns false when invalid parameters JSON file is provided", () => {
  expect(checkJSONparamsEntitiesAndTypes(invalid1)).toBe(false);
  expect(checkJSONparamsEntitiesAndTypes(invalid2)).toBe(false);
  expect(checkJSONparamsEntitiesAndTypes(invalid3)).toBe(false);
  expect(checkJSONparamsEntitiesAndTypes(invalid4)).toBe(false);
  expect(checkJSONparamsEntitiesAndTypes(invalid5)).toBe(false);
  expect(checkJSONparamsEntitiesAndTypes(invalid6)).toBe(false);
  expect(checkJSONparamsEntitiesAndTypes(invalid7)).toBe(false);
  expect(checkJSONparamsEntitiesAndTypes(invalid9)).toBe(false);
});



test("Returns true when parameters from JSON and CSVs match", () => {
  expect(compareCSVandJsonParameters([], [])).toBe(true);
  expect(compareCSVandJsonParameters(["param1", "param2"], ["param1", "param2"])).toBe(true);
  expect(compareCSVandJsonParameters(["param2", "param1"], ["param1", "param2"])).toBe(true);
  expect(compareCSVandJsonParameters(["param1", "param2"], ["param2", "param1"])).toBe(true);
});


test("Returns false when parameters from JSON and CSVs do not match", () => {
  expect(compareCSVandJsonParameters([], ["param1", "param2"])).toBe(false);
  expect(compareCSVandJsonParameters(["param1", "param2"], [])).toBe(false);
  expect(compareCSVandJsonParameters(["param1", "param2"], ["param1", "param2", "param3"])).toBe(false);
  expect(compareCSVandJsonParameters(["param1", "param2", "param3"], ["param1", "param2"])).toBe(false);
});



test('Received false when there are problems with csv and json parameters files', done => {
  function callback(data) {
    try {
      expect(data).toBe(false);
      done();
    } catch (error) {
      done(error);
    }
  }

  let f1 = new File(["Número de Sócio EE;Encarregado de Educação;Nome;Ano (ensino regular);Modalidade;Grau ;Regime\n" +
    "54353;Diogo Gomes;João;4;Instrumento;1;Normal\n" +
    "98978;Vera Teixeira;Laura;6;Artes Visuais;2;Normal\n" +
    "33244;Luísa Santos;Maria;6;Artes Visuais;2;Extraordinário\n" +
    "65362;Olivério Baptista;Santiago;5;Dança;2;Normal\n" +
    "12764;Joana Marçal;Bernardo;3;Instrumento;1;Normal\n" +
    "12764;Joana Marçal;Rita;8;Dança;3;Extraordinário\n"], "f1.csv");
  let f2 = new File(["Número de Sócio;Cargo;Quotas pagas;Nome;NIF;Cartão Cidadão;Email;Telemóvel;Profissão;Morada;Código Postal;Localidade;Admin\n" +
    "54353;Presidente do Conselho Executivo;true;Diogo Gomes;894274893;CC1;dgomes@pi-assoc-pais.com;6895655;Professor;Rua do Colegio;0000-000;Aveiro;true\n" +
    "98978;Vice-Presidente;false;Vera Teixeira;895758866;CC2;vera@pi-assoc-pais.com;6895655;Investigadora;Avenida do Sol;5555-555;Espinho;true\n" +
    "33244;Tesoureira;true;Luísa Santos;937498483;CC3;luisa.santos@pi-assoc-pais.com;3975489;Professor;Rua do Colegio;4444-444;Estarreja;true\n" +
    "65362;Vogal;true;Olivério Baptista;894274893;CC4;oliverio@pi-assoc-pais.com;97545409;GNR;Avenida do Sol;1234-321;Estarreja;true\n" +
    "92839;Associado;false;Mário Silva;937498483;CC5;mario.silva@pi-assoc-pais.com;765243;Professor;Avenida do Sol;7777-888;Espinho;false\n" +
    "12764;Associada;true;Joana Marçal;895758866;CC6;joana_marcal@pi-assoc-pais.com;6895655;Gestora;Rua do Colegio;4555-535;Aveiro;false\n"], "f2.csv");

  getandSaveCSVdata(f1, f2, callback);
});


test('Returns false when invalid zip code for Portugal', () => {
  expect(validZip(" 8274-32")).toBe(false);
  expect(validZip("8274-322l")).toBe(false);
  expect(validZip(" 8274322")).toBe(false);
  expect(validZip(" 8274 322")).toBe(false);
  expect(validZip(" 827fr4-32fr2")).toBe(false);
  expect(validZip(" hello")).toBe(false);
  expect(validZip("8274 322")).toBe(false);
});


test('Returns true when valid zip code for Portugal', () => {
  expect(validZip(" 8274-323 ")).toBe(true);
  expect(validZip("8274-322 ")).toBe(true);
  expect(validZip(" 8274-322")).toBe(true);
  expect(validZip("8274-322")).toBe(true);

});


test('Returns expected array when valid roles text file', () => {
  console.log("fic -> " + cargosValid1);

  let data = fs.readFileSync("C:\\Users\\User\\Desktop\\Ambiente de Trabalho\\Universidade\\Ano 3\\Semestre 2\\PI\\Projeto\\AssocPais\\develop\\src\\tests\\cargos-test-files\\cargosDoCSV.txt", 'utf8');
  expect(setupTXTRoles(data)).toEqual(expect.arrayContaining(["Presidente do Conselho Executivo", "Vice-Presidente", "Tesoureiro(a)", "Vogal","Associado"]));

});



