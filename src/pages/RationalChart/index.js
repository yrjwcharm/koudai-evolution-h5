/*
 * @Date: 2022-03-18 18:05:36
 * @Author: dx
 * @LastEditors: dx
 * @LastEditTime: 2022-04-01 14:26:43
 * @Description:
 */
import {useEffect, useRef} from 'react'
import * as echarts from 'echarts'
import http from '../../service'

const RationalChart = () => {
    const chartRef = useRef()

    useEffect(() => {
        http.get('/rational/grade/chart/20220315').then((res) => {
            if (res.code === '000000') {
                const {x, y} = res.result
                const myChart = echarts.init(chartRef.current)
                myChart.setOption({
                    grid: {
                        show: false,
                        top: 20,
                        right: 20,
                        bottom: 20,
                    },
                    series: y.map((item, index, arr) => {
                        return {
                            areaStyle: {
                                color:
                                    index === 0
                                        ? new echarts.graphic.LinearGradient(1, 1, 0, 0, [
                                              {
                                                  offset: 0,
                                                  color: 'rgba(230, 194, 133, 0.2)',
                                              },
                                              {
                                                  offset: 1,
                                                  color: 'rgba(216, 216, 216, 0)',
                                              },
                                          ])
                                        : index === arr.length - 1
                                        ? 'transparent'
                                        : '#fff',
                            },
                            lineStyle: {
                                color:
                                    index === arr.length - 1
                                        ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                              {
                                                  offset: 0,
                                                  color: 'rgba(231, 73, 73, 0.5)',
                                              },
                                              {
                                                  offset: 1,
                                                  color: 'rgba(231, 73, 73, 1)',
                                              },
                                          ])
                                        : new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                              {
                                                  offset: 0,
                                                  color: 'rgba(244, 227, 187, 0.5)',
                                              },
                                              {
                                                  offset: 1,
                                                  color: 'rgba(223, 186, 122, 1)',
                                              },
                                          ]),
                            },
                            data: item,
                            itemStyle: {
                                borderColor: index === arr.length - 1 ? '#E74949' : '#fff',
                                borderWidth: index === arr.length - 1 ? 0 : 2,
                                color: index === arr.length - 1 ? '#E74949' : '#E5C287',
                            },
                            showSymbol: index !== arr.length - 1 ? false : true,
                            smooth: true,
                            symbol(value, params) {
                                return index === arr.length - 1 && params.dataIndex === item.length - 1
                                    ? 'triangle'
                                    : 'circle'
                            },
                            symbolRotate: -70,
                            symbolSize(value, params) {
                                if (index === arr.length - 1) {
                                    if (params.dataIndex === item.length - 1) {
                                        return 10
                                    } else {
                                        return 0
                                    }
                                } else {
                                    return 8
                                }
                            },
                            type: 'line',
                        }
                    }),
                    tooltip: {
                        axisPointer: {
                            label: {
                                backgroundColor: '#fff',
                                color: '#121D3A',
                                fontSize: 11,
                                fontWeight: 600,
                                margin: 8,
                                padding: 2,
                                show: true,
                            },
                            lineStyle: {
                                color: '#E4C185',
                                type: 'dotted',
                            },
                        },
                        backgroundColor: '#121D3A',
                        extraCssText: 'box-shadow: none;border: none;',
                        formatter(params) {
                            return `历史收益分布区间<br />${params[1]?.data}%-${params[0]?.data}%`
                        },
                        padding: 6,
                        textStyle: {
                            color: '#fff',
                            fontSize: 10,
                        },
                        trigger: 'axis',
                    },
                    xAxis: {
                        axisLabel: {
                            color: '#9AA1B2',
                            fontSize: 10,
                            interval: 0,
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#E9EAEF',
                            },
                            symbol: ['none', 'triangle'],
                            symbolSize: [8, 8],
                        },
                        axisTick: {
                            show: false,
                        },
                        boundaryGap: false,
                        data: x,
                        splitLine: {
                            lineStyle: {
                                color: '#E9EAEF',
                                type: 'dotted',
                                width: 0.5,
                            },
                            show: true,
                        },
                        type: 'category',
                    },
                    yAxis: {
                        axisLabel: {
                            color: '#9AA1B2',
                            fontSize: 10,
                            formatter(params, index) {
                                return index % 2 === 0 ? `${params}%` : ''
                            },
                            interval: 2,
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#E9EAEF',
                            },
                            show: true,
                            symbol: ['none', 'triangle'],
                            symbolSize: [8, 8],
                        },
                        splitLine: {
                            lineStyle: {
                                color: '#E9EAEF',
                                type: 'dotted',
                                width: 0.5,
                            },
                            show: true,
                        },
                    },
                })
            }
        })
    }, [])

    return <div ref={chartRef} style={{width: '100%', height: '100%', backgroundColor: '#fff'}} />
}

export default RationalChart
