/*
 * @Date: 2021-01-27 18:11:14
 * @Author: dx
 * @LastEditors: dx
 * @LastEditTime: 2021-11-03 19:33:27
 * @Description: 持有基金
 */
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Swiper, Tabs, PullToRefresh, SpinLoading} from 'antd-mobile'

import FontAwesome from 'react-native-vector-icons/dist/FontAwesome'
import {jump} from '~/utils'
import {Colors, Style} from '../../common/commonStyle'

import Notice from '~/pages/Trade/components/Notice'
import Empty from '~/pages/Trade/components/EmptyTip'
import QueryString from 'qs'
import http from '~/service'

import styles from './HoldingFund.module.scss'

const RatioColor = [
    '#E1645C',
    '#6694F3',
    '#F8A840',
    '#CC8FDD',
    '#5DC162',
    '#C7AC6B',
    '#62C4C7',
    '#E97FAD',
    '#C2E07F',
    '#B1B4C5',
    '#E78B61',
    '#8683C9',
    '#EBDD69',
]

function ActivityIndicator({color, style}) {
    return (
        <div style={merge([style, {display: 'flex', justifyContent: 'center', alignItems: 'center'}])}>
            <SpinLoading color={color || Colors.brandColor} />
        </div>
    )
}

const merge = (list) => Object.assign({}, ...list)
const HoldingFund = ({navigation, route}) => {
    const params = QueryString.parse(window.location.href.split('?')[1]) || {}
    const {poid = 'X00F000003'} = params
    const urlRef = useRef('')
    const [emptyTip, setEmptyTip] = useState('')
    const [tabs, setTabs] = useState([])
    const [tradeTip, setTradeTip] = useState('')
    const [curTab, setCurTab] = useState(0)
    const [list1, setList1] = useState([])
    const [list2, setList2] = useState([])
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    const scrollTab = useRef()
    const swiperRef = useRef()

    const init = () => {
        http.get(
            curTab === 0 ? '/portfolio/funds/user_holding/20210101' : '/portfolio/funds/user_confirming/20210101',
            {
                poid: poid || 'X00F000003',
            },
        ).then((res) => {
            if (res.code === '000000') {
                window.document.title = res.result.title || '持有基金'

                setTabs((prev) => (prev.length > 0 ? prev : res.result.tabs))
                setEmptyTip(res.result.tip || '')
                if (res.result.processing_info) {
                    setTradeTip(res.result.processing_info)
                }
                curTab === 0 ? setList1(res.result.list || []) : setList2(res.result.list || [])
                urlRef.current = res.result.url
            }
            setLoading(false)
            setRefreshing(false)
        })
    }

    const getColor = useCallback((t) => {
        if (!t) {
            return Colors.defaultColor
        }
        if (parseFloat(t.replace(/,/g, '')) < 0) {
            return Colors.green
        } else if (parseFloat(t.replace(/,/g, '')) === 0) {
            return Colors.defaultColor
        } else {
            return Colors.red
        }
    }, [])
    const onRefresh = useCallback(() => {
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curTab])

    const renderContent = useCallback(
        (current) => {
            return (
                <>
                    {loading && (
                        <ActivityIndicator
                            color={Colors.brandColor}
                            style={{width: '100vw', height: 'calc(100vh - 42px)'}}
                        />
                    )}
                    {current === 1 && tradeTip ? <Notice content={tradeTip} /> : null}
                    <div className={styles.subContainer}>
                        {(current === 0 ? list1 : list2)?.map((item, index) => {
                            return (
                                <div key={`type${index}`} style={{marginBottom: 8}}>
                                    <div className={styles.titleContainer} style={Style.flexRow}>
                                        <div
                                            className={styles.circle}
                                            style={{backgroundColor: item.color || RatioColor[index]}}
                                        />
                                        <span
                                            className={styles.name}
                                            style={{color: item.color || RatioColor[index], fontWeight: '500'}}
                                        >
                                            {item.name}
                                        </span>
                                        {current === 0 && (
                                            <span
                                                className={styles.numStyle}
                                                style={{color: item.color || RatioColor[index]}}
                                            >
                                                {item.percent < 0.01 ? '<0.01' : item.percent}%
                                            </span>
                                        )}
                                    </div>
                                    {item?.funds?.map((fund, i, arr) => {
                                        return (
                                            <div
                                                onClick={() => {
                                                    // 暂时不能点击
                                                    // global.LogTool('click', 'fund', item.code)
                                                    // jump({path: 'FundDetail', params: {code: fund.code}})
                                                }}
                                                className={styles.fundContainer}
                                                style={merge([
                                                    i === arr.length - 1 ? {marginBottom: 0} : {},
                                                    current === 1 ? {paddingVertical: 12} : {},
                                                ])}
                                                key={`${item.type}${fund.code}${i}`}
                                            >
                                                <div
                                                    className={styles.fundTitle}
                                                    style={merge([
                                                        Style.flexBetween,
                                                        current === 1 ? {marginBottom: 8} : {},
                                                    ])}
                                                >
                                                    <div style={Style.flexRow}>
                                                        <span className={styles.name}>{fund.name}</span>
                                                        {/* <span
                                                        style={[
                                                            styles.numStyle,
                                                            {
                                                                fontFamily: Font.numRegular,
                                                                color: Colors.darkGrayColor,
                                                            },
                                                        ]}>
                                                        ({fund.code})
                                                    </span> */}
                                                    </div>
                                                    <span className={styles.subTitle}>
                                                        {current === 0 ? fund.profit_date : fund.acked_date}
                                                    </span>
                                                </div>
                                                <div style={Style.flexRow}>
                                                    {current === 0 && (
                                                        <div style={{flex: 1}}>
                                                            <div style={merge([Style.flexRow, {marginBottom: 12}])}>
                                                                <span
                                                                    className={styles.subTitle}
                                                                    style={{color: Colors.darkGrayColor}}
                                                                >
                                                                    {'占比'}
                                                                </span>
                                                                <span className={styles.numStyle}>
                                                                    {fund.percent < 0.01 ? '<0.01' : fund.percent}%
                                                                </span>
                                                            </div>
                                                            <div style={Style.flexRow}>
                                                                <span
                                                                    className={styles.subTitle}
                                                                    style={{color: Colors.darkGrayColor}}
                                                                >
                                                                    {'份额(份)'}
                                                                </span>
                                                                <span className={styles.numStyle}>{fund.share}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {current === 0 && (
                                                        <div style={{flex: 1}}>
                                                            <div style={merge([Style.flexRow, {marginBottom: 12}])}>
                                                                <span
                                                                    className={styles.subTitle}
                                                                    style={{color: Colors.darkGrayColor}}
                                                                >
                                                                    {'累计收益(元)'}
                                                                </span>
                                                                <span
                                                                    className={styles.numStyle}
                                                                    style={{color: getColor(fund.profit_acc)}}
                                                                >
                                                                    {fund.profit_acc}
                                                                </span>
                                                            </div>
                                                            <div style={Style.flexRow}>
                                                                <span
                                                                    className={styles.subTitle}
                                                                    style={{color: Colors.darkGrayColor}}
                                                                >
                                                                    {'金额(元)'}
                                                                </span>
                                                                <span className={styles.numStyle}>{fund.amount}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {current === 1 && (
                                                        <>
                                                            <span
                                                                className={styles.subTitle}
                                                                style={{color: Colors.darkGrayColor}}
                                                            >
                                                                {fund.key}
                                                            </span>
                                                            <span className={styles.numStyle}>{fund.val}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                        {/* {list1?.length === 0 && current === 0 && <Empty text={'暂无持有中基金'} />}
                        {list2?.length === 0 && current === 1 && <Empty text={'暂无确认中基金'} />} */}
                        {emptyTip ? <Empty text={emptyTip} /> : null}
                        {current === 0 && (
                            <>
                                <div
                                    className={styles.historyHolding}
                                    style={Style.flexBetween}
                                    onClick={() => {
                                        global.LogTool('click', 'history')
                                        jump(urlRef.current)
                                    }}
                                >
                                    <span className={styles.name} style={{fontWeight: '500'}}>
                                        {'历史持有基金'}
                                    </span>
                                    <FontAwesome name={'angle-right'} size={20} color={Colors.darkGrayColor} />
                                </div>
                                <div
                                    className={styles.historyHolding}
                                    style={Style.flexBetween}
                                    onClick={() => {
                                        global.LogTool('click', 'search')
                                        jump({path: 'FundSearching', params: {poid: poid || ''}})
                                    }}
                                >
                                    <span className={styles.name} style={{fontWeight: '500'}}>
                                        {'基金查询'}
                                    </span>
                                    <FontAwesome name={'angle-right'} size={20} color={Colors.darkGrayColor} />
                                </div>
                            </>
                        )}
                    </div>
                </>
            )
        },
        [list1, list2, getColor, navigation, jump, loading, emptyTip, tradeTip],
    )

    useEffect(() => {
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curTab])

    useEffect(() => {
        if (list1?.length === 0 && curTab === 0) {
            setEmptyTip((prev) => (prev === '' ? '暂无持有中基金' : prev))
        } else if (list2?.length === 0 && curTab === 1) {
            setEmptyTip((prev) => (prev === '' ? '暂无确认中基金' : prev))
        } else {
            setEmptyTip('')
        }
    }, [curTab, list1, list2])

    const handleTabchange = (key) => {
        const tab = tabs.find((it) => it === key)
        const index = tabs.indexOf(tab)

        swiperRef.current?.swipeTo(index)
    }

    const handleSwiperChange = (index) => {
        setCurTab(index)
    }
    if (!tabs || tabs.length === 0) {
        return <ActivityIndicator color={Colors.brandColor} style={{width: '100vw', height: 'calc(100vh - 42px)'}} />
    }

    return (
        <div className={styles.page}>
            <div className={styles.fixHeader}>
                <Tabs activeKey={tabs[curTab]} onChange={handleTabchange}>
                    {tabs.map((item) => (
                        <Tabs.Tab title={item} key={item}></Tabs.Tab>
                    ))}
                </Tabs>
            </div>
            <Swiper
                direction="horizontal"
                loop
                indicator={() => null}
                ref={swiperRef}
                defaultIndex={curTab}
                onIndexChange={handleSwiperChange}
            >
                {[list1, list2].map((item, index) => (
                    <Swiper.Item>
                        <PullToRefresh onRefresh={onRefresh}>
                            <div>{renderContent(index)}</div>
                        </PullToRefresh>
                    </Swiper.Item>
                ))}
            </Swiper>
        </div>
    )
}

export default HoldingFund
