import * as <%= duckName%> from './ducks/<%= duckName %>'

export { default as createStore } from './createStore'

export const actions = Object.assign(
  { <%= duckName %> }
)