import React, {useEffect, useState} from 'react'
import {Button, Loading} from 'antd-mobile'
import {
    Player,
    ControlBar,
    BigPlayButton,
    ProgressControl,
    DurationDisplay,
    PlayToggle, // PlayToggle 播放/暂停按钮 若需禁止加 disabled
    CurrentTimeDisplay,
    TimeDivider,
} from 'video-react'
import qs from 'qs'
// import titleDecoLeft from '../../image/icon/titleDecoLeft.png'
// import titleDecoRight from '../../image/icon/titleDecoRight.png'
import http from '../../service'
import {countdownTool, getIsWxClient, isIOS, resolveTimeStemp, storage} from '../../utils'
import './index.css'
import '../../../node_modules/video-react/dist/video-react.css' // import css

const BlancedPortfolio = () => {
    const [data, setData] = useState({})
    const [countdown, setCountdown] = useState([])

    const logtool = (params) => {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(`logParams=${JSON.stringify(params)}`)
    }

    const jump = (url) => {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(`url=${JSON.stringify(url)}`)
    }

    useEffect(() => {
        logtool(['Blanced_Portfolio_ldy'])
        let cancel, timer
        const getData = () => {
            http.get('/activities/balance/index/20220616', {})
                .then((res) => {
                    if (res.code === '000000') {
                        document.title = res.result.title || '股债平衡组合'
                        if (res.result.count_down) {
                            cancel = countdownTool({
                                timeStemp: +res.result.count_down,
                                immediate: true,
                                callback: (resetTime) => {
                                    const c = resolveTimeStemp(+resetTime)
                                    setCountdown(c)
                                },
                            })
                        }
                        setData(res.result)
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        }
        if (window.ReactNativeWebView) {
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
            cancel && cancel()
            timer && clearInterval(timer)
        }
    }, [])

    return (
        <div className="blancedPortfolio">
            {Object.keys(data).length > 0 ? (
                <>
                    <div className="content">
                        <img src={data.top_img} alt="" />
                        {data.count_down > 0 ? (
                            <div className="defaultFlex timePosition countdownBox">
                                <span style={{fontWeight: 500}}>结束倒计时</span>
                                <span className="countdownNumBox" style={{marginLeft: '.16rem'}}>
                                    {countdown[0]}
                                </span>
                                天<span className="countdownNumBox">{countdown[1]}</span>时
                                <span className="countdownNumBox">{countdown[2]}</span>分
                                <span className="countdownNumBox">{countdown[3]}</span>秒
                            </div>
                        ) : (
                            <div className="timePosition rangeTime">
                                {data.start_at}—{data.end_at}
                            </div>
                        )}
                        {data.video?.url ? (
                            <>
                                <div className="flexCenter title">
                                    {/*<img src={titleDecoLeft} alt="" />*/}
                                    {/*<span>*/}
                                    {/*    大咖<span style={{ color: "#E74949" }}>“新”</span>推官{" "}*/}
                                    {/*  </span>*/}
                                    {/*<img src={titleDecoRight} alt="" />*/}
                                    <img
                                        src="https://static.licaimofang.com/wp-content/uploads/2022/06/balance3002.png"
                                        alt=""
                                    />
                                </div>
                                <div className="videoContainer">
                                    {isIOS() && getIsWxClient() && !window.ReactNativeWebView ? (
                                        <video
                                            width="100%"
                                            playsInline={true}
                                            controls
                                            poster={data.video.cover}
                                            src={data.video.url}
                                        ></video>
                                    ) : (
                                        <Player playsInline={true} poster={data.video.cover}>
                                            <source src={data.video.url} type="video/mp4" />
                                            <BigPlayButton position="center" />
                                            <ControlBar disableDefaultControls={true}>
                                                <PlayToggle />
                                                <ProgressControl />
                                                <CurrentTimeDisplay order={4.1} />
                                                <TimeDivider order={4.2} />
                                                <DurationDisplay order={4.4} />
                                            </ControlBar>
                                        </Player>
                                    )}
                                </div>
                            </>
                        ) : null}
                        {data.imgs?.map?.((img, index) => {
                            return <img key={img + index} src={img} alt="" />
                        })}
                        <div className="tips">
                            {
                                '风险提示：任何情况下，本材料中的信息或所表述的意见并不构成对任何人的投资建议。基金过往业绩不代表未来表现，市场有风险，投资需谨慎。投资人应认真阅读《基金合同》、《招募说明书》、《基金产品资料概要》等法律文件，并根据自身风险承受能力选择适合自己的基金产品。理财魔方提醒投资人基金投资的“买者自负”原则，在做出投资决策后，基金运营状况与基金净值变化引致的投资风险，由投资人自行负担。'
                            }
                        </div>
                    </div>
                    {data.buy_button?.text ? (
                        <div className="btnBox">
                            <Button
                                block
                                color="primary"
                                onClick={() => {
                                    logtool(['Blanced_Portfolio_button'])
                                    jump(data.buy_button.url)
                                }}
                                shape="rounded"
                            >
                                {data.buy_button.text}
                            </Button>
                        </div>
                    ) : null}
                </>
            ) : (
                <Loading color={'white'} style={{fontSize: 24}} />
            )}
        </div>
    )
}

export default BlancedPortfolio
