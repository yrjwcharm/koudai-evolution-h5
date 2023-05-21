/*
 * @Description:
 * @Autor: wxp
 * @Date: 2022-09-14 18:37:09
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-21 21:29:35
 */

import React, {useRef, useState} from 'react'
import {Popup, SpinLoading, Toast} from 'antd-mobile'
import QueryString from 'qs'
import {useEffect} from 'react'
import http from '../../service'
import {inApp, jump, storage} from '../../utils'
import styles from './index.module.scss'
import {
    BigPlayButton,
    ControlBar,
    CurrentTimeDisplay,
    DurationDisplay,
    Player,
    PlayToggle,
    ProgressControl,
    TimeDivider,
} from 'video-react'
import {CloseOutline, RightOutline} from 'antd-mobile-icons'
import F2 from '@antv/f2'
import {BaseAreaChart} from '~/components/Chart'
import {cloneDeep, debounce} from 'lodash'
import {getConfig} from '~/utils/getConfig'
import {share} from '~/utils/share'
import BottomDesc from '~/components/BottomDesc'
import classNames from 'classnames'

const postScrollHeight = debounce(() => {
    let el = document.getElementsByClassName('AppRouter')?.[0]
    window.ReactNativeWebView?.postMessage(el?.scrollHeight)
}, 650)

