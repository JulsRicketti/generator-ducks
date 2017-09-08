const Generator = require('yeoman-generator')
const chalk = require('chalk')

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
      { duckName, actionName, actionCreatorName, defaultStateName, defaultStateValue }
    )
  }

  install() {
    const installDependencies = this.options['install-dependencies']

    if(installDependencies) {
      this.installDependencies()
    }
  }
}
