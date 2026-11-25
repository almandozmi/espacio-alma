import { test } from "node:test";
import assert from "node:assert/strict";
import { checkEmail, checkField, formatName } from "../site/js/format.js";

test("formatName", () => {
  assert.equal(formatName("  maría   josé DE LA fuente "), "María José de la Fuente");
  assert.equal(formatName("ANA-MARÍA o'higgins"), "Ana-María O'Higgins");
  assert.equal(formatName("de la cruz"), "De la Cruz");
  assert.equal(formatName("ñuñoa álvarez"), "Ñuñoa Álvarez");
  assert.equal(formatName(""), "");
});

test("checkEmail", () => {
  assert.deepEqual(checkEmail(" Ana@Gmail.com "), { message: "" });
  assert.deepEqual(checkEmail("ana.perez@empresa.cl"), { message: "" });
  assert.deepEqual(checkEmail("ana@gmial.com"), { message: "¿Quisiste decir ana@gmail.com?", fix: "ana@gmail.com" });
  assert.equal(checkEmail("ana@hotmail.con").fix, "ana@hotmail.com");
  for (const bad of ["ana@gmail", "ana gmail.com", "ana@@gmail.com", ""]) {
    assert.equal(checkEmail(bad).message, "Correo no válido. Ejemplo: nombre@gmail.com");
  }
});

test("checkField", () => {
  assert.equal(checkField("name", "  ").message, "Escribe tu nombre y apellido.");
  assert.equal(checkField("name", "Ana").message, "");
  assert.equal(checkField("email", "").message, "Escribe tu correo.");
  assert.equal(checkField("email", "ana@gmial.com").fix, "ana@gmail.com");
  assert.equal(checkField("phone", "").message, "Escribe tu teléfono.");
  assert.equal(checkField("phone", "+56 9 1234 5678").message, "");
  assert.equal(checkField("phone", "912345678").message, "");
  assert.equal(checkField("phone", "1234").message, "Revisa el teléfono. Ejemplo: +56 9 1234 5678");
});
