import React, {useEffect, useMemo, useState} from 'react'
import './index.css'
import {storage, countdownTool, resolveTimeStemp} from '../../utils'
import http from '../../service'
import qs from 'qs'
import {Toast, DotLoading, Image} from 'antd-mobile'

const FeeDiscount = () => {
    const [data, setData] = useState(null)
    const [countdown, setCountdown] = useState([])
    const [imgsLoaded, updateImgsLoaded] = useState([false, false, false, false, false, false])

    const inCountdown = useMemo(() => +countdown[0] || +countdown[1] || +countdown[2] || +countdown[3], [countdown])

    const getInitReady = useMemo(() => {
        return !!data && imgsLoaded.every((item) => item)
    }, [data, imgsLoaded])

    const getData = () => {
        let toast = null
        if (getInitReady) {
            toast = Toast.show({
                icon: 'loading',
                content: '加载中',
                maskClickable: false,
            })
        }
        http.get('/activities/feediscount/getconf/20220513?PR=PR-770')
            .then((res) => {
                if (res.code === '000000') {
                    setData(res.result)
                    toast?.close()
                } else {
                    Toast.show(res.message || '网络繁忙')
                }
            })
            .catch((err) => {
                Toast.show('网络繁忙')
                console.log(err)
            })
    }

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

    useEffect(() => {
        init()
        window.ReactNativeWebView &&
            window.ReactNativeWebView?.postMessage(`logParams=${JSON.stringify(['dgzzzh_ldy'])}`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        let cancel = () => {}
        if (data?.count_down?.is_show && data?.count_down?.remaining_time) {
            cancel = countdownTool({
                timeStemp: +data.count_down.remaining_time,
                immediate: true,
                callback: (resetTime) => {
                    let c = resolveTimeStemp(+resetTime)
                    setCountdown(c)
                },
            })
        }
        return cancel
    }, [data?.count_down?.is_show, data?.count_down?.remaining_time])

    return (
        <div className={`feeDiscountContainer`} style={{paddingBottom: '100px'}}>
            {data ? (
                <>
                    <div className="topPart">
                        <Image
                            src={data?.img_list?.[0]}
                            fit="contain"
                            width="100%"
                            onLoad={() => {
                                updateImgsLoaded((val) => {
                                    let arr = [...val]
                                    arr[0] = true
                                    return arr
                                })
                            }}
                        ></Image>
                        {
                            <div className="activitiesCountdown">
                                {data?.count_down?.is_show && data.count_down.remaining_time && inCountdown ? (
                                    <>
                                        <div className="text">{data.count_down.desc}</div>
                                        <div className="time">{countdown[0]}</div>天
                                        <div className="time">{countdown[1]}</div>时
                                        <div className="time">{countdown[2]}</div>分
                                        <div className="time">{countdown[3]}</div>秒
                                    </>
                                ) : (
                                    <span className="activitiesHint">{data.time_period}</span>
                                )}
                            </div>
                        }
                    </div>
                    <Image
                        src={data?.img_list?.[1]}
                        fit="contain"
                        onLoad={() => {
                            updateImgsLoaded((val) => {
                                let arr = [...val]
                                arr[1] = true
                                return arr
                            })
                        }}
                    ></Image>
                    <Image
                        src={data?.img_list?.[2]}
                        fit="contain"
                        onLoad={() => {
                            updateImgsLoaded((val) => {
                                let arr = [...val]
                                arr[2] = true
                                return arr
                            })
                        }}
                    ></Image>
                    <Image
                        src={data?.img_list?.[3]}
                        fit="contain"
                        onLoad={() => {
                            updateImgsLoaded((val) => {
                                let arr = [...val]
                                arr[3] = true
                                return arr
                            })
                        }}
                    ></Image>
                    <Image
                        src={data?.img_list?.[4]}
                        fit="contain"
                        onLoad={() => {
                            updateImgsLoaded((val) => {
                                let arr = [...val]
                                arr[4] = true
                                return arr
                            })
                        }}
                    ></Image>
                    <div className="btnImgWrap">
                        <Image
                            src={data?.img_btn}
                            fit="contain"
                            onLoad={(e) => {
                                updateImgsLoaded((val) => {
                                    let arr = [...val]
                                    arr[5] = true
                                    return arr
                                })
                            }}
                            onClick={() => {
                                window.ReactNativeWebView &&
                                    window.ReactNativeWebView?.postMessage(
                                        `logParams=${JSON.stringify(['dgzzzh_button'])}`,
                                    )
                                if (
                                    data?.count_down?.is_show &&
                                    (data.count_down.remaining_time <= 0 || !inCountdown)
                                ) {
                                    Toast.show('活动已结束')
                                } else {
                                    window.ReactNativeWebView &&
                                        window.ReactNativeWebView.postMessage(`url=${JSON.stringify(data.btn)}`)
                                }
                            }}
                        ></Image>
                    </div>
                </>
            ) : null}
            {!getInitReady && (
                <div className="beforeMask">
                    <DotLoading />
                </div>
            )}
        </div>
    )
}

export default FeeDiscount
