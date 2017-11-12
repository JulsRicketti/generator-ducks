const esprima = require('esprima')
const escodegen = require ('escodegen')

module.exports = function (oldFile, tempFile, duckProperties) {
  let { duckName, actionName, actionCreatorName, defaultStateName, defaultStateValue, addQuotesToStateValue } = duckProperties
  const oldFileParsed = esprima.parseModule(oldFile)
  const oldFileParsedBody = oldFileParsed.body
  const tempFileParsed = esprima.parseModule(tempFile)
  const tempFileParsedBody = tempFileParsed.body

  let generatedFileContents = []
  let index = 0

  let defaultState = null
  // first lets set up the actions:
  for (let statement of oldFileParsedBody){
    // goes up until we reach the default state
    if (statement.declarations[0].id.name === 'defaultState') {
      defaultState = statement
      break
    }
    generatedFileContents.push(escodegen.generate(statement))
    index ++ // to keep track of where we are in the old file
  }
  // push our new action statement
  generatedFileContents.push(escodegen.generate(tempFileParsedBody[0]))

  // now lets do our default redux state:
  const oldFileStateObject = oldFileParsedBody[index].declarations[0].init.properties
  let oldFileStateTokenized = esprima.tokenize(escodegen.generate(oldFileParsedBody[index]))

  oldFileStateTokenized.splice(oldFileStateTokenized.indexOf('}') - 1, 0, { type: 'Punctuator', value: ',' })
  oldFileStateTokenized.splice(oldFileStateTokenized.indexOf('}') - 1, 0,{ type: 'Identifier', value: defaultStateName })
  oldFileStateTokenized.splice(oldFileStateTokenized.indexOf('}') - 1, 0, { type: 'Punctuator', value: ':' })
  
  // this has to be done because we need to appropriately represent the string value
  if (addQuotesToStateValue) {
    defaultStateValue = ` \'${defaultStateValue}\'`
    oldFileStateTokenized.splice(oldFileStateTokenized.indexOf('}') - 1, 0,  { type: 'String', value: defaultStateValue })
  } else {
    const defaultStateValueType = 'object'
    switch (defaultStateValue) {
      case 'null':
      case '[]':
      case '{}':
        type = 'object'
        break
      case 'undefined':
        type = 'undefined'
        break
      case 'true':
      case 'false':
        type = 'boolean'
        break
      default:
        type = 'number' 
    }

    oldFileStateTokenized.splice(oldFileStateTokenized.indexOf('}') - 1, 0,  { type: defaultStateValueType, value: defaultStateValue })
  }

  let newDefaultState = ''

  oldFileStateTokenized.forEach (token => {
    const { type, value } = token

    // Note: the appropriate identation will have to be done later!
    if (type === 'Keyword' || value === 'defaultState' || value === '=') {
      newDefaultState = newDefaultState + value + ' '
    } else {
      newDefaultState = newDefaultState + value
    }
  })

  generatedFileContents.push (newDefaultState)
  index ++

  // next: the reducer!
  const oldFileReducer = oldFileParsedBody[index]
  let oldFileReducerTokenized = esprima.tokenize(escodegen.generate(oldFileReducer))
  let newReducer = ''
  const newCase = `case ${actionName}: return Object.assign({}, state, { ${defaultStateName}: action.${defaultStateName} })`
  oldFileReducerTokenized.splice(oldFileStateTokenized.indexOf('default') - 1, 0, { type: 'New Statement', value: newCase })

  oldFileReducerTokenized.forEach (token => {
    const { type, value } = token

    // Note: the appropriate identation will have to be done later!
    if (type === 'Keyword' || value === 'reducer' || value === '=') {
      newReducer = newReducer + value + ' '
    } else {
      newReducer = newReducer + value
    }
  })
  generatedFileContents.push(newReducer)

  // finally our actionCreator
  // this we can just get from our generated files (old and new!)
  oldFileParsedBody.forEach(declaration => {
    if (declaration.type === 'ExportNamedDeclaration'){
        generatedFileContents.push (escodegen.generate(declaration))
    }
  })
  generatedFileContents.push(escodegen.generate(tempFileParsedBody[tempFileParsedBody.length - 1]))
  
  // generated file needs to be a single string to make this work:
  let generatedFile = ''
  generatedFileContents.forEach(statement => {
    generatedFile = generatedFile + statement + '\n'
  })
  
  const escodegenOptions = {
      format: {
        indent: {
          style: '  ',
          base: 0,
          adjustMultilineComment: false
      },
      semicolons: false
    }
  }
  generatedFile = escodegen.generate(esprima.parseModule(generatedFile), escodegenOptions)
  return generatedFile.replace(/;/g, '')

}