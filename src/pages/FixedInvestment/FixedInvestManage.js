/*
 * @Date: 2022/10/10 09:48
 * @Author: yanruifeng
 * @Description: 定投管理
 */

import React, {useCallback, useEffect, useState} from 'react'
import {px, isEmpty} from '../../utils/appUtil'
import {Colors, Font, Style} from '../../common/commonStyle'
// import {FixedButton} from '../../../components/Button';
import InvestHeader from './components/InvestHeader'
import RenderItem from './components/RenderItem'
import Empty from '../../components/Empty'
import {callFixedHeadDataApi, callHistoryDataApi, callTerminatedFixedApi} from './services'
// import {useFocusEffect} from '@react-navigation/native';
import EmptyData from './components/EmptyData'
import {DotLoading} from 'antd-mobile'
import linearGradient from './assets/lineargradient.png'
import asc from './assets/asc.png'
import des from './assets/desc.png'
import decrease from './assets/decrease.png'
import logo from './assets/logo.png'
import rect from './assets/rect.png'
import label from './assets/label.png'
import more from './assets/more.png'
import FixedButton from '../../components/Button/FixedButton'
import Loading from '../../components/Loading'
import {useHistory} from 'react-router-dom'
import {jump} from '../../utils'
import QueryString from 'qs'
const width = window.innerWidth
const FixedInvestManage = ({route}) => {
    const params = QueryString.parse(window.location.href.split('?')[1]) || {}
    const history = useHistory()
    const [showEmpty, setShowEmpty] = useState(false)
    const [emptyMsg, setEmptyMsg] = useState('')
    const [terminateUrl, setTerminateUrl] = useState({})
    const [data, setData] = useState({})
    const [headList, setHeadList] = useState([])
    const [detail, setDetail] = useState({})
    const [loading, setLoading] = useState(true)
    const {fund_code = '', poid = '', type = 200} = params || {}
    const [unitType, setUnitType] = useState(type)
    const [tabList, setTabList] = useState([])
    const init = useCallback(() => {
        ;(async () => {
            const res = await Promise.all([
                callFixedHeadDataApi({type: unitType, fund_code, poid}),
                callHistoryDataApi({type: unitType, fund_code, poid}),
            ])
            if (res[0].code === '000000' && res[1].code === '000000') {
                const {title = '', detail = {}, head_list = [], tabs = []} = res[0].result || {}
                const {terminate_url} = res[1].result
                let tabList = tabs?.map((el, index) => {
                    return {...el, checked: el.type == unitType ? true : false}
                })
                setTabList(tabList)
                setDetail(detail)
                setHeadList(head_list)
                setData(res[1].result)
                setTerminateUrl(terminate_url)
                setLoading(false)
            }
        })()
    }, [unitType])

    useEffect(() => {
        document.title = '定投管理'
        init()
    }, [init])
    const selTab = (item) => {
        setUnitType(item.type)
        tabList.map((_item) => {
            _item.checked = false
            if (JSON.stringify(_item) == JSON.stringify(item)) {
                _item.checked = true
            }
        })
        setTabList([...tabList])
    }
    const renderEmpty = useCallback(() => {
        return showEmpty ? <Empty text={emptyMsg || '暂无数据'} /> : null
    }, [emptyMsg, showEmpty])
    const executeSort = useCallback(
        (data) => {
            if (data.sort_key) {
                callHistoryDataApi({
                    type: unitType,
                    fund_code,
                    poid,
                    sort_key: data?.sort_key,
                    sort: data?.sort_type == 'asc' ? '' : data?.sort_type == 'desc' ? 'asc' : 'desc',
                }).then((res) => {
                    if (res.code === '000000') {
                        setData(res.result)
                    }
                })
            }
        },
        [unitType],
    )
    return (
        <>
            {loading ? (
                <Loading color={Colors.btnColor} />
            ) : (
                <div style={styles.container}>
                    {headList.length > 0 && (
                        <div>
                            <div
                                style={{
                                    width,
                                    height: px(240),
                                    background: `url(${linearGradient}) no-repeat`,
                                    backgroundSize: 'cover',
                                }}
                            >
                                {Object.keys(detail).length > 0 ? (
                                    <div style={styles.automaticInvestDaysView}>
                                        <span style={styles.prevText}>{detail?.left}</span>
                                        {detail?.days
                                            ?.toString()
                                            .split('')
                                            .map((el, index) => {
                                                return (
                                                    <div style={styles.dayView} key={el + '' + index}>
                                                        <span style={styles.dayText}>{el}</span>
                                                    </div>
                                                )
                                            })}
                                        <span style={{...styles.nextText, marginRight: px(9)}}>{detail?.right}</span>
                                        {!isEmpty(detail?.tip) && (
                                            <div
                                                style={{
                                                    width: px(51),
                                                    height: px(17),
                                                    background: `url(${label}) no-repeat`,
                                                    backgroundSize: 'cover',
                                                }}
                                            >
                                                <div style={styles.labelView}>
                                                    <span style={styles.label}>{detail?.tip}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={styles.emptyInvest}>
                                        <span style={styles.emptyInvestText}>暂未定投，现在开始定投，一点点变富</span>
                                    </div>
                                )}
                            </div>
                            <div style={styles.autoInvestWrap}>
                                <div style={{...styles.autoInvest}}>
                                    <div style={styles.investWrap}>
                                        <div style={styles.investView}>
                                            <div style={styles.itemWrap}>
                                                <span style={styles.investValue}>{headList[0]?.value}</span>
                                                <span style={styles.investLabel}>{headList[0]?.text}</span>
                                            </div>
                                            <div style={styles.itemWrap}>
                                                <span style={styles.investValue}>{headList[1]?.value}</span>
                                                <span style={styles.investLabel}>{headList[1]?.text}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {tabList.length > 0 && (
                        <div style={{width: window.innerWidth - px(16), whiteSpace: 'nowrap'}}>
                            <div style={styles.scroll}>
                                <div style={styles.scrollTab}>
                                    {tabList.map((el, index) => {
                                        return (
                                            <div
                                                key={el + ' ' + index}
                                                onClick={() => {
                                                    selTab(el)
                                                    global.LogTool(
                                                        'click',
                                                        index == 0
                                                            ? 'autoinvestment_manegement_all'
                                                            : index == 1
                                                            ? 'autoinvestment_manegement_fund'
                                                            : index == 2
                                                            ? 'autoinvestment_manegement_portfolio'
                                                            : index == 3
                                                            ? 'Financial_planning'
                                                            : index == 4
                                                            ? 'Private_equity_funds'
                                                            : index == 5
                                                            ? 'Bank_financing'
                                                            : '',
                                                    )
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        ...styles.defaultTab,
                                                        backgroundColor: el.checked ? '#DEE8FF' : '#FFFFFF',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            ...styles.defaultTabText,
                                                            fontFamily: el.checked
                                                                ? Font.pingFangMedium
                                                                : Font.pingFangRegular,
                                                            color: el.checked ? Colors.brandColor : Colors.defaultColor,
                                                        }}
                                                    >
                                                        {el?.text}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                    <InvestHeader
                        style={{marginTop: px(24)}}
                        headList={data?.head_list ?? []}
                        handleSort={executeSort}
                    />
                    {(data?.data_list ?? []).map((el, index) => {
                        return <RenderItem key={index + '' + el} item={el} index={index} />
                    })}
                    {(data?.data_list ?? []).length == 0 && <EmptyData />}
                    {Object.keys(terminateUrl).length > 0 && (
                        <div
                            style={{marginTop: px(20)}}
                            onClick={() => {
                                global.LogTool('click', 'terminatedFixedInvest')
                                jump(terminateUrl.url)
                            }}
                        >
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                <div style={Style.flexRow}>
                                    <span style={styles.termintal}>{terminateUrl.text}</span>
                                    <img src={more} width={px(8)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* {data?.button && Object.keys(data?.button).length > 0 && (
                        <FixedButton
                            title={data?.button?.text}
                            onClick={() => {
                                jump(data?.button?.url)
                            }}
                        />
                    )} */}
                </div>
            )}
        </>
    )
}
export default FixedInvestManage
const styles = {
    container: {
        flex: 1,
        backgroundColor: Colors.bgColor,
        overflowY: 'scroll',
    },
    scroll: {
        display: 'flex',
        flexWrap: 'nowrap',
        overflowX: 'auto',
    },
    emptyInvest: {
        marginLeft: px(32),
        marginTop: px(40),
    },
    emptyInvestText: {
        fontSize: px(32),
        fontFamily: Font.pingFangMedium,
        fontWeight: 'normal',
        color: Colors.white,
    },
    termintal: {
        fontSize: px(24),
        marginRight: px(10),
        fontFamily: Font.pingFangRegular,
        color: '#545968',
    },
    defaultTab: {
        marginRight: px(10),
        paddingLeft: px(24),
        paddingRight: px(24),
        paddingTop: px(12),
        paddingBottom: px(12),
        borderRadius: px(40),
    },
    defaultTabText: {
        fontSize: px(22),
        fontFamily: Font.pingFangRegular,
        fontWeight: 'normal',
        color: Colors.defaultColor,
    },
    activeTabText: {},
    scrollTab: {
        display: 'flex',
        flexDirection: 'row',
        marginLeft: px(32),
        marginTop: px(56),
    },
    itemWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    investWrap: {
        display: 'flex',
        flexDirection: 'column',
        height: px(140),
        paddingLeft: px(122),
        paddingRight: px(122),
        justifyContent: 'center',
    },
    investView: {
        ...Style.flexBetween,
    },
    investLabel: {
        marginTop: px(8),
        fontSize: px(22),
        fontFamily: Font.pingFangRegular,
        fontWeight: 'normal',
        color: Colors.lightBlackColor,
    },
    investValue: {
        fontSize: px(32),
        fontFamily: Font.numMedium,
        fontWeight: '500',
        color: Colors.defaultColor,
    },
    autoInvestWrap: {
        display: 'flex',
        flexDirection: 'row',
        position: 'absolute',
        top: px(124),
        left: 0,
        right: 0,
        bottom: 0,
        height: px(140),
        justifyContent: 'center',
    },
    bottomWrap: {
        ...Style.flexBetween,
    },
    autoInvest: {
        width: window.innerWidth - px(64),
        height: px(140),
        borderRadius: px(12),
        background: `linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 100%)`,
        boxShadow: `0px 8px 20px 0px rgba(170,170,170,0.102)`,
    },
    header: {},
    automaticInvestDaysView: {
        display: 'flex',
        marginLeft: px(32),
        paddingTop: px(40),
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: px(20),
        // fontFamily: 'PingFang SC-中粗体, PingFang SC',
        // fontWeight: 'normal',
        fontFamily: 'PingFang Regular',
        fontWeight: 'bold',
        color: Colors.white,
    },
    prevText: {
        fontSize: px(32),
        marginRight: px(2),
        fontFamily: Font.pingFangMedium,
        fontWeight: 'normal',
        color: Colors.white,
    },
    nextText: {
        marginLeft: px(8),
        fontSize: px(32),
        fontFamily: Font.pingFangMedium,
        fontWeight: 'normal',
        color: Colors.white,
        marginRight: px(18),
    },
    dayView: {
        width: px(30),
        marginLeft: px(6),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: px(44),
        backgroundColor: '#F1F6FF',
        borderRadius: px(4),
    },
    dayText: {
        fontSize: px(32),
        fontFamily: Font.numMedium,
        fontWeight: '500',
        color: '#3978F6',
    },
    labelView: {
        position: 'relative',
        left: px(12),
    },
}
