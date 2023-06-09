/*
 * @Date: 2022/9/30 13:25
 * @Author: yanruifeng
 * @Description: 日收益
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {Colors, Font, Style} from '../../common/commonStyle'
import {isEmpty, isIphoneX} from '../../utils/appUtil'
import dayjs from 'dayjs'
import {compareDate, delMille} from '../../utils/appUtil'
import RenderList from './components/RenderList'
import {getStyles} from './styles/getStyle'
import ChartHeader from './components/ChartHeader'
import {getChartData} from './services'
import EmptyData from './components/EmptyData'
import {jump, px} from '../../utils'
// import RNEChartsPro from 'react-native-echarts-pro';
const DayProfit = React.memo(({poid, fund_code, type, unit_type, differ = 0, slideFn}) => {
    const [xAxisData, setXAxisData] = useState([])
    const [dataAxis, setDataAxis] = useState([])
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isCalendar, setIsCalendar] = useState(true)
    const [isBarChart, setIsBarChart] = useState(false)
    const [diff, setDiff] = useState(differ)
    const [date, setDate] = useState(dayjs())
    const [currentDay] = useState(dayjs().format('YYYY-MM-DD'))
    const week = useRef(['日', '一', '二', '三', '四', '五', '六'])
    const [selCurDate, setSelCurDate] = useState('')
    const [dateArr, setDateArr] = useState([])
    const [isHasData, setIsHasData] = useState(true)
    const myChart = useRef()
    const [profit, setProfit] = useState('')
    const [maxDate, setMaxDate] = useState('')
    const [minDate, setMindDate] = useState('')
    const [unitList, setUnitList] = useState([])
    const [profitDay, setProfitDay] = useState('')
    const [sortProfitList, setSortProfitList] = useState([])
    const barOption = {
        // tooltip: {
        //     trigger: 'axis',
        //     axisPointer: {
        //         type: 'shadow',
        //     },
        // },
        grid: {left: 0, right: 0, bottom: 0, containLabel: true},
        animation: true, //设置动画效果
        animationEasing: 'linear',
        dataZoom: [
            {
                type: 'inside',
                zoomLock: true, //锁定区域禁止缩放(鼠标滚动会缩放,所以禁止)
                throttle: 100, //设置触发视图刷新的频率。单位为毫秒（ms）
            },
        ],
        xAxis: {
            nameLocation: 'end',
            show: false,
            inside: true, //刻度内置
            boundaryGap: true,
            type: 'category',
            axisTick: {
                show: false, // 不显示坐标轴刻度线
                alignWithLabel: true,
            },
            axisLabel: {
                // rotate: 70,
                boundaryGap: false,
                show: true, // 不显示坐标轴上的文字
                color: Colors.lightGrayColor,
                fontFamily: Font.numMedium,
                fontWeight: '500',
                fontSize: 9,
                align: 'left',
                margin: 8,
                showMaxLabel: true,
            },
            axisLine: {
                lineStyle: {
                    color: '#BDC2CC',
                    width: 0.5,
                },
            },
            data: [],
        },
        yAxis: {
            // scale: true,
            boundaryGap: false,
            type: 'value',
            // position: 'left',
            // min: minVal, // 坐标轴刻度最小值。
            // max: maxVal, // 坐标轴刻度最大值。
            splitNumber: 5, // 坐标轴的分割段数，是一个预估值，实际显示会根据数据稍作调整。
            // interval: interval, // 强制设置坐标轴分割间隔。
            axisLabel: {
                show: false, // 不显示坐标轴上的文字
                // margin: 0,
            },
            splitLine: {
                lineStyle: {
                    color: '#E9EAEF',
                    width: 0.5,
                },
                show: true,
            },
            axisLine: {
                show: false,
            },
            axisTick: {
                length: 5,
            },
        },
        series: [
            {
                sampling: 'average',
                large: true,
                type: 'bar',
                barWidth: 6,
                // barGap: '8%',
                itemStyle: {
                    normal: {
                        color: function (params) {
                            //根据数值大小设置相关颜色
                            if (params.value > 0) {
                                return '#E74949'
                            } else {
                                return '#4BA471'
                            }
                        },
                    },
                },
                markPoint: {
                    symbol: 'circle',
                    symbolSize: 8,
                    label: {
                        show: false,
                    },
                    itemStyle: {
                        normal: {
                            color: Colors.red,
                            borderColor: Colors.white,
                            borderWidth: 1, // 标注边线线宽，单位px，默认为1
                        },
                    },
                    data: [],
                },
                data: [],
            },
        ],
    }
    /**
     * 初始化日历日期
     */
    useEffect(() => {
        let didCancel = false
        ;(async () => {
            let dayjs_ = dayjs().add(diff, 'month').startOf('month')
            let dayNums = dayjs_.daysInMonth()
            let weekDay = dayjs_.startOf('month').day()
            let startTrim = weekDay % 7
            let arr = []
            //for循环装载日历数据
            for (let i = 0; i < dayNums; i++) {
                let day = dayjs_.add(i, 'day').format('YYYY-MM-DD')
                let item = {
                    day,
                    profit: '0.00',
                    checked: false,
                }
                arr.push(item)
            }
            //获取当月最后一天是星期几
            let lastWeekDay = dayjs_.add(dayNums - 1, 'day').day()
            let endTrim = 6 - lastWeekDay
            //当月日期开始
            if (startTrim != 7) {
                for (let i = 0; i < startTrim; i++) {
                    arr.unshift({
                        checked: false,
                        profit: '0.00',
                        style: {
                            opacity: 0,
                        },
                        isDisabled: true,
                        day: dayjs_.subtract(i + 1, 'day').format('YYYY-MM-DD'),
                    })
                }
            }
            //当月日期结束
            for (let i = 0; i < endTrim; i++) {
                arr.push({
                    day: dayjs_.add(dayNums + i, 'day').format('YYYY-MM-DD'),
                    checked: false,
                    style: {
                        opacity: 0,
                    },
                    profit: '0.00',
                })
            }
            const res = await getChartData({
                type,
                unit_type,
                unit_value: dayjs_.format('YYYY-MM'),
                poid,
                fund_code,
            })
            //双重for循环判断日历是否超过、小于或等于当前日期
            if (res?.code === '000000') {
                if (!didCancel) {
                    const {profit_data_list = [], unit_list = [], latest_profit_date = ''} = res?.result ?? {}
                    if (unit_list.length > 0) {
                        let min = unit_list[unit_list.length - 1].value
                        let max = unit_list[0].value
                        setMaxDate(max)
                        setMindDate(min)
                        setUnitList(unit_list)
                        let cur = dayjs_.format('YYYY-MM')
                        if (cur > max || cur < min) return
                        for (let i = 0; i < arr.length; i++) {
                            for (let j = 0; j < profit_data_list.length; j++) {
                                //小于当前日期的情况
                                if (compareDate(currentDay, arr[i].day) || currentDay == arr[i].day) {
                                    if (arr[i].day == profit_data_list[j].unit_key) {
                                        arr[i].profit = profit_data_list[j].value
                                    }
                                } else {
                                    delete arr[i].profit
                                }
                            }
                        }

                        let zIndex = arr.findIndex((el) => el.day == latest_profit_date)
                        setDate(dayjs_)
                        profit_data_list.length > 0 ? setIsHasData(true) : setIsHasData(false)
                        arr[zIndex] && (arr[zIndex].checked = true)
                        setDateArr([...arr])
                        setSelCurDate(arr[zIndex]?.day)
                        setProfit(arr[zIndex]?.profit)
                        // //找到选中的日期与当前日期匹配时的索引,默认给予选中绿色状态
                    } else {
                        setIsHasData(false)
                    }
                }
            }
        })()
        return () => (didCancel = true)
    }, [diff, type])
    /**
     * 向上递增一个月
     */
    const addMonth = () => {
        setSelCurDate('')
        //为了防止多次点击导致达到下限时diff变量比上限还大的bug
        setProfitDay('')
        changeDiff(false)
    }
    /**
     * 向下递减一个月
     */
    const subMonth = () => {
        setSelCurDate('')
        //为了防止多次点击导致达到下限时diff变量比下限还小的bug
        setProfitDay('')
        changeDiff(true)
    }
    const changeDiff = (isDecrease) => {
        new Promise((resolve) => {
            setDiff((diff) => {
                isDecrease ? resolve(diff - 1) : resolve(diff + 1)
                return isDecrease ? diff - 1 : diff + 1
            })
        }).then((differ) => {
            let curDate = dayjs().endOf('month').format('YYYY-MM-DD')
            let realDate = dayjs(isDecrease ? minDate : maxDate)
                .endOf('month')
                .format('YYYY-MM-DD')
            let diff = dayjs(realDate).diff(curDate, 'month')
            isDecrease ? differ <= diff && setDiff(diff) : differ >= diff && setDiff(diff)
        })
    }
    /**
     * 通过选中日期获取收益数据
     */
    const getProfitBySelDate = (item) => {
        setSelCurDate(item.day)
        setProfitDay(item.day)
        setProfit(item.profit)
    }
    useEffect(() => {
        dateArr.map((el) => {
            el.checked = false
            if (el.day == selCurDate) {
                el.checked = true
            }
        })
        setDateArr([...dateArr])
    }, [selCurDate])
    const selCalendarType = useCallback(() => {
        slideFn(true)
        setIsCalendar(true)
        setIsBarChart(false)
    }, [])
    const selBarChartType = useCallback(() => {
        setIsCalendar(false)
        setProfitDay('')
        setIsBarChart(true)
    }, [])
    useEffect(() => {
        ;(async () => {
            if (isBarChart) {
                // let dayjs_ = dayjs().add(diff, 'month').startOf('month');
                const res = await getChartData({
                    type,
                    unit_type,
                    unit_value: dayjs().format('YYYY-MM'),
                    poid,
                    fund_code,
                    chart_type: 'square',
                })
                if (res?.code === '000000') {
                    const {profit_data_list = [], latest_profit_date = ''} = res?.result
                    if (profit_data_list.length > 0) {
                        let sortProfitDataList = profit_data_list.sort(
                            (a, b) => new Date(a.unit_key).getTime() - new Date(b.unit_key).getTime(),
                        )
                        let startDate = sortProfitDataList[0].unit_key
                        let lastDate = sortProfitDataList[sortProfitDataList.length - 1].unit_key
                        for (let i = 0; i < 15; i++) {
                            sortProfitDataList.unshift({
                                unit_key: dayjs(startDate)
                                    .add(-(i + 1), 'day')
                                    .format('YYYY-MM-DD'),
                                value: '0.00',
                            })
                            sortProfitDataList.push({
                                unit_key: dayjs(lastDate)
                                    .add(i + 1, 'day')
                                    .format('YYYY-MM-DD'),
                                value: '0.00',
                            })
                        }
                        setSortProfitList(sortProfitDataList)
                    }
                }
            }
        })()
    }, [type, isBarChart])
    useEffect(() => {
        if (isBarChart && selCurDate && sortProfitList.length > 0) {
            const [xAxisData, dataAxis] = [[], []]
            sortProfitList?.map((el) => {
                xAxisData.push(el.unit_key)
                dataAxis.push(delMille(el.value))
            })
            let index = sortProfitList?.findIndex((el) => el.unit_key == (profitDay || selCurDate))
            let [left, center, right] = [index - 15, index, index + 15]
            barOption.dataZoom[0].startValue = left
            barOption.dataZoom[0].endValue = right
            barOption.xAxis.data = xAxisData
            barOption.series[0].data = dataAxis
            barOption.series[0].markPoint.itemStyle = {
                normal: {
                    color: dataAxis[center] > 0 ? Colors.red : dataAxis[center] < 0 ? Colors.green : Colors.transparent,
                    borderColor: Colors.white,
                    borderWidth: 1, // 标注边线线宽，单位px，默认为1
                },
            }
            barOption.series[0].markPoint.data[0] = {
                xAxis: xAxisData[center],
                yAxis: dataAxis[center],
            }
            setStartDate(xAxisData[left])
            setEndDate(xAxisData[right])
            profitDay && setSelCurDate(xAxisData[center])
            profitDay && setProfit(dataAxis[center])
            setXAxisData(xAxisData)
            setDataAxis(dataAxis)
            myChart.current?.setNewOption(barOption, {
                notMerge: false,
                lazyUpdate: true,
                silent: false,
            })
            myChart.current?.setNewOption(barOption, {
                notMerge: false,
                lazyUpdate: true,
                silent: false,
            })
            myChart.current?.setNewOption(barOption, {
                notMerge: false,
                lazyUpdate: true,
                silent: false,
            })
        }
    }, [isBarChart, sortProfitList, profitDay, selCurDate])
    const renderWeek = useMemo(
        () =>
            week.current?.map((el, index) => {
                return (
                    <span style={styles.week} key={el + '' + index}>
                        {el}
                    </span>
                )
            }),
        [],
    )
    const renderCalendar = useMemo(
        () =>
            dateArr?.map((el, index) => {
                const date = dayjs(el?.day).date()
                const {wrapStyle, dayStyle, profitStyle} = getStyles(el, currentDay)
                let todayProfit = el.day == currentDay && el.profit
                return (
                    <div
                        onClick={() => {
                            if (el.day > currentDay || el?.isDisabled || delMille(todayProfit) == 0) return
                            getProfitBySelDate(el)
                        }}
                        key={`${el + '' + index}`}
                    >
                        <div style={{...styles.dateItem, ...el?.style, ...wrapStyle}}>
                            <span style={{...styles.day, ...dayStyle}}>{el.day == currentDay ? '今' : date}</span>
                            {el.day !== currentDay && el?.profit && (
                                <span
                                    style={{
                                        ...styles.profit,
                                        ...profitStyle,
                                        fontSize:
                                            delMille(el.profit) >= 10000 || delMille(el.profit) <= -1000
                                                ? px(8)
                                                : px(10),
                                    }}
                                >
                                    {el?.profit}
                                </span>
                            )}
                            {el.day == currentDay && (delMille(el?.profit) > 0 || delMille(el?.profit) < 0) && (
                                <span
                                    style={{
                                        ...styles.profit,
                                        ...profitStyle,
                                        fontSize:
                                            delMille(el.profit) >= 10000 || delMille(el.profit) <= -10000
                                                ? px(8)
                                                : px(10),
                                    }}
                                >
                                    {el?.profit}
                                </span>
                            )}
                        </div>
                    </div>
                )
            }),
        [dateArr],
    )
    // const renderBarChart = useCallback(
    //     (xAxisData, minDate) => {
    //         return (
    //             <RNEChartsPro
    //                 onDataZoom={(result, option) => {
    //                     slideFn(false);
    //                     const {startValue} = option.dataZoom[0];
    //                     let center = startValue + 15;
    //                     //前端
    //                     let min = dayjs(minDate).format('YYYY-MM-DD');
    //                     if (xAxisData[center] < min) return;
    //                     let curDate = dayjs(xAxisData[center]).endOf('month').format('YYYY-MM-DD');
    //                     let realDate = dayjs().endOf('month').format('YYYY-MM-DD');
    //                     let diff = dayjs(realDate).diff(curDate, 'month');
    //                     setDiff(-diff || 0);
    //                     setProfitDay(xAxisData[center]);
    //                 }}
    //                 onFinished={() => {
    //                     slideFn(true);
    //                 }}
    //                 webViewSettings={{androidLayerType: 'software'}}
    //                 legendSelectChanged={(result) => {}}
    //                 onPress={(result) => {}}
    //                 ref={myChart}
    //                 width={deviceWidth - px(58)}
    //                 height={px(300)}
    //                 option={barOption}
    //             />
    //         );
    //     },
    //     [isBarChart]
    // );
    return (
        <div style={styles.container}>
            {/*<ScrollView showsVerticalScrollIndicator={false}>*/}
            <ChartHeader
                selCalendarType={selCalendarType}
                selBarChartType={selBarChartType}
                isCalendar={isCalendar}
                isBarChart={isBarChart}
                subMonth={subMonth}
                addMonth={addMonth}
                maxDate={maxDate}
                minDate={minDate}
                filterDate={date}
                date={date.month() + 1 + `月`}
            />
            {isHasData ? (
                <>
                    {isCalendar && (
                        <div style={{marginTop: px(6)}}>
                            <div style={styles.weekFlex}>{renderWeek}</div>
                            <div style={styles.dateWrap}>{renderCalendar}</div>
                        </div>
                    )}
                    {/*{isBarChart && (*/}
                    {/*    <div style={styles.chartContainer}>*/}
                    {/*        <div style={styles.separatorView}>*/}
                    {/*            <span*/}
                    {/*                style={[*/}
                    {/*                    styles.benefit,*/}
                    {/*                    {*/}
                    {/*                        textAlign: 'center',*/}
                    {/*                        color:*/}
                    {/*                            delMille(profit) > 0*/}
                    {/*                                ? Colors.red*/}
                    {/*                                : delMille(profit) < 0*/}
                    {/*                                ? Colors.green*/}
                    {/*                                : Colors.lightGrayColor,*/}
                    {/*                    },*/}
                    {/*                ]}>*/}
                    {/*                {profit}*/}
                    {/*            </span>*/}
                    {/*            <div style={styles.dateView}>*/}
                    {/*                <span style={styles.date}>{selCurDate}</span>*/}
                    {/*            </div>*/}
                    {/*        </div>*/}

                    {/*        <div style={{marginTop: px(15), overflow: 'hidden'}}>*/}
                    {/*            {renderBarChart(xAxisData, minDate)}*/}
                    {/*        </div>*/}

                    {/*        <div style={styles.separator} />*/}
                    {/*    </div>*/}
                    {/*)}*/}
                    {/*{isBarChart && (*/}
                    {/*    <div style={[Style.flexBetween]}>*/}
                    {/*        <span style={styles.chartDate}>{startDate}</span>*/}
                    {/*        <span style={styles.chartDate}>{endDate}</span>*/}
                    {/*    </div>*/}
                    {/*)}*/}
                    <RenderList
                        curDate={selCurDate}
                        type={type}
                        poid={poid}
                        fund_code={fund_code}
                        unitType={unit_type}
                    />
                </>
            ) : (
                <EmptyData />
            )}
            {/*</ScrollView>*/}
        </div>
    )
})
export default DayProfit
const styles = {
    chartDate: {
        fontSize: px(9),
        fontFamily: Font.numMedium,
        fontWeight: '500',
        color: Colors.lightGrayColor,
    },
    benefit: {
        fontSize: px(16),
        fontFamily: Font.numFontFamily,
        color: Colors.green,
    },
    dateView: {
        marginTop: px(4),
        width: px(74),
        height: px(18),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.bgColor,
        borderRadius: px(20),
    },
    date: {
        fontSize: px(10),
        fontFamily: Font.numMedium,
        fontWeight: '500',
        color: Colors.lightGrayColor,
    },
    chartContainer: {
        position: 'relative',
        width: '100%',
        height: px(300),
        alignItems: 'center',
        justifyContent: 'center',
    },
    separatorView: {
        position: 'absolute',
        top: px(12),
    },
    separator: {
        position: 'absolute',
        height: px(240),
        top: px(52),
        zIndex: -9999,
        borderStyle: 'dashed',
        borderColor: '#9AA0B1',
        borderWidth: 0.5,
        borderRadius: 0.5,
    },
    container: {
        paddingTop: px(16),
        paddingBottom: px(20),
        // paddingHorizontal: px(24),
        paddingLeft: px(12),
        paddingRight: px(12),
        backgroundColor: Colors.white,
        borderBottomLeftRadius: px(5),
        borderBottomRightRadius: px(5),
        marginBottom: isIphoneX() ? px(58) : px(48),
        minHeight: px(500),
    },
    dateWrap: {
        marginTop: px(8),
        ...Style.flexBetween,
        flexWrap: 'wrap',
    },
    dateItem: {
        width: window.innerWidth / 8.5,
        height: px(44),
        // justifyContent: 'center',
        // alignItems: 'center',
        marginBottom: px(2),
        ...Style.flexCenter,
        flexDirection: 'column',
        borderRadius: px(4),
        backgroundColor: Colors.inputBg,
    },
    day: {
        fontSize: px(13),
        fontFamily: Font.numMedium,
        fontWeight: '500',
        color: Colors.defaultColor,
    },
    profit: {
        fontSize: px(10),
        fontFamily: Font.numMedium,
        fontWeight: '500',
        color: Colors.lightGrayColor,
    },
    chartHeader: {},
    weekFlex: {
        display: 'flex',
        // paddingHorizontal: px(32),
        paddingLeft: px(16),
        paddingRight: px(16),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    week: {
        // fontSize: Font.textH3,
        fontSize: px(12),
        color: Colors.lightGrayColor,
    },
}
