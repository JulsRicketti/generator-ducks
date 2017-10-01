const esprima = require('esprima')
const escodegen = require ('escodegen')

module.exports = function (oldFile, tempFile, duckProperties) {
  const { duckName, actionName, actionCreatorName, defaultStateName, defaultStateValue } = duckProperties
  const oldFileParsed = esprima.parseModule(oldFile)
  const oldFileParsedBody = oldFileParsed.body
  const tempFileParsed = esprima.parseModule(tempFile)
  const tempFileParsedBody = tempFileParsed.body

  let newFile = []
  let index = 0

  let defaultState = null
  // first lets set up the actions:
  for (let statement of oldFileParsedBody){
    // goes up until we reach the default state
    if (statement.declarations[0].id.name === 'defaultState') {
      defaultState = statement
      break
    }
    newFile.push (statement)
    index ++
  }

  // now lets do our redux state:

  console.log(index, 'newFile:', escodegen.generate(newFile[index - 1]))
}