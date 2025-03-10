// ESTE ARCHIVO SIRVE COMO SCRATCH PARA ALGUNAS FUNCIONES
var fs = require("fs");
const MPL = require('../js/MPL.js');

var jsonString =`{
  "states": [
    {
      "id": 0,
      "assignment": {
        "p": true,
        "q": true
      },
      "successors": [
        {
          "agent": "a",
          "target": 1
        },
        {
          "agent": "b",
          "target": 0
        }
      ]
    },
    {
      "id": 1,
      "assignment": {
        "p": false,
        "q": true
      },
      "successors": [
        {
          "agent": "a",
          "target": 0
        },
        {
          "agent": "b",
          "target": 1
        }
      ]
    }
  ],
  "agents": ["a", "b"]
}`

const model = new MPL.Model
model.fromJSON(jsonString)


console.log(model.getStates())
console.log(model.getModelString())
