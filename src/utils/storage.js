/* localStorage 的配置 */
function setItem(key, value) {
    if (typeof value === 'object') {
        value = JSON.stringify(value)
    }
    window.localStorage.setItem(key, value)
}

// TODO 这里默认从json转换了
function getItem(key) {
    let item = window.localStorage.getItem(key)
    if (_isJSON(item)) {
        item = JSON.parse(item)
    }
    return item
}

function removeItem(key) {
    let item = window.localStorage.getItem(key)
    if (item) {
        window.localStorage.removeItem(key)
        return true
    } else {
        return false
    }
}

function clear() {
    return window.localStorage.clear()
}

function getLength() {
    return window.localStorage.length
}

function _isJSON(item) {
    return /(\[|\{).*(\]|\})/.test(item)
}

function setTime(day) {
    let second = 60 * 60 * 24 * Number(day)
    let startTime = new Date().getTime()
    let expirationTime = second + startTime
    setItem('expirationTime', expirationTime)
}
function expiration(keyArr = []) {
    let currentTime = new Date().getTime()
    let expirationTime = getItem('expirationTime')
    if (currentTime > expirationTime) {
        keyArr.forEach((o) => removeItem(o))
    }
}

const storage = {
    setItem, // 设置缓存
    getItem, // 获取缓存
    removeItem, // 删除缓存
    clear, // 清除所有缓存
    getLength, // 获取所有缓存的长度
    setTime,
    expiration,
}

export default storage
