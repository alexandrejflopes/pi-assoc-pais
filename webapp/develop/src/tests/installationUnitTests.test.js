import "firebase/storage"
import {
  checkJSONparamsEntitiesAndTypes,
  compareCSVandJsonParameters,
  getandSaveCSVdata, readAndCheckRolesFile, setupCSVData,
  setupTXTRoles, validateRolesJSON,
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

import cargosValid from "./cargos-test-files/cargosJSON_valid";
import cargosValid1 from "./cargos-test-files/cargosDoCSV.txt";
import cargosInvalid1 from "./cargos-test-files/invalids/cargosJSON_invalid1";
import cargosInvalid2 from "./cargos-test-files/invalids/cargosJSON_invalid2_EmptyJson";
// invalid JSON number 3 has incorrect syntax on purpose, but cannot be imported with bad syntax
//import cargosInvalid3 from "./cargos-test-files/invalids/cargosJSON_invalid3_SINTAX";
import cargosInvalid4 from "./cargos-test-files/invalids/cargosJSON_invalid4";
import cargosInvalid5 from "./cargos-test-files/invalids/cargosJSON_invalid5";
import cargosInvalid6 from "./cargos-test-files/invalids/cargosJSON_invalid6";
// invalid JSON number 7 has incorrect syntax on purpose (is empty), but cannot be imported with bad syntax
//import cargosInvalid7 from "./cargos-test-files/invalids/cargosJSON_invalid7_EMPTY";
import cargosInvalid8 from "./cargos-test-files/invalids/cargosJSON_invalid8";
import cargosMissing from "./cargos-test-files/cargosJSON_valid_MissingRoles";

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


test('Throws exception when invalid roles file is provided', () => {
  expect(() => {
    validateRolesJSON(cargosInvalid1, cargosValid1.toString());
  }).toThrowError('No admin permission');
  expect(() => {
    validateRolesJSON(cargosInvalid2, cargosInvalid2.toString());
  }).toThrowError('No roles provided');
  expect(() => {
    validateRolesJSON(cargosInvalid4, cargosInvalid4.toString());
  }).toThrowError('Less or more than one permission provided for role');
  expect(() => {
    validateRolesJSON(cargosInvalid5, cargosInvalid5.toString());
  }).toThrowError('Less or more than one permission provided for role');
  expect(() => {
    validateRolesJSON(cargosInvalid6, cargosInvalid6.toString());
  }).toThrowError('Invalid value for admin permission');
  expect(() => {
    validateRolesJSON(cargosInvalid8, cargosInvalid8.toString());
  }).toThrowError('duplicated roles');
});

test('Returns false when there is a mismatch between members roles from csv and json roles file', done => {
  function callback(data) {
    try {
      expect(data).toBe(false);
      done();
    } catch (error) {
      done(error);
    }
  }

  const membersDocsList = setupCSVData("Número de Sócio;Cargo;Quotas pagas;Nome;NIF;Cartão Cidadão;Email;Telemóvel;Profissão ;Morada;Código Postal;Localidade;Admin;um parametro\n" +
    "54353;  Presidente do Conselho Executivo  ;true;Diogo Gomes;894274893;CC1;dgomes@pi-assoc-pais.com;987585;Professor;Rua do Colegio;0000-000;Aveiro;true;v1\n" +
    "98978;Vice-Presidente;false;Vera Teixeira;895758866;CC2;vera@pi-assoc-pais.com;6895655;Investigadora;Avenida do Sol;5555-555;Espinho;true;v2\n" +
    "33244;Tesoureiro(a);true;Luísa Santos;937498483;nd;luisa.santos@pi-assoc-pais.com;3975489;Professor;Rua do Colegio;4444-444;Estarreja;true;v3\n" +
    "65362;Vogal;true;Olivério Baptista;894274893;CC4;oliverio@pi-assoc-pais.com;97545409;GNR;Avenida do Sol;1234-321;Estarreja;true;v4\n" +
    "92839;Associado(a);false;Mário Silva;937498483;CC5;mario.silva@pi-assoc-pais.com;765243;Professor;Avenida do Sol;7777-888;Espinho;false;v5\n" +
    "12764;Associado(a);true;Joana Marçal;895758866;CC6;joana_marcal@pi-assoc-pais.com;6895655;Gestora;Rua do Colegio;4555-535;Aveiro;false;v6\n", true);


  validateRolesJSON(cargosMissing, cargosMissing.toString(), callback);

});

test('Returns true when members roles from csv and json roles file match', done => {
  function callback(data) {
    try {
      expect(data).toBe(true);
      done();
    } catch (error) {
      done(error);
    }
  }

  const membersDocsList = setupCSVData("Número de Sócio;Cargo;Quotas pagas;Nome;NIF;Cartão Cidadão;Email;Telemóvel;Profissão ;Morada;Código Postal;Localidade;Admin;um parametro\n" +
    "54353;  Presidente do Conselho Executivo  ;true;Diogo Gomes;894274893;CC1;dgomes@pi-assoc-pais.com;987585;Professor;Rua do Colegio;0000-000;Aveiro;true;v1\n" +
    "98978;Vice-Presidente;false;Vera Teixeira;895758866;CC2;vera@pi-assoc-pais.com;6895655;Investigadora;Avenida do Sol;5555-555;Espinho;true;v2\n" +
    "33244;Tesoureiro(a);true;Luísa Santos;937498483;nd;luisa.santos@pi-assoc-pais.com;3975489;Professor;Rua do Colegio;4444-444;Estarreja;true;v3\n" +
    "65362;Vogal;true;Olivério Baptista;894274893;CC4;oliverio@pi-assoc-pais.com;97545409;GNR;Avenida do Sol;1234-321;Estarreja;true;v4\n" +
    "92839;Associado(a);false;Mário Silva;937498483;CC5;mario.silva@pi-assoc-pais.com;765243;Professor;Avenida do Sol;7777-888;Espinho;false;v5\n" +
    "12764;Associado(a);true;Joana Marçal;895758866;CC6;joana_marcal@pi-assoc-pais.com;6895655;Gestora;Rua do Colegio;4555-535;Aveiro;false;v6\n", true);


  validateRolesJSON(cargosValid, cargosValid.toString(), callback);

});



