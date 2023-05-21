/*
 * @Date: 2021-03-19 15:55:58
 * @Description:
 */
import 'react-app-polyfill/stable'
import React from 'react'
import ReactDOM from 'react-dom'
import './utils/fontIcons'
import './index.css'
import './utils/LogTool'
import Router from './router'
import reportWebVitals from './reportWebVitals'
import {disableReactDevTools} from './utils'
process.env.NODE_ENV === 'production' && disableReactDevTools()

ReactDOM.render(
    <React.StrictMode>
        <Router />
    </React.StrictMode>,
    document.getElementById('root'),
)
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
