import React, {useEffect, useRef, useState} from 'react'
import {useParams} from 'react-router'
import {Divider, Loading, Space, Swiper} from 'antd-mobile'
import {QuestionCircleOutline, RightOutline} from 'antd-mobile-icons'
import {
    Player,
    ControlBar,
    BigPlayButton,
    ProgressControl,
    DurationDisplay,
    PlayToggle, // PlayToggle 播放/暂停按钮 若需禁止加 disabled
    CurrentTimeDisplay,
    TimeDivider,
    VolumeMenuButton,
} from 'video-react'
import http from '~/service'
import {getIsWxClient, inApp, isIOS, jump, logtool, resolveTimeStemp, storage} from '~/utils'
import './index.css'
import Chart from './Chart'
import 'video-react/dist/video-react.css'
import qs from 'qs'

const BannerList = ({list = [], project_id}) => {
    const {Item} = Swiper
    return (
        <div className="bannerList">
            <Swiper
                allowTouchMove={list?.length > 1}
                autoplay
                autoplayInterval={4000}
                direction="horizontal"
                indicator={list?.length > 1 ? undefined : () => null}
                indicatorProps={{
                    style: {
                        '--active-dot-border-radius': 0,
                        '--active-dot-color': '#fff',
                        '--active-dot-size': '.24rem',
                        '--dot-border-radius': 0,
                        '--dot-color': 'rgba(255, 255, 255, 0.5)',
                        '--dot-size': '.08rem',
                        '--dot-spacing': '.08rem',
                    },
                }}
                loop
            >
                {list.map((item, index) => {
                    const {id = '', image, url} = item
                    return (
                        <Item key={image + index}>
                            <img
                                onClick={() => {
                                    logtool(['PlanDetails_Banner', project_id, id])
                                    jump(url)
                                }}
                                src={image}
                                alt=""
                            />
                        </Item>
                    )
                })}
            </Swiper>
        </div>
    )
}

const ProjectInfo = ({data = {}}) => {
    const {
        hold_info,
        label: projectLabel,
        name: projectName,
        project_id,
        risk_info,
        signal_info,
        tool_list,
        yield_info,
    } = data
    return (
        <div className="projectInfo">
            {signal_info ? <img className="signalInfo" src={signal_info} alt="" /> : null}
            <div className="defaultFlex projectName">
                {projectName}
                {projectLabel ? <img src={projectLabel} alt="" /> : null}
            </div>
            <div className="defaultFlex infoBox">
                {yield_info ? (
                    <div style={{flex: 2}}>
                        <div className="ratio" dangerouslySetInnerHTML={{__html: yield_info.ratio}} />
                        <div className="defaultFlex infoDesc">
                            {yield_info.title}
                            {yield_info.tip ? (
                                <QuestionCircleOutline
                                    color="#121D3A"
                                    fontSize={12}
                                    onClick={() =>
                                        inApp &&
                                        window.ReactNativeWebView.postMessage(
                                            `modalContent=${JSON.stringify(yield_info.tip)}`,
                                        )
                                    }
                                    style={{marginLeft: '.08rem'}}
                                />
                            ) : null}
                        </div>
                    </div>
                ) : null}
                {risk_info ? (
                    <div style={{flex: 1}}>
                        <div className="infoValue">{risk_info.value}</div>
                        <div className="infoDesc">{risk_info.title}</div>
                    </div>
                ) : null}
                {hold_info ? (
                    <div style={{flex: 1}}>
                        <div className="infoValue">{hold_info.value}</div>
                        <div className="infoDesc">{hold_info.title}</div>
                    </div>
                ) : null}
            </div>
            {tool_list?.length > 0 && (
                <Space
                    style={{
                        marginTop: '.32rem',
                        '--gap-horizontal': '.24rem',
                        '--gap-vertical': '.16rem',
                    }}
                    wrap
                >
                    {tool_list.map((item, index) => {
                        const {icon, id, name, url} = item
                        return (
                            <div
                                className="defaultFlex toolBox"
                                key={name + index}
                                onClick={() => {
                                    logtool(['ProjectDetail_click', id, project_id])
                                    jump(url)
                                }}
                            >
                                <img src={icon} alt="" />
                                <span className="toolName" style={inApp ? {} : {marginRight: 0}}>
                                    {name}
                                </span>
                                {inApp && url && <RightOutline color="#121D3A" fontSize={8} />}
                            </div>
                        )
                    })}
                </Space>
            )}
        </div>
    )
}

