import {
  createStore as doCreateStore,
  combineReducers,
  applyMiddleware,
  compose
} from 'redux'
import { routerReducer } from 'react-router-redux'
import * as reducers from './ducks'

export default function createStore (...middlewares) {
  return doCreateStore(
    combineReducers(allReducers),
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
  )
}