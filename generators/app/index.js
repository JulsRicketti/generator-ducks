const Generator = require('yeoman-generator')
const chalk = require('chalk')
const fs = require('fs')

const generateDuck = require('./generateDuck')
const generateStoreIndex = require('./generateStoreIndex')

module.exports = class extends Generator {

  constructor (args, opts) {
    super(args, opts)

    this.option('hatch', {
      description: 'Will create a new duck file',
      default: false
    })

    this.option('install-dependencies', {
      description: 'Will install the dependencies.',
      default: false
    })
  }

  prompting() {
    let ducks = ['Create new duck']
    const hatch = this.options['hatch']
    if (this.fs.exists('./store/ducks/index.js')) {
      fs.readdirSync('store/ducks').forEach(file => {
        if (file !== 'index.js') {
          ducks.push(file)
        }
      })
    }

    const prompts = [ {
      when: function () {
        return ducks.length > 1 && !hatch
      },
      type: 'list',
      name: 'duckName',
      message: 'Which of these ducks would you like?',
      choices: ducks,
    },
    {
      when: function (response) {
        return (
          ducks.length === 1 || // if it 1 as opposed to 0 due to the Create option
          hatch ||
          response.duckName === 'Create new duck'
        )
      },
      type: 'input',
      name: 'duckName',
      message: 'What is the name of your duck?'
    },
    {
      type: 'input',
      name: 'actionName',
      message: 'What is the name of the action?'
    },
    {
      type: 'input',
      name: 'actionCreatorName',
      message: 'What is the name of the action creator?'
    },
    {
      type: 'input',
      name: 'defaultStateName',
      message: 'What is the name of the redux state?'
    },
    {
      type: 'input',
      name: 'defaultStateValue',
      message: 'What is the initial value of your default state?'
    }
    ]

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer
      this.props = props
    })
  }

  writing() {
    const { actionCreatorName, defaultStateName } = this.props
    let { duckName, defaultStateValue, actionName } = this.props
    actionName = actionName.toUpperCase()

    // we need to fix tha state value to be a string if it isnt a reserved
    // word or a number and if the user didnt include quotes:
    let addQuotesToStateValue = (
      defaultStateValue !== 'undefined' &&
      defaultStateValue !== 'null' && 
      !Number(defaultStateValue)
    )
    // remove the quotes if the user inserts them in
    if(defaultStateValue.indexOf('\'') !== -1 || defaultStateValue.indexOf('"') !== -1 ) {
      defaultStateValue = defaultStateValue.substring(1, defaultStateValue.length-1)
    }

    // we need to remove the .js that may appear in the duckName:
    if(duckName.indexOf('.js')){
      duckName = duckName.replace('.js', '')
    }
    console.log('duckName:', duckName)

    const createStoreExists = this.fs.exists('store/createStore.js')
    const storeIndexExists = this.fs.exists('store/index.js')
    const ducksIndexExists = this.fs.exists('store/ducks/index.js')

    const duckExists = this.fs.exists(`store/ducks/${duckName}.js`)

    if (!createStoreExists) {
      this.fs.copy(
        this.templatePath('createStore.js'),
        this.destinationPath('store/createStore.js')
      )
      this.fs.copyTpl(
        this.templatePath('index.js'),
        this.destinationPath('store/index.js'),
        { duckName }
      )
      this.fs.copyTpl(
        this.templatePath('ducks/index.js'),
        this.destinationPath('store/ducks/index.js'),
        { duckName }
      )
      this.fs.copyTpl(
        this.templatePath('ducks/duck.js'),
        this.destinationPath(`store/ducks/${duckName}.js`),
        {
          duckName,
          actionName,
          actionCreatorName,
          defaultStateName,
          defaultStateValue,
          addQuotesToStateValue
        }
      )
    } else {
      if (!ducksIndexExists) {
        this.fs.copyTpl(
          this.templatePath('ducks/index.js'),
          this.destinationPath('store/ducks/index.js'),
          { duckName }
        )
      } else {
        let indexOld = this.fs.read(this.destinationPath('store/ducks/index.js'))

        this.fs.copyTpl(
          this.templatePath('ducks/index.js'),
          this.destinationPath('store/ducks/temp_index.js'),
          { duckName }
        )
        let indexNew = this.fs.read(
          this.destinationPath('store/ducks/temp_index.js')
        )
        this.fs.delete(
          this.destinationPath('store/ducks/temp_index.js')
        )
        // this.fs.write(
        //   this.destinationPath('store/ducks/index.js'),
        //   indexNew + indexOld
        // )
      }
      if (!storeIndexExists) {
        this.fs.copyTpl(
          this.templatePath('index.js'),
          this.destinationPath('store/index.js'),
          { duckName }
        )
      } else {
        this.fs.copyTpl(
          this.templatePath('index.js'),
          this.destinationPath('store/temp_index.js'),
          { duckName }
        )
        let storeIndexNew = this.fs.read(this.destinationPath('store/temp_index.js'))
        let storeIndexOld = this.fs.read(this.destinationPath('store/index.js'))

        // this.fs.write(
        //   this.destinationPath('store/index.js'),
        //   generateStoreIndex(storeIndexOld, storeIndexNew, duckName)
        // )

        this.fs.delete(
          this.destinationPath('store/temp_index.js')
        )
      }

      if (!duckExists){ // DONT FORGET TO NOT THIS THING!
        this.fs.copyTpl(
          this.templatePath('ducks/duck.js'),
          this.destinationPath(`store/ducks/${duckName}.js`),
          { duckName, actionName, actionCreatorName, defaultStateName, defaultStateValue, addQuotesToStateValue }
        )
      } else {
        this.fs.copyTpl(
          this.templatePath('ducks/duck.js'),
          this.destinationPath('store/ducks/temp_duck.js'),
          { duckName, actionName, actionCreatorName, defaultStateName, defaultStateValue, addQuotesToStateValue }
        )
        let duckNew = this.fs.read(this.destinationPath('store/ducks/temp_duck.js'))
        let duckOld = this.fs.read(this.destinationPath(`store/ducks/${duckName}.js`))

        // generateDuck(duckOld, duckNew, this.props)
        // TODO: not working! Fix the writing of this file!
        this.fs.write(
          this.destinationPath(`store/ducks/${duckName}.js`),
          generateDuck(duckOld, duckNew, this.props)
        )

        this.fs.delete(
          this.destinationPath('store/ducks/temp_duck.js')
        )
      }
    }
    
  }

  install() {
    const installDependencies = this.options['install-dependencies']

    if(installDependencies) {
      this.installDependencies()
    }
  }
}
