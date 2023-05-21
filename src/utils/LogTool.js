/*
 * @Date: 2021-06-11 10:35:34
 * @Author: yhc
 * @LastEditors: yhc
 * @LastEditTime: 2022-03-23 11:21:32
 * @Description:
 */
import http from '../service'
const sUrl = 'https://tj.licaimofang.com/v.gif'
const _ts = 0
const LogTool = (event, ctrl, pid, ref, staytime, tag) => {
    var _params = {},
        st = new Date().getTime()
    if ((st - _ts) / 1000 < 1) {
        //避免重复发送
        return false
    }
    _params.event = event || 'click'
    setTimeout(() => {
        _params.pageid = pid || global.previousRoutePageId || global.currentRoutePageId || '' //点击事件的pid是当前页面的 注意判断按钮是否是跳转，如果不跳转取当前页面的pid
        _params.ref = ref || '' //点击事件不传ref
    })
    _params.staytime = staytime || '' //页面停留时间
    _params.ctrl = ctrl || '' //当前页面控件标识
    _params.tag = tag || '' //特殊标记 abtest

    setTimeout(() => {
        http.get(sUrl, _params)
        global.previousRoutePageId = ''
    }, 200)
}
window.LogTool = LogTool
