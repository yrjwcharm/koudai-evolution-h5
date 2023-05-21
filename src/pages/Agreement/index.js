/*
 * @Date: 2021-09-02 15:54:08
 * @Author: dx
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-20 19:22:31
 * @Description: 用户协议
 */
import {useEffect, useState} from 'react'
import './index.css'
import http from '../../service'
import qs from 'qs'
const Agreement = ({match}) => {
    const params = qs.parse(window.location.search.split('?')[1] || '')

    const [data, setData] = useState('')

    useEffect(() => {
        http.get('/passport/agreement/detail/20210101', {id: match?.params?.id || params?.id}).then((res) => {
            if (res.code === '000000') {
                document.title = res.result.title || '用户协议'
                setData(res.result.agreement)
            }
        })
    }, [params, match?.params])

    useEffect(() => {
        if (data) {
            if (window.location.hash) {
                document.querySelector(`a[name=${window.location.hash.split('#')[1]?.split('?')[0]}]`).scrollIntoView()
            }
        }
    }, [data])

    return <div className="agreementContainer" dangerouslySetInnerHTML={{__html: data}} />
}

export default Agreement
