/*
 * @Date: 2022/10/12 17:57
 * @Author: yanruifeng
 * @Description: 累计收益chart图表
 */
import React, {useCallback, useEffect, useState} from 'react'
import {px, px as text} from '../../../utils/appUtil'
import {Colors, Font, Space, Style} from '../../../common/commonStyle'
// import {Modal} from '../../../../components/Modal';
import AntDesign from 'react-native-vector-icons/AntDesign'
import EmptyTip from '../../../components/Empty'
// import {useSafeAreaInsets} from 'react-native-safe-area-context';
import http from '../../../service/index'
import noProfit from '../../../image/icon/noProfit.png'
import BaseAreaChart from './BaseAreaChart'
import {px as p} from '../../../utils'
import {sendPoint} from '../../Insurance/utils/sendPoint'
const AccEarningsCom = React.memo(({fund_code = '', intelligent, poid = '', type, changePeriod}) => {
    // const insets = useSafeAreaInsets();
    const [period, setPeriod] = useState('all')
    const [chartData, setChartData] = useState({})
    const [onlyAll, setOnlyAll] = useState(false)
    const [showEmpty, setShowEmpty] = useState(false)
    // 获取累计收益图数据
    const getChart = useCallback(() => {
        const url = '/profit/user_acc/20210101'
        http.get(url, {
            fund_code,
            period,
            poid,
            type,
            fr: 'profit_tool',
        }).then((res) => {
            setShowEmpty(true)
            if (res.code === '000000') {
                if (res.result.subtabs?.length === 1) {
                    setOnlyAll(true)
                }
                setChartData(res.result)
            }
        })
    }, [fund_code, period, poid, type])
    useEffect(() => {
        getChart()
    }, [getChart])
    // 获取日收益背景颜色
    const getColor = useCallback((t) => {
        if (!t) {
            return Colors.darkGrayColor
        }
        if (parseFloat(t.replace(/,/g, '')) < 0) {
            return Colors.green
        } else if (parseFloat(t.replace(/,/g, '')) === 0) {
            return Colors.darkGrayColor
        } else {
            return Colors.red
        }
    }, [])
    return (
        <>
            {chartData.chart ? (
                <div style={styles.chartContainer}>
                    <p style={{...styles.profitAcc, color: getColor(chartData.profit_acc)}}>{chartData.profit_acc}</p>
                    <div style={{...Style.flexRow, justifyContent: 'center', marginTop: text(4)}}>
                        <span style={styles.chartTitle}>{chartData.title} </span>
                        <div
                            onClick={() => {
                                global.LogTool('click', 'showTips')
                                // Modal.show({content: chartData.desc});
                                sendPoint({
                                    pageid: 'showTips',
                                    ts: Date.now(),
                                    chn: 'evolution-h5', // 渠道
                                    event: 'click',
                                })
                            }}
                        >
                            <AntDesign
                                style={{marginLeft: text(4)}}
                                name={'questioncircleo'}
                                size={11}
                                color={Colors.darkGrayColor}
                            />
                        </div>
                    </div>
                    <div style={styles.chart}>
                        <BaseAreaChart
                            colors={[Colors.red]}
                            areaColors={[Colors.red]}
                            showArea={true}
                            height={px(224)}
                            alias={{value: '累计收益(元)'}}
                            tofixed={0}
                            data={chartData.chart}
                            appendPadding={[16, 20, 20, 16]}
                        />
                    </div>

                    <div style={{...Style.flexRowCenter, paddingTop: text(8)}}>
                        {chartData?.subtabs?.map((tab, index) => {
                            return (
                                <div
                                    key={tab.val + index}
                                    onClick={() => {
                                        global.LogTool('click', tab.val)
                                        !onlyAll && setPeriod(tab.val)
                                        changePeriod(tab.val)
                                    }}
                                    style={{
                                        ...Style.flexCenter,
                                        ...styles.subtab,
                                        ...(period === tab.val || onlyAll ? styles.active : {}),
                                    }}
                                >
                                    <span
                                        style={{
                                            ...styles.tabText,
                                            color:
                                                period === tab.val || onlyAll
                                                    ? Colors.brandColor
                                                    : Colors.lightBlackColor,
                                        }}
                                    >
                                        {tab.key}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ) : showEmpty ? (
                <EmptyTip
                    img={noProfit}
                    style={{paddingTop: text(28), paddingBottom: text(40)}}
                    text={'暂无累计收益数据'}
                    type={'part'}
                />
            ) : null}
        </>
    )
})

export default AccEarningsCom
const styles = {
    chartContainer: {
        paddingTop: text(28),
    },
    tabText: {
        fontSize: p(12),
        color: Colors.defaultColor,
    },
    subTitle: {
        fontSize: text(26),
        // lineHeight: text(36),
        color: Colors.defaultColor,
    },
    profitAcc: {
        fontSize: text(52),
        // lineHeight: text(60),
        fontFamily: Font.numFontFamily,
        // fontWeight: 'bold',
        textAlign: 'center',
    },
    chart: {
        height: px(224),
    },
    subtab: {
        // marginHorizontal: text(14),
        // paddingVertical: text(12),
        // paddingHorizontal: text(24),
        marginLeft: px(14),
        marginRight: px(14),
        paddingLeft: px(24),
        paddingRight: px(24),
        paddingTop: px(12),
        paddingBottom: px(12),
        borderRadius: text(32),
        borderWidth: Space.borderWidth,
        borderColor: Colors.borderColor,
    },
    active: {
        backgroundColor: '#F1F6FF',
        borderColor: '#F1F6FF',
    },
    poHeader: {
        height: text(72),
        paddingLeft: text(24),
        paddingRight: Space.padding,
        backgroundColor: Colors.bgColor,
    },
    poItem: {
        height: text(90),
        paddingLeft: text(24),
        paddingRight: Space.padding,
    },
    tag: {
        // paddingHorizontal: text(12),
        // paddingVertical: text(4),
        paddingLeft: px(12),
        paddingRight: px(12),
        paddingTop: px(4),
        paddingBottom: px(4),
        borderRadius: text(4),
        // fontSize: Font.textSm,
        fontSize: px(22),
        // lineHeight: text(32),
        color: Colors.brandColor,
    },
    bigCell: {
        // paddingVertical: text(12),
        // paddingHorizontal: text(16),
        paddingVertical: px(12),
        paddingHorizontal: px(16),
        textAlign: 'justify',
        flex: 1,
    },
    chartTitle: {
        // fontSize: Font.textSm,
        fontSize: px(24),
        // lineHeight: text(32),
        color: Colors.descColor,
    },
    infoBox: {
        // marginHorizontal: Space.marginAlign,
        // paddingVertical: Space.padding,
        borderColor: Colors.borderColor,
        borderTopWidth: Space.borderWidth,
        marginLeft: px(32),
        marginRight: px(32),
        paddingTop: px(32),
        paddingBottom: px(32),
    },
    bigTitle: {
        // fontSize: Font.textH2,
        fontSize: px(28),
        // lineHeight: text(40),
        color: Colors.defaultColor,
        fontWeight: '500',
    },
    descContent: {
        // fontSize: Font.textH3,
        fontSize: px(24),
        // lineHeight: text(44),
        color: Colors.descColor,
        textAlign: 'justify',
    },
}
