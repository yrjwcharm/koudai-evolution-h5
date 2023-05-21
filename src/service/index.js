import axios from 'axios'
import qs from 'qs'
import baseConfig from '../config'
import storage from '../utils/storage'
import {Toast} from 'antd-mobile-v2'
import {inApp} from '~/utils'

axios.defaults.timeout = 10000
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
axios.defaults.headers.get['Content-Type'] = 'application/x-www-form-urlencoded'
axios.defaults.transformRequest = [
    function (data) {
        let ret = ''
        for (let it in data) {
            ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        return ret
    },
]

// axios拦截器
axios.interceptors.request.use(async (config) => {
    //拦截器处理
    let token = ''
    let uid = ''
    let utid = ''
    let partner = ''
    let result = storage.getItem('loginStatus') || {}

    if (typeof result === 'string') {
        result = JSON.parse(result)
    }
    if (result) {
        token = result.access_token || ''
        uid = result.uid || ''
        utid = result.utid || ''
        partner = result.partner || ''
    }
    config.headers.Authorization = token
    config.params = {
        ...config.data,
        // app: 'p_a',
        ts: new Date().getTime(),
        did: result.did || 'koudai-evolution-h5',
        ver: result.ver || '7.0.4',
        chn: 'evolution-h5',
        request_id: new Date().getTime().toString() + parseInt(Math.random() * 1e6, 16),
    }
    if (!inApp) {
        config.params.platform = 'h5'
    }
    if (uid) {
        config.params.uid = uid
    }
    if (utid) {
        config.params.utid = utid
    }
    if (partner) {
        config.params.partner = partner
    }
    return config
})
axios.interceptors.response.use(
    (response) => {
        //请求返回数据处理
        if (response.data?.code === 'A00001') {
            storage.removeItem('loginStatus')
            // window.document.dispatchEvent(new Event('reload'));
        }
        return response.data || {}
    },
    (err) => {
        return Promise.reject(err)
    },
)

export default class http {
    static async get(url, params, showLoading = '加载中...', api = 'kapi', signal) {
        try {
            // if (showLoading) {
            //   Toast.loading(showLoading, 0);
            // }
            if (!url.indexOf('http') > -1) {
                axios.defaults.baseURL = baseConfig().SERVER_URL[api] // 改变 axios 实例的 baseURL
            }
            const query = await qs.stringify(params)
            let res = null
            if (!params) {
                res = await axios.get(url, {signal})
                // if (showLoading) {
                //   Toast.hide();
                // }
            } else {
                res = await axios.get(url + '?' + query, {signal})
                // if (showLoading) {
                //   Toast.hide();
                // }
            }
            return res
        } catch (error) {
            console.log(error)
            return error
        }
    }
    static async post(url, params, showLoading = '加载中...', api = 'kapi') {
        if (!url.indexOf('http') > -1) {
            axios.defaults.baseURL = baseConfig().SERVER_URL[api] // 改变 axios 实例的 baseURL
        }
        try {
            // if (showLoading) {
            //     Toast.loading(showLoading, 0)
            // }
            let res = await axios.post(url, params)
            if (showLoading) {
                Toast.hide()
            }
            return res
        } catch (error) {
            console.log(error)
            return error
        }
    }
}
