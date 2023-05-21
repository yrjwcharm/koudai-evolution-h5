import React, {useEffect, useState} from 'react'
import qs from 'qs'
import http from '~/service'
import './index.css'
import {inApp, storage} from '~/utils'
import {Toast} from 'antd-mobile'

const GoalRedeem = () => {
    const [data, setData] = useState(null)

    const getData = () => {
        http.get('/tool/signal/detail/20220711', {tool_id: 5}).then((res) => {
            if (res.code === '000000') {
                setData(res.result)
                window.ReactNativeWebView?.postMessage(
                    `data=${JSON.stringify({
                        tool_id: 5,
                        title: res.result?.title,
                        title_icon: res.result?.title_icon,
                        risk_tip: res.result?.risk_tip,
                    })}`,
                )
            } else {
                Toast.show(res.message)
            }
        })
    }

    useEffect(() => {
        let timer
        if (inApp) {
            const {timeStamp} = qs.parse(window.location.href.split('?')[1]) || {}
            timer = setInterval(() => {
                if (storage.getItem('loginStatus')?.timeStamp === timeStamp) {
                    clearInterval(timer)
                    getData()
                }
            }, 10)
        } else {
            getData()
        }
        return () => {
            timer && clearInterval(timer)
        }
    }, [])

    useEffect(() => {
        let count = 0
        let timer = ''
        if (data && inApp) {
            window.ReactNativeWebView.postMessage(document.querySelector('.GoalRedeem').scrollHeight)
            timer = setInterval(() => {
                if (count < 3) {
                    count++
                    window.ReactNativeWebView.postMessage(document.querySelector('.GoalRedeem').scrollHeight)
                } else {
                    clearInterval(timer)
                }
            }, 1000)
        }
        return () => {
            clearInterval(timer)
        }
    }, [data])

    return data ? (
        <div className="GoalRedeem">
            <div className="topPart">
                <div className="tagWrap">
                    {data.tags?.map((item, idx) => (
                        <div key={idx} className="tagItem">
                            {item}
                        </div>
                    ))}
                </div>
                <div className="topPartDesc">{data.brief}</div>
            </div>
            <div className="mainCardWrap">
                {data?.desc_info?.img?.map?.((item, index) => {
                    return (
                        <img
                            key={item + index}
                            src={item}
                            style={{marginTop: index === 0 ? '-2rem' : '.32rem'}}
                            alt=""
                        />
                    )
                })}
            </div>
        </div>
    ) : null
}

export default GoalRedeem
