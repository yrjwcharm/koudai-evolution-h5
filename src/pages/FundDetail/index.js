import React, {useEffect, useMemo, useRef, useState} from 'react'
import {useParams} from 'react-router'
import {Loading, Space, Swiper, Tabs} from 'antd-mobile'
import {QuestionCircleOutline, RightOutline} from 'antd-mobile-icons'
import {BaseAreaChart} from '~/components/Chart'
import Dropdown from '~/components/Dropdown'
import http from '~/service'
import {inApp, isIOS, jump, logtool, storage} from '~/utils'
import './index.css'
import 'video-react/dist/video-react.css'
import {VideoBox} from '../ProjectDetail'
import {cloneDeep, times} from 'lodash'
import qs from 'qs'
import {getConfig} from '~/utils/getConfig'
import {share} from '~/utils/share'

export const TabsBox = ({contents = [], pointKey, tabItems = []}) => {
    const swiperRef = useRef(null)
    const [activeIndex, setActiveIndex] = useState(0)

    return (
        <div className="tabsBox">
            <div style={{padding: '0 .32rem'}}>
                <Tabs
                    activeKey={tabItems[activeIndex].key}
                    activeLineMode="fixed"
                    className={tabItems.length > 1 ? 'hairline' : ''}
                    onChange={(key) => {
                        const index = tabItems.findIndex((item) => item.key === key)
                        pointKey && logtool([pointKey, index + 1])
                        setActiveIndex(index)
                        swiperRef.current?.swipeTo(index)
                    }}
                    stretch={false}
                    style={{
                        '--active-line-border-radius': '.02rem',
                        '--active-line-color': '#121D3A',
                        '--active-title-color': '#121D3A',
                        '--fixed-active-line-width': tabItems?.length > 1 ? '.4rem' : 0,
                        '--hairline-width': 0,
                        '--hairline-color': '#E9EAEF',
                        '--active-title-weight': isIOS() ? 500 : 700,
                    }}
                >
                    {tabItems.map((tab) => (
                        <Tabs.Tab key={tab.key} title={tab.title} />
                    ))}
                </Tabs>
            </div>
            <Swiper
                allowTouchMove={false}
                defaultIndex={activeIndex}
                direction="horizontal"
                indicator={() => null}
                loop={false}
                onIndexChange={setActiveIndex}
                ref={swiperRef}
            >
                {contents.map((item, index) => {
                    return (
                    <Swiper.Item key={tabItems[index].key}>{item}</Swiper.Item>)
                })}
            </Swiper>
        </div>
    )
}

