import React, {useEffect, useState, useMemo} from 'react'
import http from '../../../service'
import {storage, resolveTimeStemp, isIOS, countdownTool} from '../../../utils'
import {Button, Carousel, Toast} from 'antd-mobile-v2'
import './index.css'
import Card from './components/Card'
import MyModal from './components/Modal'
import qs from 'qs'

const Activity2022 = () => {
    const [data, setData] = useState(null)
    const [modalVisible, updateModalVisible] = useState(false)
    const [ruleModalData, setRuleModalData] = useState({title: '', desc: []})
    const [punchData, setPunchData] = useState(null)
    const [modayType, setModalType] = useState('')
    const [signPeopleList, setSignPeopleList] = useState([])
    const [countdown, setCountdown] = useState([])
    const inCountdown = useMemo(() => +countdown[0] || +countdown[1] || +countdown[2] || +countdown[3], [countdown])
    // const [a, setA] = useState(false)

    const getData = () => {
        http.get('/activities/new_year_2020/index/20211206')
            .then((res) => {
                if (res.code === '000000') {
                    setData(res.result)
                }
                // resJS.result.count_down.remaining_time = Date.now().toString().slice(9)
                // setData(JSON.parse(JSON.stringify(resJS.result)))
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const init = () => {
        if (window.ReactNativeWebView) {
            const {timeStamp} = qs.parse(window.location.href.split('?')[1]) || {}
            if (storage.getItem('loginStatus')?.timeStamp === timeStamp) {
                getData()
                getSignPeopleList()
            } else {
                let timer = setInterval(() => {
                    if (storage.getItem('loginStatus')?.timeStamp === timeStamp) {
                        clearInterval(timer)
                        getData()
                        getSignPeopleList()
                    }
                }, 100)
            }
        } else {
            getData()
            getSignPeopleList()
        }
    }

    const getSignPeopleList = () => {
        http.get('/activities/new_year_2020/get_latest_sign_list/20211206')
            .then((res) => {
                if (res.code === '000000') {
                    setSignPeopleList(res.result)
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }

    useEffect(() => {
        init()

        // 若是在webview里 需要用webview传过来的focus
        const callback = () => {
            if (document.visibilityState === 'visible') init()
        }
        document.addEventListener('visibilitychange', callback)
        return () => document.removeEventListener('visibilitychange', callback)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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

    //总倒计时结束

    // 家庭资产配置服务
    const asset_allocation = (d) => {
        return (
            <Card
                title={d.title}
                key={d.title}
                markData={d.count_down}
                countdown={d.count_down?.is_show ? d.count_down.remaining_time : null}
                onCountdownOver={init}
            >
                <div className="configServiceContainer">
                    <div className="dateInCard">{d.desc}</div>
                    <div className="configServiceDescImg">
                        <img src={d.condition_img} alt="desc" />
                    </div>
                    <div className="talkWrap" style={{marginTop: '16px'}}>
                        <div className="talkWrapSubjectTerms" dangerouslySetInnerHTML={{__html: d.count_desc}} />
                        <div className="talkWrapText" dangerouslySetInnerHTML={{__html: d.count_tip}} />
                        <div className="talkWrapUpdateHint">{d.count_update_tip}</div>
                    </div>
                    <div className="configServiceGetNum">
                        已有<div className="emphasize">{d.now_num}</div> 人达标，限前 {d.max_num} 名
                    </div>
                </div>
            </Card>
        )
    }

    // 探索家-探索打卡
    const explorer = (d) => {
        const handlerPunch = () => {
            http.post('activities/new_year_2020/sign/20211206')
                .then((res) => {
                    if (res.code === '000000') {
                        setModalType('punch')
                        setPunchData(res.result)
                        updateModalVisible(true)
                        init()
                    } else {
                        Toast.info(res.message)
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        }

        return (
            <Card
                key={d.title}
                title={d.title}
                showRule={!!d.rule_desc}
                onRuleBtnClick={() => {
                    setModalType('rule')
                    setRuleModalData({
                        title: d.rule_title,
                        desc: d.rule_desc,
                    })
                    updateModalVisible(true)
                }}
                markData={d.count_down}
                countdown={d.count_down?.is_show ? d.count_down.remaining_time : null}
                onCountdownOver={init}
            >
                <div className="exploreContainer" style={{paddingBottom: d.all_signed ? '12px' : ''}}>
                    {d.all_signed ? (
                        <div style={{marginBottom: '16px'}}>
                            <div
                                className="exploreSignAllSubjectTerms"
                                dangerouslySetInnerHTML={{__html: d.count_desc}}
                            />
                            <div className="exploreSignAllText" dangerouslySetInnerHTML={{__html: d.count_tip}} />
                        </div>
                    ) : (
                        <>
                            {' '}
                            <div className="subjectTermsInCard" dangerouslySetInnerHTML={{__html: d.desc}} />
                            <div className="talkWrap">
                                <div
                                    className="talkWrapSubjectTerms"
                                    dangerouslySetInnerHTML={{__html: d.count_desc}}
                                />
                                <div className="talkWrapText" dangerouslySetInnerHTML={{__html: d.count_tip}} />
                            </div>
                            <div className="punchTable">
                                <div className="punchTableRow">
                                    {d?.sign_list?.slice?.(0, 5).map((item, idx) => (
                                        <div className="punchTableCell" key={idx}>
                                            <div className="cellIcon">
                                                {/* ${a ? 'cellIconImgRotateZ' : ''} */}
                                                <img
                                                    className={`cellIconImg`}
                                                    src={
                                                        +item.type === 2
                                                            ? d.sign_img_list[0]
                                                            : +item.type === 1 && item.is_signed
                                                            ? d.sign_img_list[2]
                                                            : d.sign_img_list[1]
                                                        // a ? d.sign_img_list[1] : d.sign_img_list[2]
                                                    }
                                                    alt="icon"
                                                />
                                            </div>
                                            {!item.is_signed && (
                                                <div
                                                    className="beforeScore"
                                                    dangerouslySetInnerHTML={{__html: item.desc}}
                                                />
                                            )}
                                            {
                                                <div
                                                    className={item.is_signed ? 'afterScore' : 'multiple'}
                                                    dangerouslySetInnerHTML={{__html: item.tip}}
                                                />
                                            }
                                        </div>
                                    ))}
                                </div>
                                <div className="punchTableRow">
                                    {d?.sign_list?.slice?.(5).map((item, idx) => (
                                        <div className="punchTableCell" key={idx}>
                                            <div className="cellIcon">
                                                <img
                                                    className="cellIconImg"
                                                    src={
                                                        +item.type === 2
                                                            ? d.sign_img_list[0]
                                                            : +item.type === 1 && item.is_signed
                                                            ? d.sign_img_list[2]
                                                            : d.sign_img_list[1]
                                                    }
                                                    alt="icon"
                                                />
                                            </div>
                                            {!item.is_signed && (
                                                <div
                                                    className="beforeScore"
                                                    dangerouslySetInnerHTML={{__html: item.desc}}
                                                />
                                            )}
                                            {
                                                <div
                                                    className={item.is_signed ? 'afterScore' : 'multiple'}
                                                    dangerouslySetInnerHTML={{__html: item.tip}}
                                                />
                                            }
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="exploreBtnContainer">
                        <div
                            className="exploreBtn"
                            onClick={() => {
                                if (d.button.url) {
                                    // 跳转
                                    window.ReactNativeWebView &&
                                        window.ReactNativeWebView.postMessage(`url=${JSON.stringify(d.button.url)}`)
                                } else {
                                    // 打卡
                                    // setA(val => !val)
                                    // setTimeout(() => {
                                    //   setA(val => !val)
                                    // }, 300);
                                    handlerPunch()
                                }
                            }}
                        >
                            {d.button.text}
                        </div>
                    </div>
                    {/* 爆红是因为内部ts注解不规范 */}
                    {!d.all_signed && signPeopleList[0] && (
                        <Carousel
                            className="carousel-hint"
                            vertical
                            dots={false}
                            dragging={false}
                            swiping={false}
                            autoplay
                            infinite
                            speed={600}
                            autoplayInterval={5000}
                            resetAutoplay={false}
                        >
                            {signPeopleList?.map?.((item) => (
                                <div className="v-item" dangerouslySetInnerHTML={{__html: item}} key={item} />
                            ))}
                        </Carousel>
                    )}
                </div>
            </Card>
        )
    }

    // 理财家-理财优惠
    const financial = (d) => {
        return (
            <Card
                key={d.title}
                title={d.title}
                markData={d.count_down}
                countdown={d.count_down?.is_show ? d.count_down.remaining_time : null}
                onCountdownOver={init}
            >
                <div className="financingContainer">
                    <div className="dateInCard" style={{marginTop: '12px'}}>
                        {d.desc}
                    </div>
                    <div className="subjectTermsInCard" dangerouslySetInnerHTML={{__html: d.fee_desc}} />
                    <div className="talkWrap">
                        <div className="talkWrapSubjectTerms" dangerouslySetInnerHTML={{__html: d.count_desc}} />
                        <div className="talkWrapText" dangerouslySetInnerHTML={{__html: d.count_tip}} />
                    </div>
                    <div className="financingHint">{d.tip}</div>
                </div>
            </Card>
        )
    }

    // 财富家-财富冲榜
    const wealth_manager = (d) => {
        return (
            <Card
                title={d.title}
                showRule
                key={d.title}
                onRuleBtnClick={() => {
                    setModalType('rule')
                    setRuleModalData({
                        title: d.rule_title,
                        desc: d.rule_desc,
                    })
                    updateModalVisible(true)
                }}
                markData={d.count_down}
                countdown={d.count_down?.is_show ? d.count_down.remaining_time : null}
                onCountdownOver={init}
            >
                <div className="wealthContainer">
                    <div className="dateInCard">{d.desc}</div>
                    <div className="talkWrap" style={{marginTop: '16px'}}>
                        <div className="talkWrapSubjectTerms" dangerouslySetInnerHTML={{__html: d.count_desc}} />
                        <div className="talkWrapText" dangerouslySetInnerHTML={{__html: d.count_tip}} />
                        <div className="talkWrapUpdateHint">{d.count_update_tip}</div>
                    </div>
                    <div className="rankingTable">
                        <div className="rankingDesc">{d.rank_th}</div>
                        <div className="rankingTableMain">
                            <div className="rangkingHeader">
                                <div className="rangkingLeftCol">排名</div>
                                <div className="rangkingRightCol">福利</div>
                            </div>
                            {Object.entries(d.tank_tdo).map(([k, v], idx) => (
                                <div className="rangkingRow" key={k}>
                                    <div className="rangkingLeftCol">
                                        {idx < 3 ? <img src={d.rank_img_list?.[idx]} alt="level" /> : k}
                                    </div>
                                    <div className="rangkingRightCol" dangerouslySetInnerHTML={{__html: v}} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        )
    }

    // card map
    const stageMap = {
        asset_allocation: asset_allocation,
        explorer: explorer,
        financial: financial,
        wealth_manager: wealth_manager,
    }

    // 打卡中内容
    const punchingContent = () => {
        return (
            <div className="punchingContent">
                <div className="avatar">
                    <img src={punchData?.avatar} alt="avatar" />
                </div>
                {punchData?.title && (
                    <div className="punchingSubject" dangerouslySetInnerHTML={{__html: punchData?.title}} />
                )}

                {punchData?.desc && (
                    <div className="punchingSubtopict" dangerouslySetInnerHTML={{__html: punchData?.desc}} />
                )}

                {punchData?.copy && (
                    <div className="punchingHint">
                        <img
                            src="https://static.licaimofang.com/wp-content/uploads/2021/12/desc_ee.png"
                            alt="提示"
                            className="leftComma"
                        />
                        <img
                            src="https://static.licaimofang.com/wp-content/uploads/2021/12/desc_ff.png"
                            alt="提示"
                            className="rightComma"
                        />
                        <span dangerouslySetInnerHTML={{__html: punchData?.copy}} />
                    </div>
                )}

                <div className="puchingBtnWrap">
                    <div
                        className="topBtn"
                        onClick={() => {
                            window.ReactNativeWebView &&
                                window.ReactNativeWebView.postMessage(`url=${JSON.stringify(punchData?.button2?.url)}`)
                        }}
                    >
                        {punchData?.button2?.text}
                    </div>
                    {punchData?.button && (
                        <div
                            className="bottomBtn"
                            onClick={() => {
                                updateModalVisible(false)
                            }}
                        ></div>
                    )}
                </div>
            </div>
        )
    }
    // 规则内容
    const ruleContent = () => {
        return (
            <div className="ruleContent">
                <div className="title" dangerouslySetInnerHTML={{__html: ruleModalData?.title}} />
                <div className="content">
                    <ul>
                        {ruleModalData?.desc?.map((item, idx) => (
                            <li key={idx} dangerouslySetInnerHTML={{__html: item}} />
                        ))}
                    </ul>
                </div>
                <div className="puchingBtnWrap">
                    <div
                        className="topBtn"
                        onClick={() => {
                            updateModalVisible(false)
                        }}
                    >
                        我知道了
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`activityContainer ${isIOS ? ' ios' : ''}`} style={data ? {opacity: 1} : {}}>
            {data ? (
                <>
                    <div className="activityMainTop" style={{backgroundImage: `url(${data.background_img})`}}>
                        <div></div>
                        {data?.count_down?.is_show && data.count_down.remaining_time && inCountdown ? (
                            <div className="activitiesCountdown">
                                <div className="text">{data.count_down.desc}</div>
                                <div className="time">{countdown[0]}</div>天<div className="time">{countdown[1]}</div>时
                                <div className="time">{countdown[2]}</div>分<div className="time">{countdown[3]}</div>秒
                            </div>
                        ) : null}
                        <div className="mainTopCenterImageWrap">
                            <img className="mainTopCenterImage" src={data.people_img} alt="img" />
                        </div>
                        <div className="stageAll">
                            {data.stage_start_desc_list.map((item) => (
                                <div className={`stageItem ${item.is_started && 'current'}`} key={item.title}>
                                    <div className="stageItemTop">{item.title}</div>
                                    <div className="stageItemBottom">{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="activityCardWrap">
                        {data.stage_list.map((item) => {
                            return stageMap[item.type](item)
                        })}
                    </div>
                    <div className="riskWarning" dangerouslySetInnerHTML={{__html: data.risk_tip}} />
                    {data.bottom_button && (
                        <div className={`fixedBtnContainer${isIOS() ? ' ios' : ''}`}>
                            <Button
                                type="warning"
                                className="fixBtn"
                                onClick={() => {
                                    if (data.bottom_button.url) {
                                        // 跳转
                                        window.ReactNativeWebView &&
                                            window.ReactNativeWebView.postMessage(
                                                `url=${JSON.stringify(data.bottom_button.url)}`,
                                            )
                                    }
                                }}
                            >
                                {data.bottom_button.text}
                            </Button>
                        </div>
                    )}

                    <MyModal
                        visible={modalVisible}
                        onClose={() => {
                            updateModalVisible(false)
                        }}
                    >
                        {modayType === 'rule' ? ruleContent() : punchingContent()}
                    </MyModal>
                </>
            ) : null}
        </div>
    )
}
export default Activity2022
