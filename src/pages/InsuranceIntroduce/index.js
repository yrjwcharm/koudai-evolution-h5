import React, {useEffect, useState} from 'react'
import './index.css'
import http from '../../service'
import {Toast} from 'antd-mobile-v2'
import LoadingBg from '../../image/bg/loadingBg.png'
import {inApp} from '~/utils'

const InsuranceIntroduce = () => {
    const [data, setData] = useState({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        http.get('/insurance/introduce/20221214', {}, false)
            .then((res) => {
                if (res.code === '000000') {
                    setData(res.result)
                    setLoading(false)
                } else {
                    Toast.fail(res.message)
                    setLoading(false)
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }, [])
    const jump = (url) => {
        if (inApp && url?.path) {
            window.ReactNativeWebView.postMessage(`url=${JSON.stringify(url)}`)
        }
    }
    return (
        <div className="InsuranceIntroduceContainer">
            {loading ? (
                <img className="loadingBg" src={LoadingBg} alt="" />
            ) : (
                <>
                    {data?.items?.map((item, index) => {
                        return (
                            <div key={item + index} onClick={() => jump(item.url)}>
                                <img key={item + index} src={item.img} alt="" />
                            </div>
                        )
                    })}
                </>
            )}
        </div>
    )
}

export default InsuranceIntroduce
