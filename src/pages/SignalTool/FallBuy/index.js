import React, {useEffect, useState} from 'react'
import qs from 'qs'
import http from '../../../service'
import './index.css'
import {inApp, storage} from '../../../utils'
import MCard from './MCard'
import comma from '../../../image/activity/comma.png'
import {Toast} from 'antd-mobile'

const FallBuy = () => {
    const [data, setData] = useState(null)

    const getData = () => {
        http.get('/tool/signal/detail/20220711', {tool_id: 2}).then((res) => {
            if (res.code === '000000') {
                setData(res.result)
                window.ReactNativeWebView?.postMessage(
                    `data=${JSON.stringify({
                        tool_id: 2,
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
        <div className="fallBuy">
            <div className="topPart">
                <div className="tagWrap">
                    {data.tags?.map?.((item, idx) => (
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
            {/* 内部回测数据 */}
            <div className="cardWrap">
                <div className="cardTitle">{data.yield_info.title}</div>
                <div className="cardHint">
                    <span className="cardHintText" dangerouslySetInnerHTML={{__html: data.yield_info.content}}></span>
                    <img src={comma} className="commaImg" alt="" />
                </div>
                {/* 持仓一年收益率 */}
                {data.yield_info && (
                    <div className="rateBackTestData">
                        <div style={{display: 'inline-block'}}>
                            <img src={data.yield_info.tip_icon} className="rateBackTestDataFlag" alt="" />
                            <div className="rateBackTestDataMain">
                                <div className="rateBackTestDataMainTop">
                                    <span className="rateBackTestDataMainTopText" style={{color: '#121D3A'}}>
                                        {data.yield_info.yield_ratio[0]}
                                    </span>
                                    <img src={data.yield_info.arrow_icon} className="rateBackTestDataArrow" alt="" />
                                    <span className="rateBackTestDataMainTopText" style={{color: '#E74949'}}>
                                        {data.yield_info.yield_ratio[1]}
                                    </span>
                                </div>
                                <div className="rateBackTestDataMainBottom">
                                    <span>不跟随信号</span>
                                    <span>跟随信号</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* table */}
                <div className="tableWrap">
                    <div className="tableLeft">
                        {[data?.yield_info?.th_list, ...(data.yield_info.td_list || [])].map((item, idx, arr) => {
                            let cellStyle = {
                                backgroundColor: idx % 2 === 0 ? '#F5F6F8' : '#fff',
                                height: '48px',
                                borderLeft: '1px solid #E9EAEF',
                            }
                            if (idx === 0) {
                                cellStyle.borderTopLeftRadius = '4px'
                                cellStyle.height = '41px'
                                cellStyle.borderTop = '1px solid #E9EAEF'
                            }
                            if (idx === arr.length - 1) {
                                cellStyle.borderBottomLeftRadius = '4px'
                                cellStyle.borderBottom = '1px solid #E9EAEF'
                            }
                            return (
                                <div
                                    className="tableLeftCell"
                                    style={cellStyle}
                                    key={idx}
                                    dangerouslySetInnerHTML={{__html: item[0]}}
                                ></div>
                            )
                        })}
                    </div>
                    <div className="tableMiddle">
                        {[data?.yield_info?.th_list, ...(data.yield_info.td_list || [])].map((item, idx, arr) => {
                            let cellStyle = {height: '48px'}
                            if (idx === 0) {
                                cellStyle.borderTopLeftRadius = '4px'
                                cellStyle.borderTopRightRadius = '4px'
                                cellStyle.height = '45px'
                                cellStyle.background = 'linear-gradient(180deg, #FDA4A4 0%, #FEE6E4 100%)'
                                cellStyle.fontWeight = 'bold'
                                cellStyle.fontSize = '12px'
                                cellStyle.lineHeight = '17px'
                            } else {
                                cellStyle.backgroundColor = idx % 2 === 0 ? '#FFE6E4' : '#fff'
                            }
                            if (idx === arr.length - 1) {
                                cellStyle.borderBottomLeftRadius = '4px'
                                cellStyle.borderBottomRightRadius = '4px'
                                cellStyle.height = '54px'
                            }
                            return (
                                <div
                                    className="tableMiddleCell"
                                    style={cellStyle}
                                    key={idx}
                                    dangerouslySetInnerHTML={{__html: item[1]}}
                                ></div>
                            )
                        })}
                    </div>
                    <div className="tableRight">
                        {[data?.yield_info?.th_list, ...(data.yield_info.td_list || [])].map((item, idx, arr) => {
                            let cellStyle = {
                                backgroundColor: idx % 2 === 0 ? '#F5F6F8' : '#fff',
                                height: '48px',
                                borderRight: '1px solid #E9EAEF',
                            }
                            if (idx === 0) {
                                cellStyle.borderTopRightRadius = '4px'
                                cellStyle.height = '41px'
                                cellStyle.fontWeight = 'bold'
                                cellStyle.borderTop = '1px solid #E9EAEF'
                            }
                            if (idx === arr.length - 1) {
                                cellStyle.borderBottomRightRadius = '4px'
                                cellStyle.borderBottom = '1px solid #E9EAEF'
                            }
                            return (
                                <div
                                    className="tableRightCell"
                                    style={cellStyle}
                                    key={idx}
                                    dangerouslySetInnerHTML={{__html: item[2]}}
                                ></div>
                            )
                        })}
                    </div>
                </div>
                {data?.yield_info.data_time && (
                    <div style={{fontSize: 11, color: '#9AA0B1', marginTop: 12}}>{data?.yield_info.data_time}</div>
                )}
            </div>
            {/* 盈利概率回测数据 */}
            <div className="cardWrap">
                <div className="cardTitle">{data.probability_info?.title}</div>
                {/* 持仓一年收益率 */}
                <div style={{textAlign: 'center'}}>
                    <img src={data.probability_info?.img} className="rateBackTestDataImg" alt="" />
                </div>
                <div style={{fontSize: 11, color: '#9AA0B1', marginTop: 12}}>{data.probability_info?.data_time}</div>
                <div
                    className="cardDesc"
                    dangerouslySetInnerHTML={{__html: data.probability_info?.content}}
                    style={{marginTop: 6}}
                ></div>
            </div>
            {/* 越跌越买信号提醒 */}
            <div className="cardWrap">
                <div className="cardTitle">{data.reminder_info.title}</div>
                <div
                    className="cardDesc"
                    style={{marginTop: '12px'}}
                    dangerouslySetInnerHTML={{__html: data.reminder_info?.content}}
                ></div>
            </div>
        </div>
    ) : null
}

export default FallBuy
