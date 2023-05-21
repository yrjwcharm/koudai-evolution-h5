/*
 * @Date: 2021-04-22 19:00:46
 * @Author: dx
 * @LastEditors: dx
 * @LastEditTime: 2021-05-07 11:32:25
 * @Description: 微信分享
 */
import wx from 'weixin-js-sdk'
export function share(param, callback) {
    wx.ready(function () {
        // //分享给朋友
        // wx.onMenuShareAppMessage({
        //   title: param.title, // 分享标题
        //   desc: param.content, // 分享描述
        //   link: param.url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        //   imgUrl: param.img, // 分享图标
        //   type: param.type, // 分享类型,music、video或link，不填默认为link
        //   dataUrl: param.dataUrl, // 如果type是music或video，则要提供数据链接，默认为空
        //   success: function () {
        //     // 用户点击了分享后执行的回调函数
        //     callback && callback();
        //   },
        // });
        // //分享到朋友圈
        // wx.onMenuShareTimeline({
        //   title: param.title, // 分享标题
        //   desc: param.content, // 分享描述
        //   link: param.url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        //   imgUrl: param.img, // 分享图标
        //   success: function () {
        //     // 用户点击了分享后执行的回调函数
        //     callback && callback();
        //   },
        // });
        //分享给朋友
        wx.updateAppMessageShareData({
            title: param.title, // 分享标题
            desc: param.content, // 分享描述
            link: param.url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: param.img, // 分享图标
            type: param.type, // 分享类型,music、video或link，不填默认为link
            dataUrl: param.dataUrl, // 如果type是music或video，则要提供数据链接，默认为空
            success: function () {
                // 用户点击了分享后执行的回调函数
                callback && callback()
            },
        })
        //分享到朋友圈
        wx.updateTimelineShareData({
            title: param.title, // 分享标题
            desc: param.content, // 分享描述
            link: param.url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: param.img, // 分享图标
            success: function () {
                // 用户点击了分享后执行的回调函数
                callback && callback()
            },
        })
    })
}
