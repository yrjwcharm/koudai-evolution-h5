/*
 * @Date: 2022-07-22 10:38:31
 * @Description: 估值图
 */
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {Space} from 'antd-mobile'
import {QuestionCircleOutline} from 'antd-mobile-icons'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import SliderDate from '../SignalTool/components/SliderDate'
import http from '~/service'
import {inApp, logtool} from '~/utils'
import {cloneDeep} from 'lodash'

const Index = (props) => {
    const {
        apiInfo = {},
        color = ['#E74949', '#545968'],
        height = '4rem',
        percent = false,
        project_id,
        showArea = true,
        tofixed = 2,
    } = props
    const {chart_params, chart_path} = apiInfo
    const [period, setPeriod] = useState(chart_params?.period)
    const [summary, setSummary] = useState([])
    const [tabs, setTabs] = useState([])
    const [legend, setLegend] = useState([])
    const [sliderVal, setSliderVal] = useState('')
    const [periodBar, setPeriodBar] = useState()
    const [compareTable, setCompareTable] = useState()
    const [probabilityTable, setProbabilityTable] = useState()
    const originSummary = useRef()
    const myChart = useRef()
    const chartRef = useRef()
    const timer = useRef()
    const dataRef = useRef()

    const sliderNum = useMemo(() => {
        let num = 0
        if (periodBar) {
            setSliderVal(periodBar.end_date)
            num = dayjs(periodBar.end_date).diff(periodBar.start_date, 'day')
        }
        return num
    }, [periodBar])

    const genChart = ({data = [], negative_potions, point_positions}) => {
        const areaPositions =
            negative_potions?.map((item) => {
                return item.map((v) => ({xAxis: v}))
            }) || []
        const pointPositions =
            point_positions?.map((item) => {
                const {color, coord, size, value, value_color} = item
                return {
                    coord: [coord[0], coord[1]],
                    label: {
                        show: value ? true : false,
                        formatter: value,
                        distance: 6,
                        fontSize: 10,
                        lineHeight: 14,
                        color: '#fff',
                        padding: [2, 3],
                        backgroundColor: value_color,
                        position: 'insideLeft',
                        offset: [0, -12],
                    },
                    symbolSize: size,
                    itemStyle: {
                        color: color,
                    },
                }
            }) || []
        const xAxisIndexs = [0, Math.ceil(data.length / 2), data.length - 1]
        if (myChart.current) {
            myChart.current.clear()
        } else {
            myChart.current = echarts.init(chartRef.current)
        }
        myChart.current.setOption({
            color,
            dataset: {
                dimensions: ['date', 'low_valuation_value', 'high_valuation_value', 'value', 'benchmark'],
                source: data,
            },
            grid: {
                top: 20,
                right: 0,
                bottom: 0,
                left: 0,
                containLabel: true,
            },
            series: [
                {
                    type: 'line',
                    showSymbol: false,
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    lineStyle: {
                        width: 1,
                    },
                    encode: {
                        x: 'date',
                        y: 'value',
                        tooltip: ['date', 'value'],
                    },
                    emphasis: {disabled: true},
                    areaStyle: showArea
                        ? {
                              color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                                  {offset: 0, color: 'rgba(231,73,73,0)'},
                                  {offset: 1, color: 'rgba(231,73,73,0.1)'},
                              ]),
                              origin: 'start',
                          }
                        : undefined,
                    markArea: {
                        data: areaPositions,
                        itemStyle: {
                            color: 'rgba(220,241,217,0.5000)',
                        },
                    },
                    markPoint: {
                        data: pointPositions,
                        symbol: 'circle',
                        symbolSize: 8,
                        itemStyle: {
                            borderWidth: 1,
                            borderColor: '#fff',
                        },
                    },
                },
                {
                    type: 'line',
                    showSymbol: false,
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    lineStyle: {
                        width: 1,
                    },
                    encode: {
                        x: 'date',
                        y: 'benchmark',
                        tooltip: ['date', 'benchmark'],
                    },
                    emphasis: {disabled: true},
                },
                {
                    type: 'line',
                    encode: {
                        x: 'date',
                        y: 'high_valuation_value',
                    },
                    showSymbol: false,
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {offset: 0, color: 'rgba(235,195,195,0)'},
                            {offset: 1, color: 'rgba(255,223,223,0.76)'},
                        ]),
                        origin: 'end',
                    },
                    emphasis: {disabled: true},
                    tooltip: {show: false},
                    lineStyle: {width: 0},
                },
                {
                    type: 'line',
                    encode: {
                        x: 'date',
                        y: 'high_valuation_value',
                    },
                    showSymbol: false,
                    areaStyle: {
                        color: '#FFFAF3',
                        origin: 'start',
                    },
                    emphasis: {disabled: true},
                    tooltip: {show: false},
                    lineStyle: {width: 0},
                },
                {
                    type: 'line',
                    encode: {
                        x: 'date',
                        y: 'low_valuation_value',
                    },
                    showSymbol: false,
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                            {offset: 0, color: '#fff'},
                            {offset: 1, color: '#CDEDCD'},
                        ]),
                        origin: 'start',
                    },
                    emphasis: {disabled: true},
                    tooltip: {show: false},
                    lineStyle: {width: 0},
                },
            ],
            tooltip: {
                show: true,
                showContent: true,
                trigger: 'axis',
                triggerOn: 'mousemove',
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
                axisTick: {show: false},
                boundaryGap: false,
                gridIndex: 0,
                axisLabel: {
                    width: 0,
                    margin: 6,
                    fontSize: 10,
                    lineHeight: 14,
                    fontFamily: 'DINAlternate-Bold',
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
                            fontFamily: 'DINAlternate-Bold',
                            color: '#9397A3',
                        },
                        alignRight: {
                            align: 'right',
                            fontSize: 10,
                            fontFamily: 'DINAlternate-Bold',
                            color: '#9397A3',
                        },
                    },
                },
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        color: '#E2E4EA',
                        type: 'solid',
                        width: 0.5,
                    },
                },
            },
            yAxis: {
                gridIndex: 0,
                splitNumber: 3,
                splitLine: {
                    lineStyle: {
                        color: '#E2E4EA',
                        type: 'dashed',
                        width: 0.5,
                    },
                },
                axisLabel: {
                    fontSize: 10,
                    lineHeight: 14,
                    color: '#9397A3',
                    margin: 4,
                    fontFamily: 'DINAlternate-Bold',
                    formatter: function (value) {
                        if (percent) {
                            return `${(value * 100).toFixed(tofixed)}%`
                        } else if (tofixed) {
                            return (value * 1).toFixed(tofixed)
                        } else {
                            return value
                        }
                    },
                },
            },
        })
        myChart.current.on('updateAxisPointer', handlerUpdateAxisPointer)
        myChart.current.getZr().on('mouseup', (e) => {
            // console.log('---------', e);
            myChart.current.dispatchAction({
                type: 'updateAxisPointer',
                currTrigger: 'leave',
            })
        })
    }

    const handlerUpdateAxisPointer = (e) => {
        // console.log("-----", e);
        const {dataIndex} = e
        if (dataIndex) {
            setSummary((prev) => {
                if (prev?.length === 0) return prev
                const next = cloneDeep(prev)
                next[0].value = dataRef.current[dataIndex].date
                if (next[1]) {
                    next[1].value = `${(dataRef.current[dataIndex].value * 100).toFixed(2)}%`
                }
                if (next[2]) {
                    next[2].value = `${(dataRef.current[dataIndex].benchmark * 100).toFixed(2)}%`
                }
                return next
            })
        } else {
            setSummary(originSummary.current)
        }
    }

    const handlerSliderChange = (val) => {
        if (periodBar) {
            const v = dayjs(periodBar.start_date).add(val, 'day').format('YYYY-MM-DD')
            setSliderVal(v)
            timer.current && clearTimeout(timer.current)
            timer.current = setTimeout(() => {
                getData(v)
            }, 500)
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getData = (_sliderVal) => {
        const params = {...chart_params}
        if (period) params.period = period
        if (_sliderVal) params.start_date = _sliderVal
        http.get(chart_path, params).then((res) => {
            if (res.code === '000000') {
                const {
                    chart,
                    chart_tab,
                    compare_table,
                    label,
                    negative_potions,
                    period_bar,
                    point_positions,
                    probability,
                    sub_tabs,
                } = res.result
                originSummary.current = label?.length > 0 ? label : []
                setSummary(originSummary.current)
                setLegend(chart_tab?.length > 0 ? chart_tab : [])
                setTabs(sub_tabs?.length > 0 ? sub_tabs : [])
                setCompareTable(compare_table)
                setProbabilityTable(probability)
                !periodBar && setPeriodBar(period_bar)
                dataRef.current = chart
                genChart({data: chart, negative_potions, point_positions})
            }
        })
    }

    useEffect(() => {
        getData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chart_params, chart_path, period])

    useEffect(() => {
        return () => {
            myChart.current.off('updateAxisPointer')
        }
    }, [])

    return (
        <div>
            {summary?.length > 0 && (
                <div className="flexBetween" style={{padding: '.24rem .32rem 0'}}>
                    {summary.map((item, index) => {
                        const {color, name, tips, value} = item
                        return (
                            <div className="flexColumn" key={name + index}>
                                <div
                                    className="legendNum"
                                    style={index > 0 ? {color: parseFloat(value) > 0 ? '#E74949' : '#4BA471'} : {}}
                                >
                                    {value}
                                </div>
                                <div className="defaultFlex">
                                    {color ? <div className="legendLine" style={{backgroundColor: color}} /> : null}
                                    <div className="legendKey">{name}</div>
                                    {tips ? (
                                        <QuestionCircleOutline
                                            color="#121D3A"
                                            fontSize={12}
                                            onClick={() =>
                                                inApp &&
                                                window.ReactNativeWebView.postMessage(
                                                    `modalContent=${JSON.stringify(tips)}`,
                                                )
                                            }
                                            style={{marginLeft: '.08rem'}}
                                        />
                                    ) : null}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
            <div id="valuationChart" ref={chartRef} style={{width: '100%', height}} />
            {legend?.length > 0 && (
                <Space className="flexCenter" style={{display: 'flex', paddingTop: '.16rem', '--gap': '.24rem'}}>
                    {legend.map((item, index) => {
                        const {color, name, style} = item
                        return (
                            <div className="defaultFlex" key={name + index}>
                                <div
                                    className="legendShape"
                                    style={{
                                        backgroundColor: color,
                                        borderRadius: style === 1 ? '100%' : 0,
                                    }}
                                />
                                <div className="legendKey">{name}</div>
                            </div>
                        )
                    })}
                </Space>
            )}
            {tabs?.length > 0 && (
                <Space block className="flexCenter" style={{'--gap-horizontal': '.24rem', paddingTop: '.4rem'}}>
                    {tabs.map((tab, i) => (
                        <div
                            className={`flexCenter chartPeriod${tab.value === period ? ' active' : ''}`}
                            key={tab.value + i}
                            onClick={() => {
                                logtool(['PlanEarningsChart_Time', project_id, tab.value])
                                setPeriod(tab.value)
                            }}
                        >
                            {tab.name}
                        </div>
                    ))}
                </Space>
            )}
            {periodBar ? (
                <div style={{marginTop: '.24rem'}}>
                    <SliderDate num={sliderNum} content={sliderVal + '起1年'} onChange={handlerSliderChange} />
                </div>
            ) : null}
            {compareTable ? (
                <div className="tableWrap" style={{margin: '.4rem 0'}}>
                    <div className="tableLeft">
                        {['', ...(compareTable?.td || [])].map((item, idx, arr) => {
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
                        {[compareTable?.th, ...(compareTable?.td || [])].map((item, idx, arr) => {
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
                        })}
                    </div>
                    <div className="tableRight">
                        {[compareTable?.th, ...(compareTable?.td || [])].map((item, idx, arr) => {
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
                        })}
                    </div>
                </div>
            ) : null}
            {probabilityTable ? (
                <div className="rateChart">
                    <div className="rateChartLabelWrap">
                        <div className="rateChartLabelLeft">{probabilityTable?.th_list?.[0]}</div>
                        <div className="rateChartLabelRight">{probabilityTable?.th_list?.[1]}</div>
                    </div>
                    <div className="rateChartContent">
                        {probabilityTable?.td_list?.map((item, idx) => (
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
            ) : null}
        </div>
    )
}

export default Index
