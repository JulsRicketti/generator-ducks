const Generator = require('yeoman-generator')
const chalk = require('chalk')

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

    /**
     * TODO:
     * if we don't have a store with the boilerplate files, we do the initial setup.
     * Look into the folder, see which ducks are available and list them
     * 
     * - hatch === true: just ask for ducks name, followed by the actions and reducer
     * - If default, select from the list of ducks, to chose which one it will be generated in
     * and ask for both action and reducer names, generate that in the chosen duck.
     */
    const prompts = [{
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
    const { duckName, actionName, actionCreatorName, defaultStateName, defaultStateValue } = this.props

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
        { duckName, actionName: actionName.toUpperCase(), actionCreatorName, defaultStateName, defaultStateValue }
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
          { duckName, actionName, actionCreatorName, defaultStateName, defaultStateValue }
        )
      } else {
        this.fs.copyTpl(
          this.templatePath('ducks/duck.js'),
          this.destinationPath('store/ducks/temp_duck.js'),
          { duckName, actionName, actionCreatorName, defaultStateName, defaultStateValue }
        )
        let duckNew = this.fs.read(this.destinationPath('store/ducks/temp_duck.js'))
        let duckOld = this.fs.read(this.destinationPath(`store/ducks/${duckName}.js`))

        generateDuck(duckOld, duckNew, this.props)
        // this.fs.write(
        //   this.destinationPath('store/index.js'),
        //   generateDuck(storeIndexOld, storeIndexNew, this.props)
        // )

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
