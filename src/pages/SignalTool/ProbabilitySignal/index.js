import React, {useEffect, useState} from 'react'
import qs from 'qs'
import http from '../../../service'
import './index.css'
import {inApp, storage} from '../../../utils'
import MCard from './MCard'
import comma from '../../../image/activity/comma.png'
import {Toast} from 'antd-mobile'

const ProbabilitySignal = () => {
    const [data, setData] = useState(null)

    const getData = () => {
        http.get('/tool/signal/detail/20220711', {tool_id: 4}).then((res) => {
            if (res.code === '000000') {
                setData(res.result)
                window.ReactNativeWebView?.postMessage(
                    `data=${JSON.stringify({
                        tool_id: 4,
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
        let el = document.getElementsByClassName('AppRouter')?.[0]
        let MutationObserver = window.MutationObserver || window.webkitMutationObserver || window.MozMutationObserver
        let mutationObserver = new MutationObserver(function (mutations) {
            window.ReactNativeWebView?.postMessage(el?.scrollHeight)
        })
        mutationObserver.observe(el, {
            childList: true,
            subtree: true,
        })
        return () => {
            mutationObserver.disconnect()
        }
    }, [])

    return data ? (
        <div className="ProbabilitySignal">
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
                <MCard index_list={data.index_list} />
            </div>
            {/* 概率信号说明 */}
            <div className="cardWrap">
                <div className="cardTitle">{data.desc_info.title}</div>
                <div className="cardHint">
                    <span className="cardHintText" dangerouslySetInnerHTML={{__html: data.desc_info.content}}></span>
                    <img src={comma} className="commaImg" alt="" />
                </div>
            </div>
        </div>
    ) : null
}

export default ProbabilitySignal
