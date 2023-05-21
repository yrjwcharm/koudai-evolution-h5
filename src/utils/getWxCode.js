/*
 * @Date: 2021-05-07 11:23:57
 * @Author: dx
 * @LastEditors: dx
 * @LastEditTime: 2021-05-07 14:45:10
 * @Description: 获取微信授权
 */
const getWxCode = (path) => {
    const host = window.location.origin
    const return_uri = encodeURIComponent(host + path)
    const scope = 'snsapi_userinfo'
    window.location.href =
        'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx0ad9c77e69151b69&redirect_uri=' +
        return_uri +
        '&response_type=code&scope=' +
        scope +
        '#wechat_redirect'
}

export {getWxCode}
