import React, {useCallback, useEffect, useMemo, useState} from 'react'
import qs from 'qs'
import http from '../../../service'
import './index.css'
import {inApp, storage} from '../../../utils'
import MCard from './MCard'
import comma from '../../../image/activity/comma.png'
import {Toast} from 'antd-mobile'

const LowBuy = () => {
    const [data, setData] = useState(null)
    const [brief, setBrief] = useState(null)
    const [reminderInfo, setReminderInfo] = useState(null)

    const reminderInfoObj = useMemo(() => {
        return reminderInfo || data?.reminder_info || {}
    }, [data, reminderInfo])

    const getData = () => {
        http.get('/tool/signal/detail/20220711', {tool_id: 3}).then((res) => {
            if (res.code === '000000') {
                setData(res.result)
                window.ReactNativeWebView?.postMessage(
                    `data=${JSON.stringify({
                        tool_id: 3,
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

    const onBrief = useCallback((val) => {
        setBrief(val)
    }, [])

    const onReminderInfo = useCallback((val) => {
        setReminderInfo(val)
    }, [])

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
        <div className="LowBuy">
            <div className="topPart">
                <div className="tagWrap">
                    {data.tags?.map((item, idx) => (
                        <div key={idx} className="tagItem">
                            {item}
                        </div>
                    ))}
                </div>
                <div className="topPartDesc">{brief || data.brief}</div>
            </div>
            <div className="mainCardWrap">
                <MCard index_list={data.index_list} onBrief={onBrief} onReminderInfo={onReminderInfo} />
            </div>
            {/* 估值信号说明 */}
            <div className="cardWrap">
                <div className="cardTitle">{reminderInfoObj.title}</div>
                <div className="cardHint">
                    <span className="cardHintText" dangerouslySetInnerHTML={{__html: reminderInfoObj.content}}></span>
                    <img src={comma} className="commaImg" alt="" />
                </div>
            </div>
        </div>
    ) : null
}

export default LowBuy
