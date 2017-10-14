const esprima = require('esprima')
const escodegen = require ('escodegen')

module.exports = function (oldFile, tempFile, duckProperties) {
  let { duckName, actionName, actionCreatorName, defaultStateName, defaultStateValue } = duckProperties
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
    newFile.push(statement)
    index ++ // to keep track of where we are in the old file
  }
  // push our new action statement
  newFile.push(tempFileParsedBody[0])

  // now lets do our redux state:
  const oldFileStateObject = oldFileParsedBody[index].declarations[0].init.properties
  let oldFileStateTokenized = esprima.tokenize(escodegen.generate(oldFileParsedBody[index]))

  oldFileStateTokenized.splice(oldFileStateTokenized.indexOf('}') - 1, 0, { type: 'Punctuator', value: ',' })
  oldFileStateTokenized.splice(oldFileStateTokenized.indexOf('}') - 1, 0,{ type: 'Identifier', value: defaultStateName })
  oldFileStateTokenized.splice(oldFileStateTokenized.indexOf('}') - 1, 0, { type: 'Punctuator', value: ':' })
  // this has to be done because we need to appropriately represent the string value
  if (typeof defaultStateValue === 'string') {
    defaultStateValue = ` \'${defaultStateValue}\'`
    oldFileStateTokenized.splice(oldFileStateTokenized.indexOf('}') - 1, 0,  { type: 'String', value: defaultStateValue })
  } else {
    oldFileStateTokenized.splice(oldFileStateTokenized.indexOf('}') - 1, 0,  { type: typeof defaultStateValue, value: defaultStateValue })
  }

  // console.log('AFTER', oldFileStateTokenized)
  let newDefaultState = ''

  oldFileStateTokenized.forEach (token => {
    const { type, value } = token

    if (type === 'Keyword' || value === 'defaultState' || value === '=') {
      newDefaultState = newDefaultState + value + ' '
    } else if (value === '{' || value === ',' || value === defaultStateValue) {
      newDefaultState = newDefaultState + value + '\n'
    } else {
      newDefaultState = newDefaultState + value
    }
  })
  console.log('newDefaultState:', newDefaultState)
  newFile.push (newDefaultState)
  index ++
  // next: the reducer!
  // const oldFileReducer = oldFileParsedBody[index].declarations[0].init.properties
  // console.log('old file reducer:', oldFileReducer)

  // console.log(index, 'newFile:', escodegen.generate(newFile[newFile.length - 1]))
}