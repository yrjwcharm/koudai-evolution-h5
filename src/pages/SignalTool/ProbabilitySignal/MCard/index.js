import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import * as echarts from 'echarts'
import './index.css'
import SliderDate from '../../components/SliderDate'
import {CapsuleTabs} from 'antd-mobile'
import http from '../../../../service'
import dayjs from 'dayjs'

const MCard = ({extract = false, index_list = [], dateRangeChange}) => {
    const [active, setActive] = useState(index_list[0]?.id + '')
    const [chartData, setChartData] = useState(null)
    const [sliderVal, setSliderVal] = useState('')

    const chart = useRef(null)
    const sliderDateRef = useRef(null)
    let timer = useRef(null)
    const myChart = useRef(null)

    const sliderNum = useMemo(() => {
        let num = 0
        if (chartData?.period_bar) {
            num = dayjs(chartData?.period_bar.end_date).diff(chartData?.period_bar.start_date, 'day')
        }
        return num
    }, [chartData])

    const handlerActive = (idx) => {
        setActive(idx)
    }

    useEffect(() => {
        if (chart.current && chartData) {
            if (!myChart.current) {
                myChart.current = echarts.init(chart.current)
            } else {
                myChart.current?.clear?.()
            }
            let option = genChartOption({gauge_info: chartData.gauge_info, chartData})
            myChart.current.setOption(option)
        }
    }, [chartData])

    const getChartData = (start_date, afterFn) => {
        let params = {tool_id: 4, index_id: active}
        if (start_date) params.start_date = start_date
        http.get('/tool/signal/chart/20220711', params).then((res) => {
            if (res.code === '000000') {
                setChartData(res.result)
                afterFn?.(res.result)
            }
        })
    }
    useEffect(() => {
        getChartData(null, (data) => {
            setSliderVal(data.period_bar?.end_date)
        })
        sliderDateRef.current.reset()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active])

    useEffect(() => {
        if (sliderVal) {
            dateRangeChange?.([sliderVal, dayjs(sliderVal).add(1, 'year').format('YYYY-MM-DD')])
        }
    }, [dateRangeChange, sliderVal])

    const handlerSliderChange = useCallback(
        (val) => {
            if (chartData?.period_bar) {
                let v = dayjs(chartData.period_bar?.start_date).add(val, 'day').format('YYYY-MM-DD')
                setSliderVal(v)
                // 调用接口
                if (timer.current) {
                    clearTimeout(timer.current)
                    timer.current = null
                }

                timer.current = setTimeout(() => {
                    getChartData(v)
                }, 500)
            }
        },
        // eslint-disable-next-line
        [chartData],
    )

    return (
        <div className={`ProbabilitySignalMainCard ${extract ? '' : 'noExtract'}`}>
            {!extract && (
                <div className="tabsBtnWrap">
                    <CapsuleTabs defaultActiveKey="1" activeKey={active} onChange={handlerActive}>
                        {index_list.map((item) => (
                            <CapsuleTabs.Tab key={item.id} title={item.name} />
                        ))}
                    </CapsuleTabs>
                </div>
            )}
            <div className="chartWrap" style={{height: '468px'}}>
                <div ref={chart} style={{width: '311px', height: '468px', margin: '0 auto'}}></div>
            </div>
            <div className="lengend">
                <div className="lengend1">
                    <div className="lengend1Icon" style={{backgroundColor: chartData?.chart_tab?.[0].color}}></div>
                    <div className="legnend1Text">{chartData?.chart_tab?.[0]?.name}</div>
                </div>
                <div className="lengend2">
                    <div className="lengend2Icon" style={{backgroundColor: chartData?.chart_tab?.[1].color}}></div>
                    <div className="lengend2Text">{chartData?.chart_tab?.[1]?.name}</div>
                </div>
            </div>
            <div className="pointsWrap">
                {chartData?.point_notes?.map((item, idx) => (
                    <div key={idx} className="point" style={{marginLeft: idx > 0 ? '16px' : '0'}}>
                        <div
                            className="pointIcon"
                            style={{backgroundColor: item.color, width: item.size + 'px', height: item.size + 'px'}}
                        ></div>
                        <div className="pointText">{item.name}</div>
                    </div>
                ))}
            </div>
            <div className="sliderWrap">
                <SliderDate
                    num={sliderNum}
                    content={sliderVal + '起1年'}
                    onChange={handlerSliderChange}
                    ref={sliderDateRef}
                />
            </div>

            {!extract && (
                <div className="incomeSum">
                    {chartData?.compare_table?.header_list?.[0]?.tip && (
                        <div className="bubbleWrap">
                            <div
                                className="bubble"
                                dangerouslySetInnerHTML={{__html: chartData?.compare_table?.header_list?.[0]?.tip}}
                            ></div>
                            <div className="triangle"></div>
                        </div>
                    )}
                    <div className="incomeWrap">
                        <div className="incomeItem">
                            <div
                                className="incomeAmount"
                                dangerouslySetInnerHTML={{__html: chartData?.compare_table?.header_list?.[0]?.value}}
                            ></div>
                            <div className="incomeDesc">
                                <div className="incomeIcon" style={{backgroundColor: '#4BA471'}}></div>
                                <div className="incomeDescText">{chartData?.compare_table?.header_list?.[0]?.text}</div>
                            </div>
                        </div>
                        <div className="incomeItem">
                            <div
                                className="incomeAmount"
                                style={{color: '#121D3A'}}
                                dangerouslySetInnerHTML={{__html: chartData?.compare_table?.header_list?.[1]?.value}}
                            ></div>
                            <div className="incomeDesc">
                                <div className="incomeIcon" style={{backgroundColor: '#545968'}}></div>
                                <div className="incomeDescText">{chartData?.compare_table?.header_list?.[1]?.text}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {chartData?.compare_table?.reminder && (
                <div
                    style={{
                        backgroundColor: '#F5F6F7',
                        padding: 12,
                        borderRadius: 16,
                        position: 'relative',
                        marginTop: 16,
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            left: 44,
                            top: -12,
                            width: 0,
                            height: 0,
                            border: '6px solid transparent',
                            borderBottom: '6px solid #F5F6F7',
                        }}
                    />
                    <div
                        style={{color: '#121D3A', fontSize: 12}}
                        dangerouslySetInnerHTML={{__html: chartData?.compare_table?.reminder}}
                    ></div>
                </div>
            )}
            {!extract && (
                <div className="tableWrap">
                    <div className="tableLeft">
                        {['', ...(chartData?.compare_table?.td || [])].map((item, idx, arr) => {
                            let cellStyle = {
                                backgroundColor: idx % 2 === 0 ? '#F5F6F8' : '#fff',
                                height: '48px',
                                borderLeft: '1px solid #E9EAEF',
                            }
                            if (idx === 0) {
                                cellStyle.borderTopLeftRadius = '4px'
                                cellStyle.height = '41px'
                                cellStyle.borderTop = '1px solid #E9EAEF'
                            }
                            if (idx === arr.length - 1) {
                                cellStyle.borderBottomLeftRadius = '4px'
                                cellStyle.borderBottom = '1px solid #E9EAEF'
                            }
                            return (
                                <div
                                    className="tableLeftCell"
                                    style={cellStyle}
                                    key={idx}
                                    dangerouslySetInnerHTML={{__html: idx > 0 ? item[0] : ''}}
                                ></div>
                            )
                        })}
                    </div>
                    <div className="tableMiddle">
                        {[chartData?.compare_table?.th, ...(chartData?.compare_table?.td || [])].map(
                            (item, idx, arr) => {
                                let cellStyle = {height: '48px'}
                                if (idx === 0) {
                                    cellStyle.borderTopLeftRadius = '4px'
                                    cellStyle.borderTopRightRadius = '4px'
                                    cellStyle.height = '45px'
                                    cellStyle.background = 'linear-gradient(180deg, #FDA4A4 0%, #FEE6E4 100%)'
                                    cellStyle.fontWeight = 'bold'
                                    cellStyle.fontSize = '12px'
                                    cellStyle.lineHeight = '17px'
                                } else {
                                    cellStyle.backgroundColor = idx % 2 === 0 ? '#FFE6E4' : '#fff'
                                }
                                if (idx === arr.length - 1) {
                                    cellStyle.borderBottomLeftRadius = '4px'
                                    cellStyle.borderBottomRightRadius = '4px'
                                    cellStyle.height = '54px'
                                }
                                return (
                                    <div
                                        className="tableMiddleCell"
                                        style={cellStyle}
                                        key={idx}
                                        dangerouslySetInnerHTML={{__html: item?.[1]}}
                                    ></div>
                                )
                            },
                        )}
                    </div>
                    <div className="tableRight">
                        {[chartData?.compare_table?.th, ...(chartData?.compare_table?.td || [])].map(
                            (item, idx, arr) => {
                                let cellStyle = {
                                    backgroundColor: idx % 2 === 0 ? '#F5F6F8' : '#fff',
                                    height: '48px',
                                    borderRight: '1px solid #E9EAEF',
                                }
                                if (idx === 0) {
                                    cellStyle.borderTopRightRadius = '4px'
                                    cellStyle.height = '41px'
                                    cellStyle.fontWeight = 'bold'
                                    cellStyle.borderTop = '1px solid #E9EAEF'
                                }
                                if (idx === arr.length - 1) {
                                    cellStyle.borderBottomRightRadius = '4px'
                                    cellStyle.borderBottom = '1px solid #E9EAEF'
                                }
                                return (
                                    <div
                                        className="tableRightCell"
                                        style={cellStyle}
                                        key={idx}
                                        dangerouslySetInnerHTML={{__html: item?.[2]}}
                                    ></div>
                                )
                            },
                        )}
                    </div>
                </div>
            )}

            {!extract && (
                <div className="rateChart">
                    <div className="rateChartLabelWrap">
                        <div className="rateChartLabelLeft">{chartData?.probability_table?.th_list?.[0]}</div>
                        <div className="rateChartLabelRight">{chartData?.probability_table?.th_list?.[1]}</div>
                    </div>
                    <div className="rateChartContent">
                        {chartData?.probability_table?.td_list.map((item, idx) => (
                            <div key={idx} className="rateChartItem">
                                <div className="rateChartTitleLeft">{item[0]}</div>
                                <div className="rateChartValueWrap">
                                    <div className="rateChartValueInner" style={{width: item[1] + '%'}}></div>
                                </div>
                                <div className="rateChartTitleRight">{item[1]}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {chartData?.compare_table.risk_tip && (
                <div style={{fontSize: 11, color: '#9AA0B1', marginTop: 16}}>{chartData?.compare_table.risk_tip}</div>
            )}
        </div>
    )
}

export default MCard
// {_chart, _desc}
const genChartOption = ({gauge_info, chartData}) => {
    let ticks = gauge_info.chart.ticks.reduce((memo, cur) => {
        memo[cur[0] * 100] = cur[1]
        return memo
    }, {})
    let xAxisIndexs = [0, Math.ceil(chartData.chart.length / 2), chartData.chart.length - 1]

    let badTickValue = gauge_info.chart?.ticks?.[1]?.[0]
    let axisLabelDistance = badTickValue > 0.3 && badTickValue < 0.7 ? 50 : 60

    let linePositions =
        chartData.line_positions?.map((item) => {
            return [
                {
                    xAxis: 0,
                    yAxis: item.value + '',
                    label: {
                        formatter: item.name,
                        distance: [0, -9],
                        fontSize: 11,
                        position: 'middle',
                        color: '#fff',
                        lineHeight: 15,
                        backgroundColor: 'rgba(75, 164, 113,0.7)',
                        padding: [2, 12],
                        borderRadius: 4,
                    },
                },
                {
                    xAxis: 'max',
                    yAxis: item.value + '',
                },
            ]
        }) || []

    let pointPositions =
        chartData.point_positions.map((item) => {
            return {
                coord: [item.coord[0], item.coord[1] + ''],
                symbolSize: item.size,
                itemStyle: {
                    color: item.color,
                },
            }
        }) || []

    return {
        color: [
            '#545968',
            '#FF7D41',
            'rgba(225,100,92,0.3)',
            'rgba(102,148,243,0.3)',
            'rgba(248,168,64,0.3)',
            'rgba(204, 143, 221,0.3)',
            'rgba(93, 193, 98,0.3)',
            'rgba(199, 172, 107,0.3)',
            'rgba(98, 196, 199,0.3)',
            'rgba(233, 127, 173,0.3)',
            'rgba(194, 224, 127,0.3)',
            'rgba(177, 180, 197, 0.3)',
            'rgba(231, 139, 97, 0.3)',
            'rgba(134, 131, 201, 0.3)',
            'rgba(235, 221, 105, 0.3)',
        ],
        series: [
            {
                type: 'line',
                showSymbol: false,
                lineStyle: {
                    width: 1,
                },
                encode: {
                    x: 'date',
                    y: 'value',
                    tooltip: ['date', 'value'],
                },
                areaStyle: {
                    color: '#F2F2F3',
                },
                emphasis: {
                    disabled: true,
                },
                markLine: {
                    symbol: 'none',
                    data: [
                        ...linePositions,
                        [
                            {
                                x: 155,
                                y: 200,
                                symbol: 'circle',
                                symbolSize: 4,
                                lineStyle: {
                                    color: '#000',
                                },
                            },
                            {
                                x: 155,
                                y: 250,
                            },
                        ],
                        [
                            {
                                x: 155,
                                y: 250,
                                lineStyle: {
                                    color: '#000',
                                },
                            },
                            {
                                xAxis: 'max',
                                y: 250,
                            },
                        ],
                        [
                            {
                                xAxis: 'max',
                                y: 250,
                                lineStyle: {
                                    color: '#000',
                                },
                            },
                            {
                                xAxis: 'max',
                                y: 447,
                            },
                        ],
                    ],
                    lineStyle: {
                        width: 1,
                        color: '#9AA0B1',
                        type: 'solid',
                    },
                    emphasis: {
                        disabled: true,
                    },
                    animationDuration: function (idx) {
                        let ls = linePositions.length - 1
                        let l = (idx - ls - 1) * 120
                        let dur = idx > ls ? 300 + l : 800
                        return dur
                    },
                    animationDelay: function (idx) {
                        // 越往后的数据时长越大
                        let ls = linePositions.length - 1
                        let l = (idx - ls - 1) * 120
                        return idx > ls ? (idx - ls - 1) * 300 + l : 0
                    },
                },
                markPoint: {
                    data: pointPositions,
                    symbol: 'circle',
                    symbolSize: 8,
                    itemStyle: {
                        color: '#4BA471',
                        borderWidth: 1,
                        borderColor: '#fff',
                    },
                },
            },
            {
                type: 'gauge',
                center: ['50%', 135],
                radius: 105,
                min: 0,
                max: 100,
                splitNumber: 50,
                progress: {
                    show: true,
                    width: 36,
                },
                pointer: {
                    show: false,
                },
                emphasis: {
                    disabled: true,
                },
                axisLine: {
                    lineStyle: {
                        width: 36,
                        color: [
                            [
                                1,
                                {
                                    type: 'radial',
                                    x: 0.5,
                                    y: 0.6,
                                    r: 0.65,
                                    colorStops: [
                                        {
                                            offset: 0.55,
                                            color: '#F7F8F9', // 0% 处的颜色
                                        },
                                        {
                                            offset: 1,
                                            color: '#fff', // 100% 处的颜色
                                        },
                                    ],
                                    global: false, // 缺省为 false
                                },
                            ],
                        ],
                    },
                },
                axisTick: {
                    distance: -46,
                    splitNumber: 1,
                    length: 5,
                    lineStyle: {
                        width: 1,
                        color: '#E2E4EA',
                    },
                },
                splitLine: {
                    show: false,
                },
                axisLabel: {
                    show: true,
                    distance: -axisLabelDistance,
                    color: '#9AA1B2',
                    formatter: (val) => {
                        return ticks[val] === '-' ? '' : ticks[val] || ''
                    },
                    padding: [0, 0, 0, 0],
                    fontSize: 12,
                },
                anchor: {
                    show: false,
                },
                title: {
                    show: false,
                },

                data: gauge_info.chart.value_area.map((value, idx, arr) => {
                    return {
                        value: value * 100 >= 100 ? 99.99 : value * 100,
                        itemStyle: {
                            color:
                                idx === 0
                                    ? arr.length > 1
                                        ? '#f9fafa'
                                        : new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                              {offset: 0, color: '#F7F7F9'},
                                              {offset: 1, color: '#E6E7EB'},
                                          ])
                                    : new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                          {
                                              offset: +arr[idx - 1],
                                              color: '#E6F6E8',
                                          },
                                          {offset: +value, color: '#BCEEBF'},
                                      ]),
                        },
                        detail: {
                            show: idx === 0,
                            valueAnimation: true,
                            width: 150,
                            offsetCenter: [0, 10],
                            formatter: gauge_info.title || ' ',
                            rich: {
                                d: {
                                    lineHeight: 7,
                                },
                                a: {
                                    color: '#4BA471',
                                    fontWeight: '500',
                                    fontSize: 24,
                                    lineHeight: 34,
                                },
                                b: {
                                    fontSize: 12,
                                    color: '#121D3A',
                                    lineHeight: 17,
                                },
                                c: {
                                    fontSize: 16,
                                    color: '#E74949',
                                    lineHeight: 22,
                                    fontFamily: 'DIN Alternate-Bold, DIN Alternate',
                                },
                                tgray: {
                                    color: '#545968',
                                    fontWeight: '500',
                                    fontSize: 24,
                                    lineHeight: 34,
                                },
                                sgray: {
                                    fontSize: 16,
                                    color: '#545968',
                                    lineHeight: 22,
                                    fontFamily: 'DIN Alternate-Bold, DIN Alternate',
                                },
                            },
                        },
                    }
                }),
            },
            {
                type: 'gauge',
                center: ['50%', 135],
                radius: 105,
                emphasis: {
                    disabled: true,
                },
                min: 0,
                max: 100,
                progress: {
                    show: true,
                    width: 6,
                },
                pointer: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        width: 6,
                        color: [[1, '#E2E4EA']],
                    },
                },
                axisTick: {
                    show: false,
                },
                splitLine: {
                    show: false,
                },
                axisLabel: {
                    show: false,
                },
                detail: {
                    show: false,
                },
                data: gauge_info.chart.value_area.map((value, idx) => {
                    return {
                        value: value * 100 >= 100 ? 99.99 : value * 100,
                        itemStyle: {
                            color: idx === 0 ? '#949AA8' : '#2CC133',
                        },
                    }
                }),
            },
        ],
        tooltip: {
            show: true,
            trigger: 'axis',
            position: function (point, params, dom, rect, size) {
                // 固定在顶部
                return {left: point[0] - size.contentSize[0] / 2, bottom: 0}
            },
            formatter: '{b}',
            backgroundColor: '#6e7079',
            borderColor: '#6e7079',
            padding: [2, 4],
            textStyle: {
                fontSize: 10,
                color: '#fff',
            },
        },
        xAxis: {
            type: 'category',
            axisTick: {show: false, alignWithLabel: false},
            boundaryGap: false,
            axisLabel: {
                width: 0,
                fontSize: 10,
                fontFamily: 'DIN Alternate-Bold, DIN Alternate',
                color: '#9397A3',
                interval: function (index) {
                    return xAxisIndexs.includes(index)
                },
                formatter: function (value, index) {
                    switch (index) {
                        case 0:
                            return '{alignLeft|' + value + '}'
                        case xAxisIndexs[2]:
                            return '{alignRight|' + value + '}'
                        default:
                            return value
                    }
                },
                rich: {
                    alignLeft: {
                        align: 'left',
                        fontSize: 10,
                        fontFamily: 'DIN Alternate-Bold, DIN Alternate',
                        color: '#9397A3',
                    },
                    alignRight: {
                        align: 'right',
                        fontSize: 10,
                        fontFamily: 'DIN Alternate-Bold, DIN Alternate',
                        color: '#9397A3',
                    },
                },
            },
            axisLine: {
                lineStyle: {
                    color: '#E2E4EA',
                },
            },
        },
        yAxis: {
            gridIndex: 0,
            splitNumber: 5,
            splitLine: {
                lineStyle: {
                    color: '#E2E4EA',
                    type: 'dashed',
                },
            },
            axisLabel: {
                fontSize: 10,
                color: '#9397A3',
                margin: 10,
                fontFamily: 'DIN Alternate-Bold, DIN Alternate',
                formatter: function (value) {
                    return Math.round(value * 100) + '%'
                },
            },
        },
        grid: {
            bottom: 3,
            left: 'center',
            height: 178,
            width: 305,
            containLabel: true,
        },
        dataset: {
            dimensions: ['date', 'value'],
            source: chartData.chart,
        },
    }
}
