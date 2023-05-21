/*
 * @Date: 2021-06-11 10:56:15
 * @Description:
 */
import {Dialog, Toast} from 'antd-mobile'
import storage from './storage'
import qs from 'qs'
import history from '../router/history'
//防抖(立即执行)

const debounce = (fn, delay = 500, isImmediate = true) => {
    let timer = null
    let flag = true
    if (isImmediate === true) {
        return function () {
            if (timer) {
                clearTimeout(timer)
                timer = null
            }
            if (flag === true) {
                fn.apply(this, arguments)
                flag = false
            }
            timer = setTimeout(() => {
                flag = true
                timer = null
            }, delay)
        }
    } else {
        return function () {
            if (timer) {
                clearTimeout(timer)
                timer = null
            }
            timer = setTimeout(() => {
                fn.apply(this, arguments)
                timer = null
            }, delay)
        }
    }
}
/**
 * 判断是否是微信环境
 */
const getIsWxClient = () => {
    var ua = navigator.userAgent.toLowerCase()
    if (ua.match(/MicroMessenger/i) && ua.match(/MicroMessenger/i)[0] === 'micromessenger') {
        return true
    }
    return false
}
const isIOS = () => {
    var u = navigator.userAgent
    var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) //ios终端
    return isiOS
}

/**
 * @description: 格式化数字 每三位增加逗号
 * @param {*} formaNum
 * @return {*} 格式化后的字符串
 */
const formaNum = (num, type = '') => {
    const arr = !isNaN(num * 1) ? (num * 1).toFixed(2).split('.') : []
    if (arr[0]) {
        const lessThanZero = arr[0].indexOf('-') !== -1
        num = lessThanZero ? arr[0].slice(1) : arr[0]
        let result = ''
        while (num.length > 3) {
            result = ',' + num.slice(-3) + result
            num = num.slice(0, num.length - 3)
        }
        if (num) {
            result = num + result
        }
        result = lessThanZero ? `-${result}` : result
        // if (arr[1] === '00') {
        //     return result;
        // } else if (arr[1] && arr[1][1] === '0') {
        //     return `${result}.${arr[1][0]}`;
        // } else {
        //     return `${result}.${arr[1]}`;
        // }
        if (type) {
            return result
        }
        return `${result}.${arr[1]}`
    } else {
        return num
    }
}

/**
 * 解析时间戳
 * @param {number} timeStemp - 毫秒数
 * @returns {Array} - [天，时，分，秒]
 */
const resolveTimeStemp = (timeStemp) => {
    if (!timeStemp || timeStemp <= 0) return []
    const AllSeconds = Math.round(timeStemp / 1000)
    const Seconds = AllSeconds % 60
    const AllMinutes = (AllSeconds - Seconds) / 60
    const Minutes = AllMinutes % 60
    const AllHours = (AllMinutes - Minutes) / 60
    const Hours = AllHours % 24
    const Days = (AllHours - Hours) / 24
    return [
        Days.toString().padStart(2, '0'),
        Hours.toString().padStart(2, '0'),
        Minutes.toString().padStart(2, '0'),
        Seconds.toString().padStart(2, '0'),
    ]
}

/**
 * 禁用devtools
 */
const disableReactDevTools = () => {
    const noop = () => {}
    const DEV_TOOLS = window.__REACT_DEVTOOLS_GLOBAL_HOOK__

    if (typeof DEV_TOOLS === 'object') {
        for (const [key, value] of Object.entries(DEV_TOOLS)) {
            DEV_TOOLS[key] = typeof value === 'function' ? noop : null
        }
    }
}

/*
 * 倒计时工具 - 可有效的控制执行误差在5毫秒浮动
 * @param {object} option -  配置项
 * @param {number} option.timeStemp - 时间戳，毫秒
 * @param {number} [option.interval=1000] - 间隔时间, 默认1000毫秒
 * @param {boolean} [option.immediate=false] - 是否立即执行回调
 * @param {Function} [option.callback] - 回调
 * @returns {() => void} cancel 停止计时器
 * 注（一定注意）：不管是使用此工具还是自己写，回调的整体执行时间都不应该超过interval
 * 由于js引擎对于加载损耗的优化策略，页面在显示和隐藏时会有更多的误差，需要在页面显示时重新执行
 */
