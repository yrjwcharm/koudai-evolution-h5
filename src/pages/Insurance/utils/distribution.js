import {sendPoint} from './sendPoint'
import http from '../../../service'
import {Toast} from 'antd-mobile-v2'

const getData = (pageid) => {
    // sendPoint({
    //     pageid: pageid,
    //     ts: Date.now(),
    //     chn: 'evolution-h5', // 渠道
    //     event: 'click_appointment',
    // })
    http.get('https://marketapi-saas.licaimofang.com/insurance_planner/20220720/get_userinfo_by_token', {})
        .then((res) => {
            if (res.code === 20000) {
                // result: insurance_planner>sale_id
                // setSaleId(`ins_${res.result.insurance_planner.sale_id}`)
                sendPoint({
                    chn: 'evolution-h5', // 渠道
                    pageid: pageid,
                    ts: Date.now(),
                    event: 'click_appointment',
                })
                const _params = JSON.stringify({
                    path: `pages/workWeixin/index?params=ins_${res.result.insurance_planner.sale_id}`,
                    type: 5,
                    id: 34,
                    params: {app_id: 'gh_26accfa89791'},
                })
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(`url=${_params}`)
                }
            } else {
                Toast.fail(res.message)
            }
        })
        .catch((err) => {
            console.log(err)
        })
}
export const distribution = (pageid) => {
    getData(pageid)
}
