import React, {useEffect, useMemo, useState, useRef} from 'react'
import './index.css'
import {storage, countdownTool, resolveTimeStemp} from '../../utils'
import http from '../../service'
import qs from 'qs'
import {SafeArea, Toast, DotLoading, Image, Mask} from 'antd-mobile'
import {RightOutline, CheckOutline} from 'antd-mobile-icons'
import operate2SubtitleLeft from '../../image/activity/operate2-subtitle-left.png'
import operate2SubtitleRight from '../../image/activity/operate2-subtitle-right.png'
import operate2ModalLeft from '../../image/activity/operate2-modal-left.png'
import operate2ModalRight from '../../image/activity/operate2-modal-right.png'
import close from '../../image/activity/close.png'
import checkIcon from '../../image/activity/operate1-check-icon.png'

const QaAct = () => {
    const [data, setData] = useState(null)
    const [countdown, setCountdown] = useState([])
    const [imgsLoaded, updateImgsLoaded] = useState([false, false, false])
    const [modalVisible, updateModalVisible] = useState(false)
    const [checked, setChecked] = useState([])

    const submitting = useRef(false)

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
        http.get('/activities/operation/index/20220331')
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
            window.ReactNativeWebView?.postMessage(`logParams=${JSON.stringify(['AutomationActivityVisit'])}`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        window.document.addEventListener('reload', init)
        return () => {
            window.document.removeEventListener('reload', init)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getInitReady])

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

    const submit = () => {
        if (data.activity_type === 2) {
            if (data.activity?.tips) {
                // 有tips代表已完成
                window.ReactNativeWebView &&
                    window.ReactNativeWebView?.postMessage('url=' + JSON.stringify(data.activity?.button?.url))
            } else {
                if (!checked.includes(true)) return Toast.show('请勾选答案')
                if (submitting.current) return
                submitting.current = true
                http.get('/activities/operation/answer/20220406', {type: data.type})
                    .then((res) => {
                        if (res.code === '000000') {
                            Toast.show('提交成功')
                            setTimeout(() => {
                                init()
                            }, 500)
                        } else {
                            Toast.show(res.message || '提交失败')
                        }
                    })
                    .finally((_) => {
                        submitting.current = false
                    })
            }
        } else {
            window.ReactNativeWebView &&
                window.ReactNativeWebView?.postMessage('url=' + JSON.stringify(data.activity?.button?.url))
        }
        // 埋点
        window.ReactNativeWebView &&
            window.ReactNativeWebView?.postMessage(
                `logParams=${JSON.stringify(['AutomationActivityButton', data?.activity?.button?.text])}`,
            )
    }

    return (
        <div className={`qaActContainer `}>
            {data ? (
                <>
                    <div className="part1">
                        <Image
                            src={data.head_img?.[1]}
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
                        <Image
                            src={data.title}
                            fit="contain"
                            className="part1Title"
                            onLoad={() => {
                                updateImgsLoaded((val) => {
                                    let arr = [...val]
                                    arr[1] = true
                                    return arr
                                })
                            }}
                        ></Image>
                    </div>
                    <div className="part2">
                        <div className="part2Subtitle">
                            <Image src={operate2SubtitleLeft} fit="contain" className="part2SubtitleImg"></Image>
                            <div className="part2SubtitleText">
                                <span style={{marginLeft: '5px'}}>{data.sub_title?.[0]}</span>
                                <span style={{marginLeft: '5px'}}>{data.sub_title?.[1]}</span>
                            </div>
                            <Image src={operate2SubtitleRight} fit="contain" className="part2SubtitleImg"></Image>
                        </div>
                        <Image
                            src={data.head_img?.[0]}
                            fit="contain"
                            width="100%"
                            onLoad={() => {
                                updateImgsLoaded((val) => {
                                    let arr = [...val]
                                    arr[2] = true
                                    return arr
                                })
                            }}
                        ></Image>
                        {data?.count_down?.is_show && data.count_down.remaining_time && inCountdown ? (
                            <div className="activitiesCountdownOfArticle">
                                <div className="text">{data.count_down.desc}</div>
                                <div className="time">{countdown[0]}</div>天<div className="time">{countdown[1]}</div>时
                                <div className="time">{countdown[2]}</div>分<div className="time">{countdown[3]}</div>秒
                            </div>
                        ) : null}
                    </div>
                    <div className="part3">
                        <div className="articleCard">
                            <div className="articleCardHeader">
                                <div className="articleCardNecktie">{data.activity?.title}</div>
                                <div
                                    className="articleCardRuler"
                                    onClick={() => {
                                        updateModalVisible(true)
                                        window.ReactNativeWebView &&
                                            window.ReactNativeWebView?.postMessage(
                                                `logParams=${JSON.stringify(['AutomationActivityRule'])}`,
                                            )
                                    }}
                                >
                                    规则
                                    <RightOutline fontSize={11} />
                                </div>
                            </div>
                            <div className="articleCardContent">
                                <span dangerouslySetInnerHTML={{__html: data.activity?.content}}></span>
                                {data.activity?.tips && <div className="rewardHint">{data.activity?.tips}</div>}
                            </div>
                            {!data.activity?.tips ? (
                                <>
                                    {data.activity_type === 2 ? (
                                        <div className="articleCardChecks">
                                            <div className="articleCardChecksQA">
                                                {data.activity?.questions?.question_content}
                                            </div>
                                            {data.activity?.questions?.options.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="articleCardChecksAS"
                                                    onClick={() => {
                                                        setChecked((val) => {
                                                            let newVal = [...val]
                                                            newVal[idx] = !newVal[idx]
                                                            return newVal
                                                        })
                                                    }}
                                                >
                                                    <div className="checkStateWrapper">
                                                        <div
                                                            className="checkState"
                                                            style={
                                                                checked[idx]
                                                                    ? {backgroundColor: '#EB3F2C', border: 0}
                                                                    : {}
                                                            }
                                                        >
                                                            {checked[idx] && (
                                                                <CheckOutline color="#fff" fontSize={'11px'} />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="checkText">{item}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="articleCardCheck">
                                            {new Array(data.activity?.all_count).fill('').map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`checkBox ${
                                                        idx < data.activity?.finish_count ? 'checked' : ''
                                                    }`}
                                                    style={{marginLeft: idx > 0 ? '4px' : ''}}
                                                >
                                                    {idx < data.activity?.finish_count && (
                                                        <Image src={checkIcon} fit="contain" className="checkIcon" />
                                                    )}
                                                </div>
                                            ))}
                                            <div className="checkDesc">
                                                已完成{data.activity?.finish_count}/{data.activity?.all_count}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : null}
                            {data?.activity?.button && (
                                <div className="articleCardBtn" onClick={submit}>
                                    {data?.activity?.button?.text}
                                </div>
                            )}
                        </div>
                        <div className="hintWrapper">
                            <div className="hintHeader">{data?.instructions.title}</div>
                            <div className="hintContent">{data?.instructions.risk_tips}</div>
                        </div>
                    </div>
                    <Mask
                        visible={modalVisible}
                        onMaskClick={() => {
                            updateModalVisible(false)
                        }}
                    >
                        <div className="modalContainer">
                            <img
                                className="closeIcon"
                                alt="close"
                                src={close}
                                onClick={() => {
                                    updateModalVisible(false)
                                }}
                            />
                            <div className="modalHeader">
                                <Image src={operate2ModalRight} fit="contain" className="part2SubtitleImg"></Image>
                                <div className="modalHeaderText">{data.rules?.title}</div>
                                <Image src={operate2ModalLeft} fit="contain" className="part2SubtitleImg"></Image>
                            </div>
                            <div className="modalContent">
                                <ul>
                                    {data.rules?.contents?.map((item, idx) => {
                                        return (
                                            <li key={idx} style={{marginTop: idx > 0 ? '8px' : ''}}>
                                                <span style={{color: '#121d3a'}}>{item}</span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                            <div
                                className="modalBtn"
                                onClick={() => {
                                    updateModalVisible(false)
                                }}
                            >
                                我知道了
                            </div>
                        </div>
                    </Mask>
                </>
            ) : null}
            {!getInitReady && (
                <div className="beforeMask">
                    <DotLoading />
                </div>
            )}
            <SafeArea position="bottom" style={{background: '#D92222'}} />
        </div>
    )
}

export default QaAct