const PortfolioDetails = () => {
    const params = QueryString.parse(window.location.href.split('?')[1]) || {}
    const [data, setData] = useState(null)
    const [chartData, setChartData] = useState(null)
    const [chartLabel, setChartLabel] = useState(null)
    const [popData, setPopData] = useState(null)
    const [playState, setPlayState] = useState(false)
    const [popupVisible, setPopupVisible] = useState(false)
    const [areaChartTabActive, setAreaChartTabActive] = useState('')

    const polarChartRef = useRef()
    const areaChartHttpFlag = useRef(false)
    const chartLabelDefaultRef = useRef({})

    const getData = () => {
        http.get('/portfolio/detail/20220914', params).then((res) => {
            if (res.code === '000000') {
                setData(res.result)
                res.result?.chart_params && genAreaChart(res.result?.chart_params?.period, res.result)
                res.result?.asset_deploy && genPolarChart(res.result?.asset_deploy)
            } else {
                Toast.show(res.message)
            }
        })
    }

    const init = () => {
        let timer
        if (inApp) {
            const {timeStamp} = QueryString.parse(window.location.href.split('?')[1]) || {}
            timer = setInterval(() => {
                if (storage.getItem('loginStatus')?.timeStamp === timeStamp) {
                    clearInterval(timer)
                    getData()
                }
            }, 10)
        } else {
            getData()
            getConfig(configShare)
        }
        return () => {
            timer && clearInterval(timer)
        }
    }

    useEffect(() => {
        init()
        document.title = '组合详情'
        window.document.addEventListener('reload', getData)
        return () => {
            window.document.removeEventListener('reload', getData)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        let el = document.getElementsByClassName('AppRouter')?.[0]
        let MutationObserver = window.MutationObserver || window.webkitMutationObserver || window.MozMutationObserver
        let mutationObserver = new MutationObserver(function (mutations) {
            postScrollHeight()
        })
        mutationObserver.observe(el, {
            childList: true,
            subtree: true,
        })
        return () => {
            mutationObserver.disconnect()
        }
    }, [])

    const configShare = () => {
        http.get(
            '/share/common/info/20210101',
            {
                name: 'PortfolioDetails',
                params: JSON.stringify({
                    link: window.location.origin + window.location.pathname,
                    params,
                }),
            },
            false,
        ).then((res) => {
            if (res.code === '000000') {
                share({
                    title: res.result.share_info.title,
                    content: res.result.share_info.content,
                    url: res.result.share_info.link,
                    img: res.result.share_info.avatar,
                })
            }
        })
    }

    const genAreaChart = (period, _data = data) => {
        if (areaChartHttpFlag.current) return
        areaChartHttpFlag.current = true
        setAreaChartTabActive(period)
        http.get('/portfolio/yield_chart/20210101', {...(_data?.chart_params || {}), period})
            .then((res) => {
                if (res.code === '000000') {
                    setChartData(res.result)
                    setChartLabel(res.result?.yield_info?.label)
                    chartLabelDefaultRef.current = res.result?.yield_info?.label
                }
            })
            .finally((_) => {
                areaChartHttpFlag.current = false
            })
    }

    const genPolarChart = (data) => {
        if (polarChartRef.current) {
            polarChartRef.current.clear?.()
        } else {
            polarChartRef.current = new F2.Chart({
                appendPadding: [10, 18, 16, 20],
                id: `polarChart`,
                pixelRatio: window.devicePixelRatio,
            })
        }
        const c = Object.entries(data.chart || {}).map(([name, rate], idx) => ({name, rate, a: '1'}))
        if (!c?.[0]) return
        const colorMap = data.items.reduce((memo, item) => {
            memo[item.name] = item.color
            return memo
        }, {})
        polarChartRef.current.source(c, {
            rate: {
                formatter: function formatter(val) {
                    return val + '%'
                },
            },
        })
        polarChartRef.current.tooltip(false)
        polarChartRef.current.legend({
            position: 'right',
            verticalAlign: 'middle',
            offsetY: 5,
            custom: true,
            items: Object.entries(data.chart).map(([name, value], idx) => ({
                name,
                value: (value * 100).toFixed(2) + '%',
                marker: {
                    symbol: 'circle',
                    fill: colorMap[name],
                    radius: 3,
                },
            })),
            nameStyle: {
                width: 125,
                fill: '#4E556C',
            },
            valueStyle: {
                textAlign: 'end',
                fontSize: 12,
                fill: '#4E556C',
                fontWeight: 'bold',
                fontFamily: ' DIN Alternate-Bold, DIN Alternate',
            },
        })
        polarChartRef.current.coord('polar', {
            transposed: true,
            innerRadius: 0.7,
        })
        polarChartRef.current.axis(false)
        polarChartRef.current
            .interval()
            .position('a*rate')
            .color('name', function (val) {
                return colorMap[val]
            })
            .adjust('stack')

        polarChartRef.current.guide().text({
            position: ['50%', '50%'],
            content: data.title,
            style: {
                fontSize: 11,
                color: '#3D3D3D',
            },
        })
        polarChartRef.current.render()
    }

    const onChange = (items) => {
        setChartLabel((prev) => {
            const next = cloneDeep(prev)
            next[0].val = items[0].title
            next[1].val = items[0].value || '0%'
            next[2].val = items[1].value || '0%'
            next[1].color = items[0].origin.value > 0 ? '#E74949' : '#4BA471'
            next[2].color = items[1].origin.value > 0 ? '#E74949' : '#4BA471'
            return next
        })
    }

    return data ? (
        <div
            className={classNames([styles.container, params.showBottomDesc ? styles.scrollWrap : null])}
            style={{paddingBottom: data?.bottom_button || data.bottom_btns ? '1.3rem' : 0}}
        >
            <div className={styles.topBg}></div>
            <div className={styles.main}>
                {data.video && (
                    <div className={styles.vWrap}>
                        <Player
                            onPlay={() => {
                                setPlayState(true)
                            }}
                            playsInline
                            poster={data.video?.cover}
                            fluid={false}
                            width="100%"
                            height={'4rem'}
                        >
                            <source src={data.video?.url} type="video/mp4" />
                            <BigPlayButton position="center" />
                            <ControlBar disableDefaultControls={true}>
                                <PlayToggle />
                                <ProgressControl />
                                <CurrentTimeDisplay order={4.1} />
                                <TimeDivider order={4.2} />
                                <DurationDisplay order={4.4} />
                            </ControlBar>
                        </Player>
                        {!playState && <div className={styles.timeHint}>{data?.video?.duration}</div>}
                    </div>
                )}
                {data?.head && (
                    <div className={styles.portfolioCard}>
                        <div className={styles.portfolioCardHead}>
                            <div className={styles.portfolioCardTitle}>{data.head?.portfolio?.name}</div>
                            <div className={styles.portfolioCardDesc}>
                                {data.head?.portfolio?.code && (
                                    <span className={styles.portfolioCardCode}>{data.head?.portfolio?.code}</span>
                                )}
                                {data.head?.portfolio?.tags?.map?.((item, idx) => (
                                    <div className={styles.portfolioCardTag} key={idx}>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.portfolioCardBottom}>
                            <div className={styles.portfolioCardBottomChunk}>
                                <div className={styles.portfolioCardBottomRate}>{data.head?.yield?.val}</div>
                                <div className={styles.portfolioCardBottomRateDesc}>
                                    {data.head?.yield?.key}
                                    {data.head?.yield?.tip && (
                                        <img
                                            src="https://static.licaimofang.com/wp-content/uploads/2022/10/question.png"
                                            alt="qs"
                                            className={styles.portfolioCardBottomRateDescTip}
                                            onClick={() => {
                                                if (window.ReactNativeWebView) {
                                                    window.ReactNativeWebView?.postMessage(
                                                        `tip=${JSON.stringify(data.head?.yield?.tip)}`,
                                                    )
                                                } else {
                                                    setPopData(data.head?.yield?.tip)
                                                    setPopupVisible(true)
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className={styles.portfolioCardBottomChunk}>
                                <div className={styles.portfolioCardBottomRate} style={{color: '#121D3A'}}>
                                    {data.head?.draw_back?.val}
                                </div>
                                <div className={styles.portfolioCardBottomRateDesc}>
                                    {data.head?.draw_back?.key}
                                    {data.head?.draw_back?.tip && (
                                        <img
                                            src="https://static.licaimofang.com/wp-content/uploads/2022/10/question.png"
                                            alt="qs"
                                            className={styles.portfolioCardBottomRateDescTip}
                                            onClick={() => {
                                                if (window.ReactNativeWebView) {
                                                    window.ReactNativeWebView?.postMessage(
                                                        `tip=${JSON.stringify(data.head?.draw_back?.tip)}`,
                                                    )
                                                } else {
                                                    setPopData(data.head?.draw_back?.tip)
                                                    setPopupVisible(true)
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {data?.notice && (
                    <div className={styles.noticeWrap}>
                        <div>
                            <img alt="" src={data.notice.icon} className={styles.noticeIcon} />
                            <span dangerouslySetInnerHTML={{__html: data.notice.content}}></span>
                        </div>
                        {data.notice.button && (
                            <div
                                className={styles.noticeBtn}
                                onClick={() => {
                                    jump(data.notice.button.url)
                                }}
                            >
                                {data.notice.button.text}
                            </div>
                        )}
                    </div>
                )}
                {data?.select_comment && (
                    <div className={styles.commentWrap}>
                        <div className={styles.commentTitle}>{data.select_comment.title}</div>
                        <div className={styles.commentContent}>
                            <span className={styles.nick}>{data.select_comment.comment.nick_name}</span>
                            <span className={styles.commentText}>{data.select_comment.comment.content}</span>
                            {data.select_comment.comment.button && (
                                <span
                                    className={styles.commentBtn}
                                    onClick={() => {
                                        jump(data.select_comment.comment.button.url)
                                    }}
                                >
                                    {data.select_comment.comment.button.text}
                                    <RightOutline color="#0051CC" fontSize={11} />
                                </span>
                            )}
                        </div>
                    </div>
                )}
                {data?.chart_params && (
                    <div className={styles.areaChartWrap}>
                        <div className={styles.chartLabel}>
                            {chartLabel?.map?.((item, idx) => (
                                <div className={styles.labelItem} key={idx}>
                                    <div className={styles.labelItemTop} style={{color: item.color || '#121D3A'}}>
                                        {item.val}
                                    </div>
                                    <div className={styles.labelItemBottom}>
                                        {idx > 0 && (
                                            <div
                                                style={{backgroundColor: ['#E74949', '#545968', '#FFAF00'][idx - 1]}}
                                                className={styles.labelKeyRect}
                                            />
                                        )}
                                        <div>{item.key}</div>
                                        {item.key === '比较基准' && (
                                            <img
                                                src="https://static.licaimofang.com/wp-content/uploads/2022/10/question.png"
                                                alt="qs"
                                                className={styles.portfolioCardBottomRateDescTip}
                                                onClick={() => {
                                                    if (window.ReactNativeWebView) {
                                                        window.ReactNativeWebView?.postMessage(
                                                            `tip=${JSON.stringify(chartData.yield_info.tips)}`,
                                                        )
                                                    } else {
                                                        setPopData(chartData.yield_info.tips)
                                                        setPopupVisible(true)
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {chartData ? (
                            <BaseAreaChart
                                areaColors={['l(90) 0:#E74949 1:#fff', 'transparent', '#50D88A']}
                                colors={['#E74949', '#545968', '#FFAF00']}
                                data={chartData?.yield_info?.chart}
                                onChange={(obj) => {
                                    const {items} = obj
                                    onChange(items)
                                }}
                                onHide={() => {
                                    setChartLabel(chartLabelDefaultRef.current)
                                }}
                                splitTag={chartData?.tag_position?.[0]}
                                padding={['auto', 20, 'auto', 50]}
                                percent={true}
                                showArea={true}
                                showDate={true}
                                tofixed={2}
                            />
                        ) : (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    paddingTop: '1.3rem',
                                    paddingBottom: '1.6rem',
                                }}
                            >
                                <SpinLoading color="default" style={{'--size': '24px'}} />
                            </div>
                        )}
                        {chartData?.yield_info?.sub_tabs && (
                            <div className={styles.chartTabs}>
                                {chartData?.yield_info?.sub_tabs.map((item, idx) => (
                                    <div
                                        className={styles.chartTabItem}
                                        key={idx}
                                        onClick={() => {
                                            genAreaChart(item.val)
                                        }}
                                        style={{
                                            backgroundColor: item.val === areaChartTabActive ? '#DEE8FF' : '#fff',
                                            color: item.val === areaChartTabActive ? '#0051CC' : '#545968',
                                        }}
                                    >
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {data?.asset_deploy && (
                    <div className={styles.assetDeployWrap}>
                        <div
                            className={styles.assetDeployHead}
                            onClick={() => {
                                jump(data?.asset_deploy.url)
                            }}
                        >
                            <div className={styles.assetDeployTitle}>{data?.asset_deploy.title}</div>
                            <RightOutline color="#4E556C" />
                        </div>
                        <div className={styles.assetDeployBody}>
                            <canvas id={`polarChart`} style={{width: '100%', height: '2.84rem'}}></canvas>
                        </div>
                    </div>
                )}
                {data?.intro_img?.map((item, idx) => (
                    <img
                        alt=""
                        src={item}
                        key={idx}
                        className={styles.introImg}
                        onLoad={() => {
                            let el = document.getElementsByClassName('AppRouter')?.[0]
                            window.ReactNativeWebView?.postMessage(el?.scrollHeight)
                        }}
                    />
                ))}
                {data?.gather_info && (
                    <div className={styles.gatherInfoWrap}>
                        {data?.gather_info?.map((curr, i) => {
                            const {label, url, value} = curr
                            return (
                                <div className={styles.infoItem} key={label + i} onClick={() => jump(url || '')}>
                                    <span className={styles.infoTitle}>{label}</span>
                                    <span className={styles.infoContent}>
                                        {value}
                                        <RightOutline color="#545968" fontSize={12} style={{marginLeft: '.04rem'}} />
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}
                {data?.show_mask && (
                    <img
                        style={{width: '100%', marginTop: '0.24rem'}}
                        src="https://static.licaimofang.com/wp-content/uploads/2022/09/frosted-glass2.png"
                        alt=""
                    />
                )}
                <div style={{padding: '12px 0'}}>
                    {data?.bottom?.map((item, idx) => (
                        <div key={idx} className={styles.bottomText}>
                            {item}
                        </div>
                    ))}
                </div>
            </div>
            {/* 整个底部按钮 */}
            {data?.bottom_button ? (
                <div className={styles.bottomBtnWrap}>
                    <div
                        className={styles.bottomBtn}
                        onClick={() => {
                            jump(data?.bottom_button.url)
                        }}
                    >
                        {data?.bottom_button.text}
                    </div>
                </div>
            ) : null}
            {/* 两个底部按钮 */}
            {data?.bottom_btns?.simple_btns ? (
                <div className={styles.bottomBtnWrap} style={{display: 'flex'}}>
                    {data?.bottom_btns?.simple_btns?.[0] && (
                        <div
                            className={styles.bottomBtn}
                            style={{
                                flex: 1,
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                            }}
                            onClick={() => {
                                jump(data?.bottom_btns?.simple_btns?.[0]?.url)
                            }}
                        >
                            {data?.bottom_btns?.simple_btns?.[0]?.title}
                        </div>
                    )}
                    {data?.bottom_btns?.simple_btns?.[1] && (
                        <div
                            className={styles.bottomBtn}
                            style={{flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}
                            onClick={() => {
                                jump(data?.bottom_btns?.simple_btns?.[1]?.url)
                            }}
                        >
                            {data?.bottom_btns?.simple_btns?.[1]?.title}
                        </div>
                    )}
                </div>
            ) : null}

            {!inApp || params.showBottomDesc ? <BottomDesc /> : null}

            <Popup
                visible={popupVisible}
                getContainer={null}
                bodyStyle={{borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}}
                onMaskClick={() => {
                    setPopupVisible(false)
                }}
            >
                <div className={styles.popHeader}>
                    <div
                        className={styles.popClose}
                        onClick={() => {
                            setPopupVisible(false)
                        }}
                    >
                        <CloseOutline fontSize={18} color="#545968" />
                    </div>
                    <div className={styles.poptitle}>{popData?.title}</div>
                </div>
                <div className={styles.popContent}>
                    {popData?.content.map((item, index) => {
                        return (
                            <div key={item + index} style={{marginTop: index === 0 ? 0 : '0.32rem'}}>
                                {item.key ? <div className={styles.tipTitle}>{item.key}:</div> : null}
                                <div
                                    style={{lineHeight: '0.36rem', fontSize: '0.26rem'}}
                                    dangerouslySetInnerHTML={{__html: item.val}}
                                />
                            </div>
                        )
                    })}
                </div>
            </Popup>
        </div>
    ) : null
}

export default PortfolioDetails