const ChartBox = ({code, container, data = {}}) => {
    const {key, period: defaultPeriod = 'm1', subtabs = []} = data
    const [chartData, setData] = useState([])
    const [period, setPeriod] = useState(defaultPeriod)
    const [summary, setSummary] = useState([])
    const originSummary = useRef()
    const indexRef = useRef()

    const getData = () => {
        const pathObj = {
            daily_return: '/fund/daily/return/20220922',
            inc: '/fund/nav/inc/20220809',
            trend: '/fund/nav/trend/20210101',
            year: '/fund/nav/monetary/20210101',
        }
        const params = {fund_code: code, period}
        if (indexRef.current) params.index = indexRef.current
        http.get(pathObj[key], params).then((res) => {
            if (res.code === '000000') {
                originSummary.current = cloneDeep(res.result.summary)
                setSummary(res.result.summary)
                setData(res.result.chart)
            }
        })
    }

    const onChange = (items) => {
        setSummary((prev) => {
            const next = cloneDeep(prev)
            if (key === 'inc') {
                next.forEach((item, index) => {
                    item.val = items[index].value
                })
            } else {
                next.slice(1).forEach((item, index) => {
                    item.val = items[index].value
                })
                next[0].val = items[0].title
            }
            // console.log(next);
            return next
        })
    }

    const onHide = () => {
        setSummary(originSummary.current)
    }

    useEffect(() => {
        getData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period])

    return (
        <div className="chartBox">
            <div className="flexCenter" style={{minHeight: '.76rem', marginTop: '.32rem'}}>
                {summary?.map((item, index, arr) => {
                    const {color, index_list = [], key: legendKey, tips, val} = item
                    const realKey =
                        index_list?.length > 0
                            ? index_list[index_list.findIndex?.((v) => v.key === legendKey)]?.text
                            : legendKey
                    return (
                        <div
                            className="flexColumn"
                            key={legendKey}
                            style={{
                                margin: index === 1 ? (arr.length === 3 ? '0 .8rem' : '0 0 0 .8rem') : 0,
                            }}
                        >
                            <div
                                className="chartLegendVal"
                                style={
                                    index > 0 || key === 'inc'
                                        ? {
                                              color: parseFloat(val)
                                                  ? parseFloat(val) > 0
                                                      ? '#E74949'
                                                      : '#4BA471'
                                                  : '#121D3A',
                                          }
                                        : {}
                                }
                            >
                                {val}
                            </div>
                            <Dropdown
                                actions={index_list}
                                activeKey={legendKey}
                                getContainer={() => container?.current}
                                onAction={(_key) => {
                                    indexRef.current = _key
                                    getData()
                                }}
                            >
                                <div className="defaultFlex chartLegendKey">
                                    {color ? <div className="legendLine" style={{backgroundColor: color}} /> : null}
                                    {realKey}
                                    {tips ? (
                                        <QuestionCircleOutline
                                            color="#121D3A"
                                            fontSize={12}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                inApp &&
                                                    window.ReactNativeWebView.postMessage(
                                                        `modalContent=${JSON.stringify(tips)}`,
                                                    )
                                            }}
                                            style={{marginLeft: '.08rem'}}
                                        />
                                    ) : null}
                                </div>
                            </Dropdown>
                        </div>
                    )
                })}
            </div>
            <div style={{height: '4.4rem'}}>
                {chartData?.length > 0 && (
                    <BaseAreaChart
                        areaColors={['l(90) 0:#E74949 1:#fff', 'transparent', 'transparent']}
                        colors={['#E74949', '#545968', '#FFAF00']}
                        data={chartData}
                        id={key}
                        onChange={(obj) => {
                            const {items} = obj
                            // console.log(items)
                            onChange(items)
                        }}
                        onHide={onHide}
                        padding={['auto', 20, 'auto', 50]}
                        percent={key !== 'daily_return' && key !== 'trend'}
                        showArea={key === 'inc'}
                        showDate={key === 'inc'}
                        tofixed={key === 'daily_return' || key === 'trend' ? 4 : 2}
                    />
                )}
            </div>
            {subtabs?.length > 0 && (
                <div className="flexCenter fundChartTabs">
                    {subtabs.map((tab) => (
                        <div
                            className={`flexCenter chartTab${tab.val === period ? ' active' : ''}`}
                            key={tab.val}
                            onClick={() => setPeriod(tab.val)}
                            style={{flex: tab.val === 'all' ? 1.2 : 1, '--active-tab-weight': isIOS() ? 500 : 700}}
                        >
                            {tab.key}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

const HistoryTable = ({data: {header, items, more} = {}}) => {
    return (
        <div className="historyTable">
            <div className="defaultFlex tableHeader">
                {header?.map?.((h, i) => (
                    <span className="headerText" key={h + i}>
                        {h}
                    </span>
                ))}
            </div>
            {items?.map?.((row, i) => (
                <div className="defaultFlex hairline hairline--bottom tableRow" key={i}>
                    {row?.map?.((r, idx) => (
                        <span className="cellText" dangerouslySetInnerHTML={{__html: r}} key={r + idx} />
                    ))}
                </div>
            ))}
            {more?.text && inApp ? (
                <div className="flexCenter moreBtn" onClick={() => jump(more.url)}>
                    {more.text}
                    <RightOutline color="#9AA0B1" fontSize={10} />
                </div>
            ) : null}
        </div>
    )
}

const Index = () => {
    const params = useParams()
    const [data, setData] = useState({})
    const {
        bottom = [],
        chart_tab = [],
        group_info = [],
        head = {},
        notice,
        notice_list = [],
        rank_tab = [],
        score_info = [],
        select_comment,
        video,
    } = data
    const {daily_inc = {}, fund = {}, nav = {}, yield: inc = {}} = head
    const container = useRef()

    const commentSliceData = useMemo(() => {
        let i = 0
        let sliceNum = 0
        const content = select_comment?.comment?.content || ''
        while (sliceNum <= 68 && i < content?.length) {
            sliceNum = sliceNum + (escape(content[i++]).includes('%u') ? 1 : 0.5)
        }
        return {
            sliceNum: sliceNum > 60 ? sliceNum : Infinity,
            i: i - 3,
        }
    }, [select_comment])

    useEffect(() => {
        let timer
        const {timeStamp, ...rest} = qs.parse(window.location.href.split('?')[1]) || {}
        const getData = (otherParams = {}) => {
            http.get('/fund/detail/20220617', {
                fund_code: params.code,
                in_app: ~~inApp,
                ...otherParams,
            }).then((res) => {
                if (res.code === '000000') {
                    setData(res.result)
                }
            })
        }
        if (inApp) {
            timer = setInterval(() => {
                if (storage.getItem('loginStatus')?.timeStamp === timeStamp) {
                    clearInterval(timer)
                    getData()
                }
            }, 10)
        } else {
            getData(rest)
            getConfig(configShare)
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
            window.ReactNativeWebView.postMessage(`height=${container.current.scrollHeight}`)
            timer = setInterval(() => {
                if (count < 3) {
                    count++
                    window.ReactNativeWebView.postMessage(`height=${container.current.scrollHeight}`)
                } else {
                    clearInterval(timer)
                }
            }, 1000)
        }
        return () => {
            clearInterval(timer)
        }
    }, [data])

    const configShare = () => {
        const searchObj = qs.parse(window.location.href.split('?')[1]) || {}
        http.get(
            '/share/common/info/20210101',
            {
                name: 'FundDetail',
                params: JSON.stringify({...params, ...searchObj}),
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

    return (
        <div className="fundDetail" ref={container} style={{paddingBottom: data?.bottom_button ? '1.3rem' : 0}}>
            {Object.keys(data).length > 0 ? (
                <>
                    <div className="bottomPart">
                        {/* 图表 */}
                        {chart_tab?.length > 0 && (
                            <TabsBox
                                contents={chart_tab.map((item) => (
                                    <ChartBox code={params.code} container={container} data={item} key={item.key} />
                                ))}
                                pointKey={'fund_results'}
                                tabItems={chart_tab}
                            />
                        )}
                    </div>
                </>
            ) : (
                <Loading color={'#0052CD'} style={{fontSize: 24}} />
            )}
        </div>
    )
}

export default Index
