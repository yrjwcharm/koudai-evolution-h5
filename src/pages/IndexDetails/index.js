import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import styles from './index.module.scss'
import TaurenSignalMCard from '../SignalTool/TaurenSignal/MCard'
import ProbabilitySignalMCard from '../SignalTool/ProbabilitySignal/MCard'
import LowBuyMainCard from '../SignalTool/LowBuy/MCard'
import FallBuyMainCard from '../SignalTool/FallBuy/MCard'
import {Calendar} from 'antd-mobile'
import dayjs from 'dayjs'
import http from '../../service'
import {inApp, storage} from '../../utils'
import QueryString from 'qs'
import {ArrowLeft} from 'antd-mobile/es/components/calendar/arrow-left'
import {ArrowLeftDouble} from 'antd-mobile/es/components/calendar/arrow-left-double'

const IndexDetail = () => {
    const [data, setData] = useState(null)
    const [active, setTabActive] = useState()
    const [btnActive, setBtnActive] = useState()
    const [calendarData, setCalendarData] = useState({})
    const [[startDateRange, endDateRange], setDateRange] = useState(['', ''])
    const [curDate, setCurDate] = useState('')

    const params = useRef(QueryString.parse(window.location.href.split('?')[1]) || {}).current

    const calendarRef = useRef()

    const MCard = useMemo(() => {
        return btnActive?.tool_id
            ? [TaurenSignalMCard, FallBuyMainCard, LowBuyMainCard, ProbabilitySignalMCard][btnActive?.tool_id - 1]
            : null
    }, [btnActive])

    useEffect(() => {
        if (!active) return
        let obj2 = active.sub_tabs?.find((item) => item.selected)
        setBtnActive(obj2)
        if (obj2) {
            getCalendarData(dayjs().format('YYYYMM'), obj2?.tool_id)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active])

    const getData = () => {
        http.get('/project/get/index/detail/202207', {index_id: params.index_id}).then((res) => {
            if (res.code === '000000') {
                setData(res.result)
                let obj = res.result?.tabs?.find((item) => item.selected)
                if (obj) {
                    setTabActive(obj)
                }
                window.ReactNativeWebView?.postMessage(
                    `data=${JSON.stringify({
                        type: 'index',
                        title: res.result?.title,
                        card: res.result?.card_list?.[0],
                        top_button: res.result?.top_button,
                    })}`,
                )
            }
        })
    }
    let timer = useRef(null)
    const getCalendarData = (yearmonth, tool_id) => {
        setCurDate(yearmonth)
        // 调用接口
        if (timer.current) {
            clearTimeout(timer.current)
            timer.current = null
        }
        timer.current = setTimeout(() => {
            http.get('/tool/signal/history/20220711', {index_id: params.index_id, tool_id, yearmonth}).then((res) => {
                if (res.code === '000000') {
                    setCalendarData(res.result)
                }
            })
        }, 500)
    }

    const dateRangeChange = useCallback(([start = '', end = '']) => {
        calendarRef.current.jumpTo({year: start.slice(0, 4), month: start.slice(5, 7)})
        setDateRange([start.slice(0, 7).replace('-', ''), end.slice(0, 7).replace('-', '')])
    }, [])

    useEffect(() => {
        let timer
        if (inApp) {
            const {timeStamp} = params
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

    const onPageChange = useCallback(
        (year, month) => {
            month = (month + '').length === 2 ? month : '0' + month
            let date = year + '' + month
            getCalendarData(date, btnActive.tool_id)
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [btnActive],
    )

    return data ? (
        <div className={styles.IndexDetail}>
            <div className={styles.indexData}>
                <div className={styles.indexDataMain}>
                    <div className={styles.indexDataLeft}>
                        <div className={styles.indexDataLeftTop} style={{color: data?.header?.left?.part1?.color}}>
                            {data?.header?.left?.part1?.value}
                        </div>
                        <div className={styles.indexDataLeftBottom}>
                            <span
                                className={styles.indexDataLeftBottomLeft}
                                style={{color: data?.header?.left?.part2?.color}}
                            >
                                {data?.header?.left?.part2?.value}
                            </span>
                            <span
                                className={styles.indexDataLeftBottomRight}
                                style={{color: data?.header?.left?.part3?.color}}
                            >
                                {data?.header?.left?.part3?.value}
                            </span>
                        </div>
                    </div>
                    <div className={styles.indexDataMiddle}>
                        <div className={styles.indexDataMiddleRow}>
                            <div className={styles.indexDataMiddleCell}>
                                <div
                                    className={styles.indexDataMiddleCellTitle}
                                    style={{color: data?.header?.middle?.line1?.[0]?.title_color}}
                                >
                                    {data?.header?.middle?.line1?.[0]?.title}
                                </div>
                                <div
                                    className={styles.indexDataMiddleCellNum}
                                    style={{color: data?.header?.middle?.line1?.[0]?.value_color}}
                                >
                                    {data?.header?.middle?.line1?.[0]?.value}
                                </div>
                            </div>
                            <div className={styles.indexDataMiddleCell}>
                                <div
                                    className={styles.indexDataMiddleCellTitle}
                                    style={{color: data?.header?.middle?.line1?.[1]?.title_color}}
                                >
                                    {data?.header?.middle?.line1?.[1]?.title}
                                </div>
                                <div
                                    className={styles.indexDataMiddleCellNum}
                                    style={{color: data?.header?.middle?.line1?.[1]?.value_color}}
                                >
                                    {data?.header?.middle?.line1?.[1]?.value}
                                </div>
                            </div>
                        </div>
                        <div className={styles.indexDataMiddleRow}>
                            <div className={styles.indexDataMiddleCell}>
                                <div
                                    className={styles.indexDataMiddleCellTitle}
                                    style={{color: data?.header?.middle?.line2?.[0]?.title_color}}
                                >
                                    {data?.header?.middle?.line2?.[0]?.title}
                                </div>
                                <div
                                    className={styles.indexDataMiddleCellNum}
                                    style={{color: data?.header?.middle?.line2?.[0]?.value_color}}
                                >
                                    {data?.header?.middle?.line2?.[0]?.value}
                                </div>
                            </div>
                            <div className={styles.indexDataMiddleCell}>
                                <div
                                    className={styles.indexDataMiddleCellTitle}
                                    style={{color: data?.header?.middle?.line2?.[1]?.title_color}}
                                >
                                    {data?.header?.middle?.line2?.[1]?.title}
                                </div>
                                <div
                                    className={styles.indexDataMiddleCellNum}
                                    style={{color: data?.header?.middle?.line2?.[1]?.value_color}}
                                >
                                    {data?.header?.middle?.line2?.[1]?.value}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.indexDataRight}>
                        {!!data?.header?.right?.icon && (
                            <img src={data?.header?.right?.icon} alt="" className={styles.indexDataIcon} />
                        )}
                    </div>
                </div>
                <div className={styles.indexDataFooter}>
                    <span className={styles.indexDataFooterText}> {data?.header?.footer?.text}</span>
                </div>
            </div>
            <div className={styles.IndexDetailTabsWrap}>
                {data?.tabs?.map((item, idx) => (
                    <div
                        key={idx}
                        className={styles.IndexDetailTabItem}
                        style={{marginLeft: idx > 0 ? '9px' : '0', fontSize: active === item ? '16px' : '14px'}}
                        onClick={() => {
                            if (active !== item && item.can_click) {
                                setBtnActive(null)
                                setTabActive(item)
                            }
                        }}
                    >
                        <span>{item.title}</span>
                        {active === item && <div className={styles.bottomLine}></div>}
                    </div>
                ))}
            </div>
            <div className={styles.IndexDetailCard}>
                <div className={styles.IndexDetailTabBtnWrap}>
                    {active?.sub_tabs?.map?.((item, idx) => {
                        let style =
                            btnActive !== item
                                ? {backgroundColor: '#F5F6F8', color: '#121D3A'}
                                : {backgroundColor: '#DEE8FF', color: '#0051CC'}
                        return (
                            <div
                                className={styles.IndexDetailTabBtn}
                                key={idx}
                                style={{marginLeft: idx > 0 ? '8px' : '0px', ...style}}
                                onClick={() => {
                                    setBtnActive(item)
                                    // calendarRef.current.jumpToToday()
                                }}
                            >
                                {item.name}
                            </div>
                        )
                    })}
                </div>
                {MCard && <MCard extract index_list={[{id: params.index_id}]} dateRangeChange={dateRangeChange} />}
                {btnActive?.calendar && (
                    <>
                        <div className={styles.historySignal}>
                            <div className={styles.historySignalTitle}>{btnActive?.calendar?.title}</div>
                            <Calendar
                                prevMonthButton={<MonthButton disabled={curDate <= startDateRange} />}
                                nextMonthButton={<MonthButton disabled={curDate >= endDateRange} />}
                                prevYearButton={<YearButton disabled={+curDate - 100 < +startDateRange} />}
                                nextYearButton={<YearButton disabled={+curDate + 100 > +endDateRange} />}
                                ref={calendarRef}
                                renderLabel={(date) => {
                                    let str = ''
                                    let cur = dayjs(date).format('YYYY-MM-DD')
                                    if (calendarData?.list?.[0]?.includes?.(cur)) str = '持有'
                                    if (calendarData?.list?.[1]?.includes?.(cur)) str = '买入'
                                    if (calendarData?.list?.[2]?.includes?.(cur)) str = '卖出'
                                    let colorMap = {持有: '#545968', 买入: '#4BA471', 卖出: '#E74949'}
                                    return <span style={{color: colorMap[str]}}>{str}</span>
                                }}
                                onPageChange={onPageChange}
                            />
                            <div className={styles.calendarLegend}>
                                <div className={styles.calendarLegendItem}>
                                    <div
                                        className={styles.calendarLegendItemIcon}
                                        style={{backgroundColor: '#4BA471'}}
                                    ></div>
                                    <span className={styles.calendarLegendItemText}>买入信号</span>
                                </div>

                                <div className={styles.calendarLegendItem}>
                                    <div
                                        className={styles.calendarLegendItemIcon}
                                        style={{backgroundColor: '#545968'}}
                                    ></div>
                                    <span className={styles.calendarLegendItemText}>持有</span>
                                </div>
                            </div>
                        </div>
                        {btnActive?.calendar?.footer_button && (
                            <div
                                className={styles.IndexDetailCardBtn}
                                onClick={() => {
                                    window.ReactNativeWebView.postMessage(
                                        `url=${JSON.stringify(btnActive?.calendar?.footer_button?.url)}`,
                                    )
                                }}
                            >
                                {btnActive?.calendar?.footer_button?.text}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    ) : null
}

export default IndexDetail

const MonthButton = ({disabled}) => {
    return useMemo(() => {
        let arrowLeft = ArrowLeft({}) || <span></span>
        if (disabled) {
            return React.cloneElement(arrowLeft, {
                color: 'var(--adm-color-light)',
                onClick: (e) => {
                    e.stopPropagation()
                },
            })
        }
        return arrowLeft
    }, [disabled])
}

const YearButton = ({disabled}) => {
    return useMemo(() => {
        let arrowLeftDouble = ArrowLeftDouble({}) || <span></span>
        if (disabled) {
            return React.cloneElement(arrowLeftDouble, {
                color: 'var(--adm-color-light)',
                onClick: (e) => {
                    e.stopPropagation()
                },
            })
        }
        return arrowLeftDouble
    }, [disabled])
}
