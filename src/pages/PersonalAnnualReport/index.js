import React, {useEffect, useMemo, useState} from 'react'
import {Swiper, SafeArea, Toast} from 'antd-mobile'
import './index.css'
import slideIcon from '../../image/icon/slideIcon.gif'
import reportLogo from '../../image/icon/reportLogo.png'
import btnHint from '../../image/icon/btnHint.png'
import {isIOS, storage} from '../../utils'
import http from '../../service'
import qs from 'qs'
import firstBgImg from './bg1.jpg'
import secondBgImg from './bg2.jpg'

const clientHeight = document.body.clientHeight

let webViewTitle = ''
const PersonalAnnualReport = () => {
    const [curIndex, setIndex] = useState(null)
    const [data, setData] = useState([])

    const LONG_PAGE_INDEX = useMemo(() => (data.length ? data.length - 1 : null), [data.length])

    const [start, setStart] = useState(null)

    const [scrollTopInLongPage, setScrollTopInLongPage] = useState(null)

    const [topStateInLongPage, setTopStateInLongPage] = useState(false)

    const [longPageTopImgLoaded, setLongPageTopImgLoaded] = useState(false)
    const [longPageBottomImgLoaded, setLongPageBottomImgLoaded] = useState(false)

    const [receivePointLoading, setReceivePointLoading] = useState(false)

    useEffect(() => {
        // 处理滑动
        const handlerScroll = (e) => {
            e.preventDefault()
        }
        document.addEventListener('touchmove', handlerScroll, {passive: false})

        return () => document.removeEventListener('touchmove', handlerScroll)
    }, [])

    useEffect(() => {
        document.title = '2021年度理财报告'
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const init = () => {
        if (window.ReactNativeWebView) {
            const {timeStamp} = qs.parse(window.location.href.split('?')[1]) || {}
            if (storage.getItem('loginStatus')?.timeStamp === timeStamp) {
                getData()
            } else {
                let timer = setInterval(() => {
                    if (storage.getItem('loginStatus')?.timeStamp === timeStamp) {
                        clearInterval(timer)
                        getData()
                    }
                }, 100)
            }
        } else {
            getData()
        }
    }

    const getData = (afterHandler) => {
        http.get('/report/annual/detail/20220106', {}, null)
            .then((res) => {
                if (res.code === '000000') {
                    setData(res.result)
                    setIndex(0)
                } else {
                    Toast.show(res.message || '网络繁忙')
                }
                afterHandler?.(res)
            })
            .catch((err) => {
                Toast.show('网络繁忙')
            })
    }

    const receivePoint = (index) => {
        setReceivePointLoading(true)
        http.post('/report/annual/share_marks/20220109').then((res) => {
            if (res.result?.error === 0) {
                const afterHandler = (data) => {
                    setReceivePointLoading(false)
                    if (data.code === '000000') setIndex(index || 0)
                }
                getData(afterHandler)
            } else {
                res.result?.content && Toast.show(res.result.content)
                setReceivePointLoading(false)
            }
        })
    }

    return (
        <div
            className="PersonalAnnualReport"
            style={
                data[0]
                    ? {}
                    : {
                          opacity: '0.5',
                          backgroundColor: '#f9edd6',
                      }
            }
        >
            <Swiper
                direction="vertical"
                indicator={() => null}
                style={{'--height': clientHeight + 'px'}}
                rubberband={false}
                onIndexChange={(index) => {
                    if (index === LONG_PAGE_INDEX) {
                        window.LogTool('PersonalReportFinish')
                        setTopStateInLongPage(false)
                    }
                    setIndex(index)
                }}
            >
                {data.map((item, index) => (
                    <Swiper.Item key={`slide${index}`}>
                        <div
                            style={{
                                height: '100%',
                                overflow: index === LONG_PAGE_INDEX && !topStateInLongPage ? 'auto' : 'inherit',
                            }}
                            onScroll={(evt) => {
                                const scrollTop = evt.target.scrollTop
                                setScrollTopInLongPage(scrollTop)

                                const message = scrollTop > 0 ? 'hideTitle' : 'showTitle'
                                if (window.ReactNativeWebView && webViewTitle !== message) {
                                    webViewTitle = message
                                    window.ReactNativeWebView.postMessage(message)
                                }
                            }}
                        >
                            <div
                                className="reportMain"
                                style={{
                                    backgroundImage:
                                        'url(' + ([firstBgImg, secondBgImg][index] || item.background) + ')',
                                    backgroundPosition: index === LONG_PAGE_INDEX ? 'top' : 'bottom',
                                    backgroundSize: index === LONG_PAGE_INDEX ? '100% 100%' : '100%',
                                    height: index === LONG_PAGE_INDEX ? '32rem' : '100%',
                                }}
                                onTouchStart={(e) => {
                                    setStart(e.changedTouches[0].clientY)
                                }}
                                onTouchMove={(e) => {
                                    let end = e.changedTouches[0].clientY
                                    let cs = end - start > 0 && scrollTopInLongPage <= 0
                                    setTopStateInLongPage(cs)
                                    if (index === LONG_PAGE_INDEX && !cs) {
                                        e.stopPropagation()
                                    }
                                }}
                            >
                                {/* 安全区域 */}
                                <SafeArea position="top" />
                                {/* 自写导航栏高度 */}
                                {window.ReactNativeWebView && (
                                    <div style={{height: `${0.8 + (isIOS() ? 0 : 0.8)}rem`, width: '100%'}}></div>
                                )}
                                {/* 主内容 */}
                                <div style={{flex: 1}}>
                                    {index === LONG_PAGE_INDEX ? (
                                        <div className="longPageContainer">
                                            <div
                                                className="longPageTop"
                                                style={longPageTopImgLoaded ? {} : {display: 'none'}}
                                            >
                                                <img
                                                    alt=""
                                                    src={item.keyword}
                                                    className="longPageTopImg"
                                                    onLoad={() => {
                                                        setLongPageTopImgLoaded(true)
                                                    }}
                                                />
                                                <div className="longPageUserInfo">
                                                    <img alt="" className="longPageAvatar" src={item.avatar} />
                                                    <div className="longPageText">
                                                        <div className="longPageName">{item.nick_name}</div>
                                                        <div
                                                            className="longPageDesc"
                                                            dangerouslySetInnerHTML={{__html: item.holding_days}}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <img className="longPageTopQRCode" alt="" src={item.qr_code} />
                                                <div className="longPageTopBtns">
                                                    <div
                                                        className="longPageTopBtn shareImg"
                                                        onClick={() => {
                                                            window.ReactNativeWebView &&
                                                                window.ReactNativeWebView.postMessage(`shareImg`)
                                                        }}
                                                    >
                                                        分享图片
                                                    </div>
                                                    <div
                                                        className="longPageTopBtn shareApp"
                                                        onClick={() => {
                                                            window.ReactNativeWebView &&
                                                                window.ReactNativeWebView.postMessage(`shareApp`)
                                                        }}
                                                    >
                                                        <img alt="" src={btnHint} className="btnHint" />
                                                        分享理财魔方
                                                    </div>
                                                </div>
                                            </div>
                                            {longPageTopImgLoaded && (
                                                <div
                                                    className="longPageBottom"
                                                    style={longPageBottomImgLoaded ? {} : {display: 'none'}}
                                                >
                                                    <img
                                                        alt=""
                                                        src={item.rules}
                                                        className="longPageBottomImg"
                                                        onLoad={() => {
                                                            setLongPageBottomImgLoaded(true)
                                                        }}
                                                    />
                                                    <div className="longPageBottomBtnContainer">
                                                        <div
                                                            className="longPageBottomBtn"
                                                            onClick={() => {
                                                                window.ReactNativeWebView &&
                                                                    window.ReactNativeWebView.postMessage(
                                                                        `jump=${JSON.stringify(item.record_btn.url)}`,
                                                                    )
                                                            }}
                                                        >
                                                            查看红包获取记录
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="notLongContent">
                                            <div
                                                style={{
                                                    transition:
                                                        index && index === curIndex ? 'all 1.5s linear 0.5s' : '',
                                                    opacity: +(index === curIndex),
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <div dangerouslySetInnerHTML={{__html: item.content}}></div>
                                                {item.tip_contents ? (
                                                    <div className="getPoint">
                                                        <div className="getPointHint">
                                                            <div className="getPointHintBg"></div>
                                                            <span>{item.tips}</span>
                                                            <div
                                                                className={`getPointHintBtn ${
                                                                    item.button.can_click ? 'notGetPoint' : 'gotPoint'
                                                                }`}
                                                                onClick={() => {
                                                                    item.button.can_click &&
                                                                        !receivePointLoading &&
                                                                        receivePoint(index)
                                                                }}
                                                            >
                                                                {item.button.text}
                                                            </div>
                                                        </div>
                                                        <div className="getPointContent">
                                                            <Swiper
                                                                key="getPointContent"
                                                                direction="vertical"
                                                                style={{'--height': '17px'}}
                                                                allowTouchMove={false}
                                                                autoplay
                                                                loop
                                                                indicator={() => null}
                                                            >
                                                                {item.tip_contents.map((tip, idx) => (
                                                                    <Swiper.Item key={`point${idx}`}>{tip}</Swiper.Item>
                                                                ))}
                                                            </Swiper>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                            <div className="slideIcon">
                                                <img src={slideIcon} alt="向上滑动" className="slideIconImg" />
                                                <div style={{marginTop: '10px'}}>向上滑动</div>
                                            </div>
                                            <div className="logoIcon">
                                                <img src={reportLogo} alt="logo" className="reportLogoImg" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Swiper.Item>
                ))}
            </Swiper>
            {/* 安全区域底部 */}
            <SafeArea position="bottom" className="safearea" />
        </div>
    )
}

export default PersonalAnnualReport
