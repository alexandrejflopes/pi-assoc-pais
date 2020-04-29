import "firebase/storage"
import {checkJSONparamsEntitiesAndTypes, compareCSVandJsonParameters, getandSaveCSVdata} from "../firebase_scripts/installation";
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


import inv_c1_json from "./csv-params-test-files/invalids/comb1_both/v1";
import inv_c1_members from "./csv-params-test-files/invalids/comb1_both/Membros.csv";
import inv_c1_students from "./csv-params-test-files/invalids/comb1_both/Alunos.csv";



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

  console.log("type1: " + typeof inv_c1_members);
  console.log("inv_c1_members: " +  inv_c1_members);


  /*inv_c1_json from "./csv-params-test-files/invalids/comb1_both/v1";
import inv_c1_members from "./csv-params-test-files/invalids/comb1_both/Membros.csv";
import inv_c1_students*/

  getandSaveCSVdata(new File(inv_c1_members, "f1"), new File(inv_c1_students, "f2"), callback);
});



