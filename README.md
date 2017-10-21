# generator-ducks [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> A simple generator for Ducks, the Redux Reducer Bundles

## Installation

First, install [Yeoman](http://yeoman.io) and generator-ducks using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-ducks
```

Then generate your new project:

```bash
yo ducks
```
## What is Ducks?

Ducks is an alternative way to bundle reducers, action types and actions when using Redux.
It's main difference from Redux, and in my opinion major improvement is in the fact that we bundle toguether all our actions, action creators and reducers according to their functionality as opposed to traditional Redux in which those are done in separate files.

If you are unfamiliar with Ducks please see the [original proposal](https://github.com/erikras/ducks-modular-redux).

## Usage Instructions  

The generator takes care of all the initial setup boilerplate code to get your ducks going.
The following file structure is created:

```
├── destinationFolder/          # Destination path folder
    ├── store/                  # Generated store folder, this is the Redux Store folder
    │   ├── createStore.js      # Create store file This is  the store setup. It will never change once generated
    │   ├── index.js            # Store index file. This exports the ducks to be easily accessed throughout the app 
    │   ├── ducks/              # Generated folder which will hold all your ducks
            |── index.js        # Exports your ducks to be handled in the parent folder
            |── daffy.js        # Your duck file. Will keep the actions, action creators, reducers and default state.
            |── donald.js       # Your other duck file. Listed here just for the purpose of example.
```

### So once we get `yo ducks` going, how does this work?

The prompt will ask you all the questions it needs to know:
- list of your available ducks with the option to create a new one
- your duck name (in the event you would like to create a new one)
- your action name
- your action creator name
- your default state property name and value

Unfortunately when editing a previously existing file, in other words, starting from the second time you run this in your app, their will be a prompt asking you if you would like to proceed with doing so.

If you would like to skip the creation of any of the previously listed Redux thingies, just leave them blank and node new code for them will be generated.

`Example: if you don't want a new default state, just leave it blank when it's prompt appears.`

For the default state values, we currently support strings, numbers, arrays, objects and all relevant JavaScript keywords (I wouldn't bet my life on that last one, so in case I missed any, do not hesitate to let me know).

### Important Note:

Avoid changing the file structure. Due to the nature of this generator of editing previously existing files, major changes in the order of things will affect the ability to later generate more code on that same file. When you do need to add your own code, make sure to keep it all within the generated functions and objects.


## Getting To Know Yeoman

 * Yeoman has a heart of gold.
 * Yeoman is a person with feelings and opinions, but is very easy to work with.
 * Yeoman can be too opinionated at times but is easily convinced not to be.
 * Feel free to [learn more about Yeoman](http://yeoman.io/).

## License

MIT © [JulsRicketti]()


[npm-image]: https://badge.fury.io/js/generator-ducks.svg
[npm-url]: https://npmjs.org/package/generator-ducks
[travis-image]: https:/
/travis-ci.org/JulsRicketti/generator-ducks.svg?branch=master
[travis-url]: https://travis-ci.org/JulsRicketti/generator-ducks
[daviddm-image]: https://david-dm.org/JulsRicketti/generator-ducks.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/JulsRicketti/generator-ducks
[coveralls-image]: https://coveralls.io/repos/JulsRicketti/generator-ducks/badge.svg
[coveralls-url]: https://coveralls.io/r/JulsRicketti/generator-ducks