const GroupBulletIn = ({data = {}, project_id}) => {
    const {btn, content, created_at, icon, system_list_url: url, title} = data
    return (
        <div className="groupBulletIn">
            <div className="flexBetween" onClick={() => jump(url)}>
                <img className="titleIcon" src={icon} alt="" />
                {url && <RightOutline color="#545968" fontSize={10} />}
            </div>
            <Divider style={{borderColor: '#E9EAEF', margin: '.2rem 0 .28rem'}} />
            <div
                onClick={() => {
                    logtool(['PlanBroadcast_Details', project_id])
                    jump(btn?.url || '')
                }}
            >
                <div className="ellipsisLine groupBulletInTitle">{title}</div>
                <div className="ellipsisLine groupBulletInContent">{content}</div>
                <div className="flexBetween" style={{marginTop: '.16rem'}}>
                    <div className="groupBulletInDate">{created_at}</div>
                    {btn?.text ? <div className="hairline groupBulletInBtn">{btn.text}</div> : null}
                </div>
            </div>
        </div>
    )
}

const SignalNotice = ({data = {}, project_id}) => {
    const {
        color: signalColor,
        content: signalContent,
        created_at: signalDate,
        signal,
        title: signalTitle,
        url: signalUrl,
    } = data
    return (
        <div
            className="defaultFlex hairline signalBox"
            onClick={() => {
                logtool(['PlanBroadcast_SignalDetails', project_id])
                jump(signalUrl)
            }}
            style={{
                '--hairline-color': signalColor,
                '--back-color': '#F5FDF5',
            }}
        >
            <div style={{marginRight: '.24rem', flex: 1}}>
                <div className="defaultFlex">
                    <div className="signalTag">{signal}</div>
                    <div className="signalName">{signalTitle}</div>
                </div>
                <div className="ellipsisLine signalContent" dangerouslySetInnerHTML={{__html: signalContent}} />
                <div className="signalDate">{signalDate}</div>
            </div>
            {signalUrl && <RightOutline color="#545968" fontSize={12} />}
        </div>
    )
}

