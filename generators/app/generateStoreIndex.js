const esprima = require('esprima')
const escodegen = require ('escodegen')

module.exports = function (oldFile, tempFile, duckName) {
  
  const oldFileParsed = esprima.parseModule(oldFile)
  const oldFileParsedBody = oldFileParsed.body
  const tempFileParsed = esprima.parseModule(tempFile)
  const tempFileParsedBody = tempFileParsed.body

  let newFile = []
  let index = 0
  // first we grab the import statments coming from the ducks
  // as well as the export createStore (which will always be the same)
  for (let statement of oldFileParsedBody){
    index ++
    if (statement.type === 'ExportNamedDeclaration') {
      newFile.push(tempFileParsedBody[0])
      newFile.push (statement)
      break
    }
    newFile.push (statement)
  }

  // now we need to handle the last part of the file which the export of actions

  // console.log('newFile:', newFile)

  const finalActions = esprima.tokenize(escodegen.generate(oldFileParsedBody[index]))
  const tempAction = esprima.tokenize(`{ ${duckName} },`) // this is the only part we care about
  let identifierNumber = 0 // we are looking for identifier 4
  let newActions = []

  finalActions.forEach((action, index) => {
    identifierNumber += action.type === 'Identifier' ? 1 : 0

    if (identifierNumber === 4) {
      finalActions.splice.apply(finalActions, [index - 1, 0].concat(tempAction))
      identifierNumber++
    }
  })

  let generatedFile = ''

  newFile.forEach (statement => {
    if(statement.type === 'ExportNamedDeclaration'){
      generatedFile = generatedFile + '\n'
    }
    generatedFile = generatedFile + escodegen.generate(statement).replace(';', '')+'\n'
  })
  generatedFile = generatedFile + '\n'

  finalActions.forEach (token => {
    const { value } = token

    if (value === 'Object' || value === '.' || value === 'assign') {
      generatedFile = generatedFile + value
    } else {
      generatedFile = generatedFile + value + ' '
    }
  })
  console.log('newFileString', generatedFile)
  return generatedFile
}