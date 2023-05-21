import {useEffect, useRef} from 'react'
import * as echarts from 'echarts'
import qs from 'qs'

const PanelChartOfTool = () => {
    const panelChartRef = useRef(null)

    useEffect(() => {
        if (panelChartRef.current) {
            let myChart = echarts.init(panelChartRef.current)
            const {data} = qs.parse(window.location.href.split('?')[1])
            let option = genChartOption(JSON.parse(data))
            myChart.setOption(option)
        }
    }, [])

    const genChartOption = ({chart, desc}) => {
        let ticks = chart.ticks.reduce((memo, cur) => {
            memo[cur[0] * 100] = cur[1]
            return memo
        }, {})
        let valueArea = chart.value_area

        let badTickValue = chart?.ticks?.[1]?.[0]
        let axisLabelDistance = badTickValue > 0.3 && badTickValue < 0.7 ? 4 : 0

        return {
            backgroundColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {offset: 0, color: '#fff'},
                {offset: 1, color: '#FBFBFC'},
            ]),
            series: [
                {
                    type: 'gauge',
                    center: ['50%', '50%'],
                    radius: '70%',
                    min: 0,
                    max: 100,
                    splitNumber: 50,
                    progress: {
                        show: true,
                        width: 28,
                    },
                    pointer: {
                        show: false,
                    },
                    emphasis: {
                        disabled: true,
                    },
                    axisLine: {
                        lineStyle: {
                            width: 28,
                            color: [[1, '#F8F9FA']],
                        },
                    },
                    axisTick: {
                        distance: -40,
                        splitNumber: 1,
                        lineStyle: {
                            width: 1,
                            color: '#E2E4EA',
                        },
                    },
                    splitLine: {
                        show: true,
                        distance: -45,
                        length: 0,
                        lineStyle: {
                            width: 1,
                            color: '#E2E4EA',
                        },
                    },
                    axisLabel: {
                        show: true,
                        distance: axisLabelDistance,
                        color: '#9AA1B2',
                        formatter: (val) => {
                            return ticks[val] === '-' ? '' : ticks[val] || ''
                        },
                        padding: [0, 0, 0, 0],
                        fontSize: 14,
                    },
                    anchor: {
                        show: false,
                    },
                    title: {
                        show: false,
                    },
                    detail: {
                        valueAnimation: true,
                        width: '60%',
                        lineHeight: 40,
                        borderRadius: 8,
                        offsetCenter: [0, '-0%'],
                        fontSize: 40,
                        fontWeight: 'bolder',
                        formatter: chart?.marks?.text || ' ',
                        rich: {
                            a: {
                                color: '#E74949',
                                fontWeight: '600',
                                fontSize: '24px',
                                lineHeight: 33,
                            },
                            b: {
                                color: '#E74949',
                                fontWeight: '600',
                                fontSize: '14px',
                                lineHeight: 20,
                                verticalAlign: 'center',
                            },
                            c: {
                                color: '#E74949',
                                fontWeight: '600',
                                fontFamily: 'DINAlternate-Bold',
                                verticalAlign: 'top',
                                fontSize: '24px',
                                lineHeight: 28,
                            },
                            d: {
                                color: '#121D3A',
                                fontWeight: '600',
                                fontSize: '24px',
                                lineHeight: 33,
                            },
                            e: {
                                fontSize: 12,
                                fontWeight: 400,
                                color: '#121D3A',
                                lineHeight: 17,
                            },
                            f: {
                                fontFamily: 'DINAlternate-Bold',
                                fontWeight: 'bold',
                                color: '#E74949',
                                fontSize: 18,
                                lineHeight: 30,
                            },
                            g: {
                                backgroundColor: '#E74949',
                                color: '#fff',
                                borderRadius: 5,
                                height: 20,
                                width: 60,
                                fontSize: 10,
                                lineHeight: 18,
                            },
                        },
                        color: 'auto',
                    },
                    data: valueArea.map(([value], idx, arr) => {
                        return {
                            value: value * 100 >= 100 ? 99.99 : value * 100,
                            itemStyle: {
                                color:
                                    idx === 0
                                        ? arr.length > 1
                                            ? '#F8F9FA'
                                            : new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                                  {offset: 0, color: '#F6F7F8'},
                                                  {offset: 1, color: '#DAE6FF'},
                                              ])
                                        : new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                              {offset: arr[idx - 1][0], color: '#F8F9FA'},
                                              {offset: value, color: '#F9BABA'},
                                          ]),
                            },
                        }
                    }),
                },
                {
                    type: 'gauge',
                    center: ['50%', '50%'],
                    radius: '73%',
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
                            width: 10,
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
                    data: valueArea.map(([value, colour], idx) => {
                        return {
                            value: value * 100 >= 100 ? 99.99 : value * 100,
                            detail: {
                                show: idx > 0 ? false : true,
                                formatter: desc || ' ',
                                offsetCenter: [0, '70%'],
                                rich: {
                                    a: {
                                        fontSize: 12,
                                        color: '#121D3A',
                                        lineHeight: 17,
                                    },
                                    b: {
                                        fontSize: 16,
                                        color: '#121D3A',
                                        fontFamily: 'DINAlternate-Bold',
                                        lineHeight: 19,
                                        fontWeight: 'bold',
                                    },
                                },
                            },
                            itemStyle: {
                                color: colour,
                            },
                        }
                    }),
                },
            ],
        }
    }

    return (
        <div
            ref={panelChartRef}
            style={{width: '100%', height: '100%'}}
            onClick={() => {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage('click')
                }
            }}
        ></div>
    )
}

export default PanelChartOfTool
