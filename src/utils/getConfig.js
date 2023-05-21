/*
 * @Date: 2021-05-08 17:53:05
 * @Author: dx
 * @LastEditors: yhc
 * @LastEditTime: 2021-06-04 10:32:45
 * @Description: 获取微信分享配置
 */
import http from '../service'
import wx from 'weixin-js-sdk'

const getConfig = (configShare) => {
    http.get('/share/wx/config/20210101', {url: window.location.href}, false).then((res) => {
        if (res?.code === '000000') {
            wx.config({
                ...res.result,
                debug: false,
                jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'],
            })
            configShare && configShare()
        }
    })
}

export {getConfig}
