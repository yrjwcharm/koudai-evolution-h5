import React, {useEffect, useState, useRef, useMemo, useCallback} from 'react'
import http from '../../service'
import {storage, countdownTool, resolveTimeStemp} from '../../utils'
import qs from 'qs'
import {Image, SafeArea, Swiper, DotLoading} from 'antd-mobile'
import './index.css'
import {RightOutline} from 'antd-mobile-icons'
import MyModal from './Modal'
import {Toast, SpinLoading, Mask} from 'antd-mobile'
import smallBellIcon from '../../image/icon/small-bell.png'
import comma from '../../image/activity/comma.png'
import inputBox from '../../image/activity/input-box.jpg'
import advisor from '../../image/activity/advisor.png'

const TreePlaceHolder = () => {
    return (
        <div className="treePlaceHolderContent">
            <SpinLoading color="#ffad88" />
        </div>
    )
}

const PlantTree = () => {
    const [modalVisible, updateModalVisible] = useState(false)
    const [mournModalVisible, updateMournModalVisible] = useState(false)
    const [punchRes, setPunchRes] = useState({})
    const [data, setData] = useState(null)
    const [advisorData, setAdvisorData] = useState(null)
    const modalType = useRef(null)
    const [countdown, setCountdown] = useState([])
    const [imgsLoaded, updateImgsLoaded] = useState([false, false, false, false])
    const initOnClosedModal = useRef(false)

    const inCountdown = useMemo(() => +countdown[0] || +countdown[1] || +countdown[2] || +countdown[3], [countdown])

    const mournState = useRef(Date.now() < 1647964800000).current

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
        http.get('/activities/seed_2022/index/20220301')
            .then((res) => {
                if (res.code === '000000') {
                    setData(res.result)
                    document.title = res.result.name
                    if (mournState) {
                        updateMournModalVisible(true)
                    } else if (res.result.pop) {
                        modalType.current = 'mount'
                        updateModalVisible(true)
                    }
                    toast?.close()
                } else {
                    Toast.show(res.message)
                }
            })
            .catch((err) => {
                Toast.show('网络繁忙')
                console.log(err)
            })
        // 投顾观点
        http.get('/mapi/message/list/20210101', {
            type: 'point',
            page: 1,
        })
            .then((res) => {
                if (res.code === '000000') {
                    setAdvisorData(res.result?.messages?.[0])
                } else {
                    Toast.show(res.message)
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
        window.ReactNativeWebView?.postMessage(`logParams=${JSON.stringify(['acVisit'])}`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        window.document.addEventListener('reload', init)
        return () => {
            window.document.removeEventListener('reload', init)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getInitReady])

    // 总倒计时
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

    const handlerButtonClick = () => {
        if (data?.stage_info?.button?.url) {
            return window.ReactNativeWebView?.postMessage('url=' + JSON.stringify(data?.stage_info?.button?.url))
        } else {
            window.LogTool('acCard')
            http.post('/activities/seed_2022/sign/20220301', {type: 1})
                .then((res) => {
                    if (res.code === '000000') {
                        setPunchRes(res.result)
                        modalType.current = 'punch'
                        updateModalVisible(true)
                        initOnClosedModal.current = true
                    } else {
                        Toast.show(res.message)
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        }
    }
    const handlerButton2Click = () => {
        modalType.current = 'repairCard'
        updateModalVisible(true)
    }
    const goRepairCard = () => {
        window.LogTool('acFillCard')
        http.post('/activities/seed_2022/sign/20220301', {type: 2})
            .then((res) => {
                if (res.code === '000000') {
                    setPunchRes(res.result)
                    modalType.current = 'punch'
                    initOnClosedModal.current = true
                    setTimeout(() => {
                        updateModalVisible(true)
                    }, 0)
                } else {
                    Toast.show(res.message)
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const modalChildren = useCallback(() => {
        if (!modalVisible) return null
        const genHeadIcon = (src) => {
            return <Image style={{margin: '0 auto', marginTop: '-1.2rem'}} width="1.56rem" height="1.82rem" src={src} />
        }
        const genTitle = (title) => {
            return <div className="myModalTitle">{title}</div>
        }
        const genContent = (content) => {
            return <div className="myModalText">{content}</div>
        }
        const genQuotes = (arr) => {
            return (
                <div className="quotesContent">
                    <Image src={comma} width={'0.32rem'} height="0.28rem" className="comma" />
                    <div>{arr[0]}</div>
                    <div style={{marginTop: '5px', textAlign: 'right'}}>{arr[1]}</div>
                </div>
            )
        }
        const genFillButton = ({text, onClick = () => {}, disabled = false}) => {
            return (
                <div
                    className={`myModalFillBtn ${disabled ? ' modalBtnDisable' : ''}`}
                    onClick={disabled ? () => {} : onClick}
                >
                    {text}
                </div>
            )
        }
        const genOutlineButton = ({text, onClick = () => {}}) => {
            return (
                <div className="myModalOutlineBtn" onClick={onClick}>
                    {text}
                </div>
            )
        }

        switch (modalType.current) {
            case 'mount':
                return (
                    <>
                        {genHeadIcon(smallBellIcon)}
                        {genTitle('温馨提示')}
                        {genContent(data.pop)}
                        {genFillButton({
                            text: '我知道了',
                            onClick: () => {
                                updateModalVisible(false)
                            },
                        })}
                        {genOutlineButton({
                            text: '不再提示',
                            onClick: () => {
                                updateModalVisible(false)
                                http.post('/activities/seed_2022/close_tip_pop/20220301')
                            },
                        })}
                    </>
                )
            case 'rule':
                const ruleContent = (
                    <ul className="ruleContent">
                        {data.rule?.slice(0, -1).map((item, idx) => (
                            <li key={idx} style={{marginTop: idx > 0 ? '10px' : ''}}>
                                {item}
                            </li>
                        ))}
                    </ul>
                )
                return (
                    <>
                        {genTitle('活动规则')}
                        {genContent(ruleContent)}
                        <div className="ruleSmallHint">{data.rule[data.rule.length - 1]}</div>
                        {genFillButton({
                            text: '我知道了',
                            onClick: () => {
                                updateModalVisible(false)
                            },
                        })}
                    </>
                )
            case 'punch':
                return (
                    <>
                        {punchRes.icon && genHeadIcon(punchRes.icon)}
                        {punchRes.title && genTitle(punchRes.title)}
                        {punchRes.desc && genContent(punchRes.desc)}
                        {punchRes.quotes && genQuotes(punchRes.quotes)}
                        {punchRes.button &&
                            genFillButton({
                                text: punchRes.button.text,
                                disabled: !punchRes.button.avail,
                                onClick: () => {
                                    if (punchRes.button.url)
                                        window.ReactNativeWebView?.postMessage(
                                            'url=' + JSON.stringify(punchRes.button.url),
                                        )
                                    updateModalVisible(false)
                                    init()
                                },
                            })}
                    </>
                )
            case 'repairCard':
                let repairCardRes = data.stage_info.button2_pop
                return (
                    <>
                        {repairCardRes.icon && genHeadIcon(repairCardRes.icon)}
                        {repairCardRes.title && genTitle(repairCardRes.title)}
                        {repairCardRes.desc && genContent(repairCardRes.desc)}
                        {repairCardRes.button &&
                            genFillButton({
                                text: repairCardRes.button.text,
                                disabled: !repairCardRes.button.avail,
                                onClick: () => {
                                    if (repairCardRes.button.url) {
                                        window.ReactNativeWebView?.postMessage(
                                            'url=' + JSON.stringify(repairCardRes.button.url),
                                        )
                                    } else {
                                        goRepairCard()
                                    }
                                    updateModalVisible(false)
                                },
                            })}
                        {repairCardRes.button2 &&
                            genOutlineButton({
                                text: repairCardRes.button2.text,
                                onClick: () => {
                                    if (repairCardRes.button2.url)
                                        window.ReactNativeWebView?.postMessage(
                                            'url=' + JSON.stringify(repairCardRes.button2.url),
                                        )
                                    updateModalVisible(false)
                                },
                            })}
                    </>
                )
            default:
                return null
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalVisible, data, punchRes])

    return (
        <>
            <div className={`activityContainer `} style={mournState ? {filter: 'grayscale(100%)'} : {}}>
                {data ? (
                    <>
                        <div
                            className="topPart"
                            style={{
                                backgroundImage: 'url(' + data.img_map.bg_1 + ')',
                                paddingTop: window.ReactNativeWebView ? '30px' : '20px',
                            }}
                            onLoad={() => {
                                updateImgsLoaded((val) => {
                                    let arr = [...val]
                                    arr[0] = true
                                    return arr
                                })
                            }}
                        >
                            {/* {
            window.ReactNativeWebView && JSON.parse(localStorage.getItem('loginStatus'))?.ver > '6.5.2' ? (isIOS() ? <SafeArea position='top' /> : <div style={{ height: '44px', }}></div>) : null
          } */}
                            <Image
                                src={data.img_map.title}
                                className="topPartTitle"
                                onLoad={() => {
                                    updateImgsLoaded((val) => {
                                        let arr = [...val]
                                        arr[1] = true
                                        return arr
                                    })
                                }}
                            />
                            {data?.count_down?.is_show && data.count_down.remaining_time && inCountdown ? (
                                <div className="activitiesCountdown">
                                    <div className="text">{data.count_down.desc}</div>
                                    <div className="time">{countdown[0]}</div>天
                                    <div className="time">{countdown[1]}</div>时
                                    <div className="time">{countdown[2]}</div>分
                                    <div className="time">{countdown[3]}</div>秒
                                </div>
                            ) : null}
                            {data.stage_info?.total_send_score_desc && (
                                <div className="curDistributionWrapper">
                                    <div className="curDistribution" style={{backgroundImage: 'url(' + inputBox + ')'}}>
                                        <div
                                            dangerouslySetInnerHTML={{__html: data.stage_info?.total_send_score_desc}}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {data?.stage_info?.score_progress && (
                                <div className="progress">
                                    <div
                                        className="progressTraker"
                                        style={{width: data?.stage_info?.score_progress * 100 + '%' || 0}}
                                    ></div>
                                </div>
                            )}
                            {data?.stage_info?.count_score ? (
                                <div className="progress-text">
                                    {data?.stage_info?.residual_score ? (
                                        <div>
                                            您已获得
                                            <span className="progress-text-num">{data?.stage_info?.count_score}</span>
                                            魔分，还剩
                                            <span className="progress-text-num">
                                                {data?.stage_info?.residual_score}
                                            </span>
                                            魔分待领取
                                        </div>
                                    ) : (
                                        <div>
                                            恭喜您播种完成，共获得
                                            <span className="progress-text-num">{data?.stage_info?.count_score}</span>
                                            魔分
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                        <div className="treeWrapper">
                            <Image
                                src={data.img_map?.bg_2}
                                width="100%"
                                fit="contain"
                                onLoad={() => {
                                    updateImgsLoaded((val) => {
                                        let arr = [...val]
                                        arr[2] = true
                                        return arr
                                    })
                                }}
                            />
                            <Image
                                key={data?.stage_info?.tree_img}
                                src={data.stage_info?.tree_img}
                                placeholder={<TreePlaceHolder />}
                                className="tree"
                                fit="contain"
                                onLoad={() => {
                                    updateImgsLoaded((val) => {
                                        let arr = [...val]
                                        arr[3] = true
                                        return arr
                                    })
                                }}
                            />
                            <div className="widgetWrapper">
                                <div className="inviteFriendWidget">
                                    <div className="redCircle">
                                        <div>魔分</div>
                                        <div>翻倍</div>
                                    </div>
                                    <div className="inviteFriendMain">
                                        <div
                                            className="inviteFriendBtn"
                                            onClick={() => {
                                                window.LogTool('acInvite')
                                                window.ReactNativeWebView?.postMessage(
                                                    'shareLink=' + JSON.stringify(data.share_info),
                                                )
                                            }}
                                        >
                                            邀请好友
                                        </div>
                                        <div className="existInviteNum">已邀请{data.stage_info?.invite_num}人</div>
                                    </div>
                                </div>
                                <div
                                    className="ruleWidget"
                                    onClick={() => {
                                        window.LogTool('acRule')
                                        modalType.current = 'rule'
                                        updateModalVisible(true)
                                    }}
                                >
                                    <span style={{marginLeft: '3px'}}>
                                        规则
                                        <RightOutline fontSize={11} />
                                    </span>
                                </div>
                            </div>
                            <div className="tipBox">
                                <div
                                    className="tipBoxText"
                                    dangerouslySetInnerHTML={{__html: data.stage_info?.desc}}
                                ></div>
                                {data?.stage_info?.button && (
                                    <div className="tipBoxBtn" onClick={handlerButtonClick}>
                                        {data.stage_info.button.text}
                                    </div>
                                )}
                                {data?.stage_info?.latest_sign_list && (
                                    <Swiper
                                        className="tipBoxSwiper"
                                        direction="vertical"
                                        indicator={() => null}
                                        allowTouchMove={false}
                                        autoplay
                                        loop
                                    >
                                        {data?.stage_info?.latest_sign_list?.map((item, index) => (
                                            <Swiper.Item key={index}>
                                                <div
                                                    className={'tipBoxSwiperItem'}
                                                    dangerouslySetInnerHTML={{__html: item}}
                                                ></div>
                                            </Swiper.Item>
                                        ))}
                                    </Swiper>
                                )}

                                {data?.stage_info?.button2 && (
                                    <div className="makeUpCardWrapper">
                                        <div
                                            className={`makeUpCard ${
                                                data?.stage_info?.button2?.avail ? '' : 'disable'
                                            }`}
                                            onClick={handlerButton2Click}
                                        >
                                            {data?.stage_info?.button2?.text}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {advisorData && (
                            <div style={{backgroundColor: '#FFF4EE', paddingTop: '25px'}}>
                                <div
                                    className="advisorViewWrapper"
                                    onClick={() => {
                                        window.ReactNativeWebView &&
                                            window.ReactNativeWebView?.postMessage(
                                                'url=' + JSON.stringify(advisorData?.jump_url),
                                            )
                                    }}
                                >
                                    <div className="advisorViewHeader">
                                        <Image src={advisor} className="advisorViewHeaderLogo" fit="contain" />
                                        <div className="advisorViewHeaderPublishDate">
                                            {advisorData?.post_time}&nbsp;发布
                                        </div>
                                    </div>
                                    <div className="advisorViewContent">
                                        <div className="advisorViewContentLeft">{advisorData?.title}</div>
                                        <div className="advisorViewContentRight">
                                            <RightOutline />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="instructionsWrapper">
                            <div className="instructionsTitle">相关说明/提示</div>
                            {data.risk_tip?.map((item, idx) => {
                                return (
                                    <div key={idx} className="instructionsItem" style={{marginTop: idx > 0 ? '' : ''}}>
                                        <div className="instructionsIndex">{idx + 1}</div>
                                        <div className="instructionsContent">{item}</div>
                                    </div>
                                )
                            })}
                        </div>
                        <MyModal
                            visible={modalVisible}
                            onClose={() => {
                                updateModalVisible(false)
                                if (initOnClosedModal.current) {
                                    init()
                                    initOnClosedModal.current = false
                                }
                            }}
                        >
                            <div className="myModalContent">{modalChildren()}</div>
                        </MyModal>
                    </>
                ) : null}
                {!getInitReady && (
                    <div className="beforeMask">
                        <DotLoading />
                    </div>
                )}
                <SafeArea position="bottom" style={{background: '#FFF4EE'}} />
            </div>
            <Mask visible={mournModalVisible}>
                <div
                    style={{
                        position: 'absolute',
                        top: '43%',
                        left: '50%',
                        transform: 'translate(-50%,-50%)',
                        width: '319px',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        padding: '30px 20px',
                    }}
                >
                    <div style={{textAlign: 'center'}}>
                        <div style={{fontSize: '20px', fontWeight: 600, marginBottom: '50px'}}>
                            沉重哀悼东航空难事件遇难者
                        </div>
                        <div style={{fontSize: '16px', fontWeight: 400}}>“家庭理财播种季”活动暂停1天</div>
                    </div>
                </div>
            </Mask>
        </>
    )
}

export default PlantTree