const countdownTool = function ({
    timeStemp,
    interval: originalInterval = 1000,
    immediate = false,
    callback = (_) => void 0,
}) {
    if (!timeStemp || timeStemp <= 0 || timeStemp < originalInterval) return callback(0)

    let stop = false
    const cancel = () => {
        stop = true
    }

    let curIdx = 1
    let interval = originalInterval

    if (immediate) callback(timeStemp)

    let ct = Date.now()
    countdown(interval)
    function countdown(interval) {
        if (stop) return
        let timer = setTimeout(function () {
            clearTimeout(timer)

            let resetTime = timeStemp - originalInterval * curIdx
            if (resetTime < 0) resetTime = 0
            callback(resetTime)
            if (!resetTime) return

            curIdx++

            let ct2 = Date.now()
            let deviation = ct2 - interval - ct
            if (deviation >= originalInterval || deviation <= 0) deviation = 5
            ct = Date.now()
            countdown(originalInterval - deviation - (ct - ct2))
        }, interval)
    }

    return cancel
}

const inApp = window.ReactNativeWebView ? true : false

const logtool = (params) => {
    inApp && window.ReactNativeWebView.postMessage(`logParams=${JSON.stringify(params)}`)
}
//从完整url中获取接口地址
const getPathFromUrl = (url) => {
    url = url = '/' + url.split('/').slice(3).join('/')
    return url
}
const jump = (url, type) => {
    if (!url) return false
    if (inApp) {
        window.ReactNativeWebView.postMessage(`url=${JSON.stringify(url)}`)
    } else {
        if (url.type === 3) {
            window.location.href = url.path
            return
        } else if (url.type === 6) {
            const {popup = {}} = url
            if (popup.type === 'alert') {
                Dialog[popup.cancel ? 'confirm' : 'alert']({
                    title: popup.title,
                    content: popup.content,
                    closeOnMaskClick: popup.touch_close,
                    confirmText: popup.confirm?.text,
                    cancelText: popup.cancel?.text,
                    onCancel: () => {
                        if (popup.cancel?.action === 'back') {
                            history.goBack()
                        } else if (popup.cancel?.action === 'jump') {
                            jump(popup.cancel?.url, type)
                        }
                    },
                    onConfirm: () => {
                        if (popup.confirm?.action === 'back') {
                            history.goBack()
                        } else if (popup.confirm?.action === 'jump') {
                            jump(popup.confirm?.url, type)
                        }
                    },
                })
                return
            }
        }

        let parseUrl = `/${url.path}` + (url.params ? '?' + qs.stringify(url.params) : '')
        // 兼容老的url页面 比如之前嵌套在webview里的
        if (
            url.type == 4 &&
            (url?.params?.link?.indexOf('mofanglicai') > -1 || url?.params?.link?.indexOf('licaimofang') > -1)
        ) {
            parseUrl =
                getPathFromUrl(url?.params?.link) + (url.params?.params ? '?' + qs.stringify(url.params?.params) : '')
        }
        if (url.path === 'FundDetail') {
            let _params = url.params
            let code = url.params?.code
            delete _params.code
            parseUrl = `/${url.path}/${code}?${qs.stringify(_params)}`
        }

        if (url.path === 'ArticleDetail') {
            let _params = url.params
            let article_id = url.params?.article_id
            delete _params.article_id
            parseUrl = `/article/${article_id}?${qs.stringify(_params)}`
        }

        if (type == 'replace') {
            history.replace(parseUrl)
        } else {
            history.push(parseUrl)
        }
    }
}
const getUrlParams = (params) => {
    return qs.parse(params.slice(1))
}

//判断两个版本号的大小 7.1.1 8.1.1
const compareVersion = (v1, v2) => {
    if (v1 == v2) {
        return 0
    }

    const vs1 = v1.split('.').map((a) => parseInt(a, 10))
    const vs2 = v2.split('.').map((a) => parseInt(a, 10))

    const length = Math.min(vs1.length, vs2.length)
    for (let i = 0; i < length; i++) {
        if (vs1[i] > vs2[i]) {
            return 1
        } else if (vs1[i] < vs2[i]) {
            return -1
        }
    }

    if (length == vs1.length) {
        return -1
    } else {
        return 1
    }
}

const px = (px) => {
    return isNaN(px) ? 0 : (px / 50).toFixed(2) + 'rem'
}

export const formCheck = (data) => {
    let flag = true
    for (var i = 0; i < data.length; i++) {
        if (!data[i].append) {
            if (flag && !data[i].field) {
                Toast.show(data[i].text)
                flag = false
                break
            } else {
                flag = true
            }
        } else {
            if (data[i].append == '!') {
                if (flag && !data[i].field) {
                    Toast.show(data[i].text)
                    flag = false
                    break
                } else {
                    flag = true
                }
            } else {
                flag = data[i].append.test(data[i].field)
                if (!flag) {
                    Toast.show(data[i].text)
                    break
                }
            }
        }
    }
    return flag
}

export {
    debounce,
    getIsWxClient,
    isIOS,
    formaNum,
    storage,
    resolveTimeStemp,
    countdownTool,
    disableReactDevTools,
    inApp,
    logtool,
    jump,
    compareVersion,
    px,
    getUrlParams,
}
