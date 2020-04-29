//import * as valid_jsons from "./json-params-test-files/valid-jsons";

import "firebase/storage"
import {checkJSONparamsEntitiesAndTypes} from "../firebase_scripts/installation";
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
import invalid9 from "./json-params-test-files/invalid-jsons/9";

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



