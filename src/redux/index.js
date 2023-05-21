/*
 * @Date: 2021-09-13 09:49:49
 * @Author: dx
 * @LastEditors: dx
 * @LastEditTime: 2021-09-13 10:23:07
 * @Description: redux root store
 */
import {applyMiddleware, createStore, compose} from 'redux'
import {combineReducers} from 'redux'
import thunkMiddleware from 'redux-thunk'
import UserReducer from './reducers/userinfo'
import {createLogger} from 'redux-logger'

//中间件
const middlewares = [thunkMiddleware]
if (process.env.NODE_ENV === 'development') {
    middlewares.push(createLogger())
}

const reducer = combineReducers({
    userinfo: UserReducer,
})

// compose 从右往左执行
export default function configureStore() {
    const enhancers = compose(applyMiddleware(...middlewares))
    const store = createStore(reducer, enhancers)
    return {store}
}
