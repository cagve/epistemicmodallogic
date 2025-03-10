// ESTE ARCHIVO SIRVE COMO SCRATCH PARA ALGUNAS FUNCIONES
const MPL = require('../js/MPL.js');

const formula = new MPL.Wff('C{abc}(p -> q)');
console.log(formula.latex())
