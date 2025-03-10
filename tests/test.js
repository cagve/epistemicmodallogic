// TEST FILE
const MPL = require('../js/MPL.js');
console.log("EMPEZANDO TESTS")

function testCommonKnowledge() {
  // Verificar conversión a ASCII
  const formula6 = new MPL.Wff('C{a,b}p');
  runTest('Convertir C{a,b}p a ASCII', formula6.ascii() === 'C{a,b}p');

  // Verificar conversión a LaTeX
  const formula7 = new MPL.Wff('C{a,b}p');
  runTest('Convertir C{a,b}p a LaTeX', formula7.latex() === 'C_{a,b}p');

  // Verificar conversión a Unicode
  const formula8 = new MPL.Wff('C{a,b}p');
  runTest('Convertir C{a,b}p a Unicode', formula8.unicode() === 'C{a,b}p');
}

// Ejecutar los tests
testCommonKnowledge();
