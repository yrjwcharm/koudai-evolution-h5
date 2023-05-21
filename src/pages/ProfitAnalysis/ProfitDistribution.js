import React, {useEffect, useRef, useState} from 'react'
import {px as text, px, delMille} from '../../utils/appUtil'
import {Colors, Font, Style} from '../../common/commonStyle'
import {useDispatch} from 'react-redux'
import DayProfit from './DayProfit'
import MonthProfit from './MonthProfit'
import YearProfit from './YearProfit'
import TotalProfit from './TotalProfit'
import {SafeArea} from 'antd-mobile'
import {jump} from '../../utils'
import FixedButton from '../../components/Button/FixedButton'
import {sendPoint} from '../Insurance/utils/sendPoint'
const ProfitDistribution = ({poid = '', differ, type, fund_code = '', headData = {}, chartParams, data = {}}) => {
    const dispatch = useDispatch()
    // const jump = useJump();
    const scrollRef = useRef(null)
    const [{profit_info, profit_acc_info, profit_all}, setHeadData] = useState({})
    const [unitType, setUnitType] = useState('day')
    const [tabs, setTabs] = useState([
        {type: 'day', text: '日收益', checked: true},
        {type: 'month', text: '月收益', checked: false},
        {type: 'year', text: '年收益', checked: false},
        {type: 'all', text: '累计收益', checked: false},
    ])
    useEffect(() => {
        dispatch({type: 'updateUnitType', payload: 'day'})
    }, [])
    useEffect(() => {
        setHeadData(headData)
    }, [headData])
    const selUnitType = (el, i) => {
        scrollRef.current?.setNativeProps({
            scrollEnabled: true,
        })
        setUnitType(el.type)
        tabs.map((item) => {
            item.checked = false
            if (JSON.stringify(el) == JSON.stringify(item)) {
                item.checked = true
            }
        })
        setTabs([...tabs])
        sendPoint({
            pageid:
                i == 0 ? 'day_earnings' : i == 1 ? 'month_earnings' : i == 2 ? 'year_earnings' : 'accumlated_earnings',
            ts: Date.now(),
            chn: 'evolution-h5', // 渠道
            event: 'click',
        })
    }
    const slideFn = (bool) => {
        scrollRef.current?.setNativeProps({
            scrollEnabled: bool,
        })
    }
    return (
        <>
            {/*<SafeArea position='top'>*/}
            <div style={{height: '100%', overflowY: 'scroll'}}>
                <div style={styles.header}>
                    <div style={Style.flexEvenly}>
                        <div style={styles.headerItem}>
                            <span
                                style={{
                                    ...styles.profitLabel,
                                    color:
                                        delMille(profit_info?.value) > 0
                                            ? Colors.red
                                            : delMille(profit_info?.value) < 0
                                            ? Colors.green
                                            : Colors.lightBlackColor,
                                }}
                            >
                                {profit_info?.value}
                            </span>
                            <span style={styles.profitValue}>{profit_info?.text}</span>
                        </div>
                        <div style={styles.headerItem}>
                            <span
                                style={{
                                    ...styles.profitLabel,
                                    color:
                                        delMille(profit_acc_info?.value) > 0
                                            ? Colors.red
                                            : delMille(profit_acc_info?.value) < 0
                                            ? Colors.green
                                            : Colors.lightBlackColor,
                                }}
                            >
                                {profit_acc_info?.value}
                            </span>
                            <span style={styles.profitValue}>{profit_acc_info?.text}</span>
                        </div>
                        <div style={styles.headerItem}>
                            <span
                                style={{
                                    ...styles.profitLabel,
                                    color:
                                        delMille(profit_all?.value) > 0
                                            ? Colors.red
                                            : delMille(profit_all?.value) < 0
                                            ? Colors.green
                                            : Colors.lightBlackColor,
                                }}
                            >
                                {profit_all?.value}
                            </span>
                            <span style={styles.profitValue}>{profit_all?.text}</span>
                        </div>
                    </div>
                </div>
                <div style={{marginTop: px(12)}} />
                <div style={styles.section}>
                    <div style={styles.flexContainer}>
                        <div style={styles.flexViewContainer}>
                            <div style={styles.flexViewWrap}>
                                {tabs?.map((el, index) => {
                                    return (
                                        <div
                                            key={el + `` + index}
                                            style={styles.flexItem}
                                            onClick={() => selUnitType(el, index)}
                                        >
                                            <div style={styles.flexItemView}>
                                                <span
                                                    style={{
                                                        ...styles.flexItemText,
                                                        color: el.checked
                                                            ? Colors.defaultColor
                                                            : Colors.lightBlackColor,
                                                        fontSize: el.checked ? px(32) : px(28),
                                                        fontFamily: el.checked
                                                            ? Font.pingFangMedium
                                                            : Font.pingFangRegular,
                                                        fontWeight: el.checked ? 'bold' : 'normal',
                                                    }}
                                                >
                                                    {el.text}
                                                </span>
                                                <div
                                                    style={{
                                                        ...styles.separator,
                                                        backgroundColor: el.checked
                                                            ? Colors.defaultColor
                                                            : Colors.transparent,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    {unitType == 'day' && (
                        <DayProfit
                            slideFn={slideFn}
                            type={type}
                            differ={differ}
                            poid={poid}
                            unit_type={unitType}
                            fund_code={fund_code}
                        />
                    )}
                    {unitType == 'month' && (
                        <MonthProfit
                            slideFn={slideFn}
                            type={type}
                            poid={poid}
                            unit_type={unitType}
                            fund_code={fund_code}
                        />
                    )}
                    {unitType == 'year' && (
                        <YearProfit
                            slideFn={slideFn}
                            type={type}
                            poid={poid}
                            unit_type={unitType}
                            fund_code={fund_code}
                        />
                    )}
                    {unitType == 'all' && (
                        <TotalProfit type={type} poid={poid} unit_type={unitType} fund_code={fund_code} />
                    )}
                </div>
            </div>
            {Object.keys(data).length > 0 && (
                <FixedButton
                    title={data?.text}
                    onPress={() => {
                        jump(data?.url)
                    }}
                />
            )}
        </>
    )
}

export default ProfitDistribution
const styles = {
    container: {
        backgroundColor: Colors.bgColor,
    },
    flexContainer: {
        paddingLeft: px(24),
        paddingRight: px(24),
    },
    flexViewContainer: {
        height: px(78),
        position: 'relative',
        justifyContent: 'center',
        borderBottomWidth: 0.5,
        borderBottomStyle: 'solid',
        borderBottomColor: '#E9EAEF',
    },
    flexViewWrap: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    flexItem: {
        flex: 1,
    },
    separator: {
        height: px(4),
        borderRadius: px(2),
        width: px(44),
        position: 'absolute',
        bottom: 0,
    },
    flexItemView: {
        display: 'flex',
        height: px(78),
        justifyContent: 'center',
        alignItems: 'center',
    },
    flexItemText: {
        fontFamily: Font.pingFangRegular,
        fontWeight: 'normal',
        color: Colors.lightBlackColor,
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: px(10),
        height: px(142),
        background: `linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 100%)`,
        boxShadow: `0px 8px 20px 0px rgba(170,170,170,0.102)`,
    },
    headerItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    profitLabel: {
        fontSize: px(30),
        fontFamily: Font.numMedium,
        fontWeight: '500',
    },
    profitValue: {
        marginTop: px(12),
        fontSize: px(22),
        fontFamily: Font.pingFangRegular,
        fontWeight: 'normal',
        color: Colors.lightBlackColor,
    },
    borderStyle: {
        borderTopLeftRadius: px(10),
        borderTopRightRadius: px(10),
    },
    section: {
        flex: 1,
        boxShadow: `0px 8px 20px 0px rgba(170,170,170,0.102)`,
        background: `linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 100%)`,
        borderRadius: px(10),
    },
    assetTrends: {
        paddingVertical: px(24),
        backgroundColor: '#fff',
        borderRadius: px(12),
    },
    cardTitle: {
        fontSize: px(26),
        lineHeight: px(36),
        color: '#121D3A',
        fontWeight: 'bold',
        // paddingHorizontal: px(32),
        paddingLeft: px(32),
        paddingRight: px(32),
    },
}
