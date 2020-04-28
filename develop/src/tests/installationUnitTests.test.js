//import * as valid_jsons from "./json-params-test-files/valid-jsons";

const valid1 = require("./json-params-test-files/valid-jsons/v1");

const checkJSONparamsEntitiesAndTypes = require("../firebase_scripts/installation") ;

test("Returns true when valid parameters JSON", () => {
   expect(checkJSONparamsEntitiesAndTypes(valid1)).toBe(true);
});