const RenderPart = ({data = {}, project_id}) => {
    const {chart_params, chart_path, ctrl, desc, pattern, picture_list, slogan, title, url, video_list, risk_tip} = data

    return (
        <div className="partBox">
            <div
                className="flexBetween"
                onClick={() => {
                    logtool(['ProjectDetail_click', ctrl || title, project_id])
                    jump(url)
                }}
            >
                <div className="defaultFlex">
                    <span className="partTitle">{title}</span>
                    <Divider
                        direction="vertical"
                        style={{
                            borderColor: '#121D3A',
                            margin: '.04rem .16rem 0',
                            height: '.24rem',
                        }}
                    />
                    <span className="partSlogan">{slogan}</span>
                </div>
                {url && inApp && <RightOutline color="#545968" fontSize={10} />}
            </div>
            {chart_params && chart_path ? (
                <Chart apiInfo={{chart_params, chart_path}} percent project_id={project_id} />
            ) : null}
            {desc?.map?.((item, index) => {
                return <div className="partDesc" dangerouslySetInnerHTML={{__html: item}} key={item + index} />
            })}
            {picture_list?.map((img, index) => {
                return <img className="partImage" key={img + index} src={img} alt="" />
            })}
            {pattern?.map((item, index) => {
                const {
                    chart_params,
                    chart_path,
                    desc,
                    schema = {},
                    table_body,
                    table_desc,
                    table_head,
                    tool = {},
                } = item
                const {signal: {icon, text, url} = {}} = tool
                return (
                    <div key={schema?.value + index}>
                        <div className="hairline patternBox">
                            <div className="defaultFlex">
                                <div className="defaultFlex" style={{flex: 1}}>
                                    <span className="schemaLabel">{schema.label}：</span>
                                    <span className="schemaName">{schema.value}</span>
                                </div>
                                <Divider
                                    direction="vertical"
                                    style={{
                                        borderColor: '#E9EAEF',
                                        margin: '0 .24rem',
                                        height: '.36rem',
                                    }}
                                />
                                <div className="defaultFlex" style={{flex: 1}}>
                                    <span className="schemaLabel">{tool.label}：</span>
                                    {icon ? (
                                        <div className="defaultFlex toolBox" onClick={() => jump(url)}>
                                            <img src={icon} alt="" />
                                            <span className="toolName" style={inApp ? {} : {marginRight: 0}}>
                                                {text}
                                            </span>
                                            {inApp && url && <RightOutline color="#121D3A" fontSize={8} />}
                                        </div>
                                    ) : (
                                        <span className="toolName" style={inApp ? {} : {marginRight: 0}}>
                                            {tool.signal}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {desc && (
                                <>
                                    <div
                                        className="hairline hairline--top signalContent"
                                        dangerouslySetInnerHTML={{__html: desc}}
                                    />
                                </>
                            )}
                        </div>
                        {chart_params && chart_path ? (
                            <Chart apiInfo={{chart_params, chart_path}} showArea={false} percent />
                        ) : null}
                        {table_desc ? (
                            <div className="desc" style={{textAlign: 'center', marginTop: '.48rem'}}>
                                {table_desc}
                            </div>
                        ) : null}
                        {table_head && table_body ? (
                            <div className="tableBox">
                                <div className="defaultFlex tableHeader">
                                    {table_head.map((item, index) => {
                                        return (
                                            <div
                                                className="flexCenter desc"
                                                key={item + index}
                                                style={{flex: 1, fontWeight: 500}}
                                            >
                                                {item}
                                            </div>
                                        )
                                    })}
                                </div>
                                {table_body.map((item, index) => {
                                    return (
                                        <div
                                            className="hairline defaultFlex tableRow"
                                            key={item + index}
                                            style={{
                                                '--hairline-width': index === 0 ? 0 : '1px 0 0',
                                                '--hairline-color': '#E2E4EA',
                                            }}
                                        >
                                            {item.map((v, i) => {
                                                return (
                                                    <div
                                                        className="flexCenter"
                                                        key={(v.name || v) + i}
                                                        style={{flex: 1}}
                                                    >
                                                        {i === 0 ? (
                                                            <>
                                                                <div
                                                                    className="legendShape"
                                                                    style={{backgroundColor: v.color}}
                                                                />
                                                                <div className="tableCell">{v.name}</div>
                                                            </>
                                                        ) : null}
                                                        {i > 0 ? (
                                                            <span
                                                                className="tableCell"
                                                                style={
                                                                    i === 1 ? {color: '#E74949', fontWeight: 500} : {}
                                                                }
                                                            >
                                                                {v}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )
                                })}
                            </div>
                        ) : null}
                    </div>
                )
            })}
            {risk_tip && (
                <div style={{fontSize: '0.24rem', lineHeight: '0.34rem', color: '#9AA0B1', marginTop: '0.1rem'}}>
                    {risk_tip}
                </div>
            )}
            {video_list?.length > 0 && (
                <div className="defaultFlex" style={{flexWrap: 'wrap', marginTop: '.24rem'}}>
                    {video_list.map((video, index) => {
                        const {desc} = video
                        return (
                            <div
                                key={desc + index}
                                style={{
                                    marginTop: index < 2 ? 0 : '.24rem',
                                    marginRight: index % 2 === 0 ? '.16rem' : 0,
                                    width: '3.02rem',
                                }}
                            >
                                <div className="videoCon">
                                    <VideoBox ctrl={index} event={'Strategy'} oid={project_id} video={video} />
                                </div>
                                <div className="videoTitle">{desc}</div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export const VideoBox = ({ctrl = '', event, oid, playFullscreen = true, video}) => {
    const [videoDuration, setVideoDuration] = useState([])
    const [hideDuration, setHide] = useState(false)
    const playerRef = useRef()

    const togglePlay = (act, e) => {
        if (act === 'pause') {
            inApp && window.ReactNativeWebView.postMessage(`playTime=${e.target.currentTime}`)
        } else {
            logtool([event || act, ctrl || 'play', oid])
            setHide(true)
        }
        if (inApp && isIOS()) return false
        playFullscreen && playerRef.current?.toggleFullscreen?.()
    }

    return (
        <>
            {isIOS() && getIsWxClient() && !window.ReactNativeWebView ? (
                <video
                    width="100%"
                    playsInline={true}
                    controls
                    onLoadedMetadata={(e) => {
                        setVideoDuration(resolveTimeStemp(e.target.duration * 1000))
                    }}
                    onPause={(e) => {
                        togglePlay('pause', e)
                    }}
                    onPlay={() => {
                        togglePlay('play')
                    }}
                    poster={video.cover}
                    src={video.url}
                ></video>
            ) : (
                <Player
                    onLoadedMetadata={(e) => {
                        setVideoDuration(resolveTimeStemp(e.target.duration * 1000))
                    }}
                    onPause={(e) => {
                        togglePlay('pause', e)
                    }}
                    onPlay={() => {
                        togglePlay('play')
                    }}
                    preload="metadata"
                    playsInline={true}
                    poster={video.cover}
                    ref={playerRef}
                >
                    <source src={video.url} type="video/mp4" />
                    <BigPlayButton position="center" />
                    <ControlBar disableDefaultControls={true}>
                        <PlayToggle />
                        <ProgressControl />
                        <CurrentTimeDisplay order={4.1} />
                        <TimeDivider order={4.2} />
                        <DurationDisplay order={4.4} />
                        <VolumeMenuButton order={4.5} />
                    </ControlBar>
                </Player>
            )}
            {!hideDuration && videoDuration?.length > 0 && (
                <div className="videoDuration">
                    {videoDuration.map((item, index, arr) =>
                        item !== '00' ? (
                            <span key={item + index}>
                                {item}
                                {index !== arr.length - 1 ? ':' : ''}
                            </span>
                        ) : null,
                    )}
                </div>
            )}
        </>
    )
}

const Index = () => {
    const params = useParams()
    const {project_id = ''} = params
    const [data, setData] = useState({})
    const {banner_list, gather_info, group_bulletin, list, project_info, risk_info, signal_notice, video_top} = data
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let timer
        const getData = () => {
            http.get('/project/detail/202207', {
                project_id,
                in_app: ~~inApp,
            })
                .then((res) => {
                    if (res.code === '000000') {
                        setData(res.result)
                    }
                })
                .finally(() => {
                    setLoading(false)
                })
        }
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        let count = 0
        let timer = ''
        if (Object.keys(data).length > 0 && window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(`height=${document.querySelector('.projectDetail').scrollHeight}`)
            timer = setInterval(() => {
                if (count < 3) {
                    count++
                    window.ReactNativeWebView.postMessage(
                        `height=${document.querySelector('.projectDetail').scrollHeight}`,
                    )
                } else {
                    clearInterval(timer)
                }
            }, 1000)
        }
        return () => {
            clearInterval(timer)
        }
    }, [data])

    return (
        <div className="projectDetail">
            {loading ? (
                <Loading color={'#0052CD'} style={{fontSize: 24}} />
            ) : (
                <div>
                    <div className="topBg" />
                    {/* 置顶视频 */}
                    {video_top?.url ? (
                        <div className="videoBox">
                            <VideoBox event={''} oid={project_id} video={video_top} />
                        </div>
                    ) : null}
                    {/* 轮播图 */}
                    {banner_list ? <BannerList list={banner_list} project_id={project_id} /> : null}
                    {/* 计划信息 */}
                    {project_info ? <ProjectInfo data={{...project_info, project_id}} /> : null}
                    {/* 组合快报 */}
                    {group_bulletin ? <GroupBulletIn data={group_bulletin} project_id={project_id} /> : null}
                    {/* 买卖信号 */}
                    {signal_notice ? <SignalNotice data={signal_notice} project_id={project_id} /> : null}
                    {list?.length > 0
                        ? list.map((item, index) => {
                              return <RenderPart data={item} key={item.title + index} project_id={project_id} />
                          })
                        : null}
                    {gather_info?.length > 0 && (
                        <div className="gatherList">
                            {gather_info.map((item, index) => {
                                const {desc, title, url} = item
                                return (
                                    <div
                                        className={`hairline${
                                            index === 0 ? '' : ' hairline--top'
                                        } flexBetween gatherItem`}
                                        key={title + index}
                                        onClick={() => jump(url)}
                                    >
                                        <div>{title}</div>
                                        <div className="defaultFlex">
                                            <span className="gatherDesc">{desc}</span>
                                            {inApp && (
                                                <RightOutline
                                                    color="#545968"
                                                    fontSize={12}
                                                    style={{marginLeft: '.08rem'}}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    {risk_info ? (
                        <div
                            className="desc"
                            style={{
                                padding: `.4rem .32rem ${inApp ? 0 : '.4rem'}`,
                                color: '#9AA0B1',
                                textAlign: 'justify',
                            }}
                        >
                            {risk_info}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}

export default Index
