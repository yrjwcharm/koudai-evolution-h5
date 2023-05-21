/*
 * @Date: 2021-04-26 19:43:55
 * @Author: yhc
 * @LastEditors: yhc
 * @LastEditTime: 2021-05-10 18:01:04
 * @Description:
 */
import React, {useEffect, useState} from 'react'
import http from '../../service'
import * as Highcharts from 'highcharts'
import highchartsMore from 'highcharts/highcharts-more'
import HighchartsReact from 'highcharts-react-official'
import qs from 'qs'
highchartsMore(Highcharts)
const LINE_TIME = 1000
const DELAY = 600
const lineColor = ['#545968', '#E74949', '#FF9FA2']

const redColor = {
    linearGradient: [0, 0, 0, 200],
    stops: [
        [0, 'rgba(250, 54, 65, 0.21)'],
        [1, 'rgba(250, 54, 65, 0)'],
    ],
}
const missRedColor = {
    linearGradient: [0, 0, 0, 0],
    stops: [
        [0, 'rgba(250, 54, 65, 0.21)'],
        [1, 'rgba(250, 54, 65, 0)'],
    ],
}
let min = null
const Chart = (props) => {
    const [label, setLabel] = useState('')
    const [options, setOptions] = useState({
        credits: {
            enabled: false, //关闭highcharts签名
        },
        title: {text: ''},
        plotOptions: {
            spline: {
                lineWidth: 1,
            },
            series: {
                // marker:{enabled:true},
                allowPointSelect: false,
                states: {hover: {enabled: false}},
                events: {
                    click: function (event) {
                        return false
                    },
                },
            },
        },
    })
    const getOptions = (dataY, dataX, max, animation) => {
        return {
            chart: {
                height: 210,
                animation: animation === 0 ? false : true,
            },

            yAxis: {
                title: {
                    text: '',
                },
                // tickAmount: 6,
                // showFirstLabel: true,
                floor: min,
                max: max,
                startOnTick: false,
                tickPixelInterval: 60,
                labels: {
                    formatter: function () {
                        return (this.value * 100).toFixed(2) + '%' //y轴显示刻度文字
                    },
                    align: 'center',
                    style: {
                        color: '#9397A3',
                        fontSize: '10px',
                        fontFamily: 'DINAlternate-Bold',
                    },
                },
                gridLineWidth: 0.5,
            },
            tooltip: {
                enabled: false,
            },

            legend: {
                enabled: false, //关闭节点tag,
            },
            series: dataY,
            xAxis: {
                categories: dataX,
                lineWidth: 0.5,
                tickInterval: dataX.length - 1,
                labels: {
                    align: 'center',
                    style: {
                        color: '#9397A3',
                        fontSize: '10px',
                        fontFamily: 'DINAlternate-Bold',
                    },
                },
            },
        }
    }
    useEffect(() => {
        const params = props.location.search.split('?')[1] ? qs.parse(props.location.search.split('?')[1]) : {}
        if (Object.keys(params).length > 0) {
            http.get('/questionnaire/chart/20210501', params, false).then((res) => {
                let chartData = res.result.charts
                min = res.result.min_yields[0]
                let baseLine = chartData.y[0]
                baseLine.forEach((item, index) => {
                    if (index === chartData.y[0].length - 26) {
                        baseLine[index] = {
                            y: item,
                            marker: {
                                enabled: true,
                                symbol: 'url(https://static.licaimofang.com/wp-content/uploads/2021/05/base123.png)',
                                width: 58,
                                height: 40,
                            },
                        }
                    }
                })

                return new Promise((resolve) => {
                    setOptions(
                        getOptions(
                            [
                                {
                                    zIndex: 10,
                                    data: baseLine,
                                    color: lineColor[0],
                                    type: 'spline',
                                    animation: {
                                        duration: LINE_TIME,
                                    },
                                },
                            ],
                            chartData.x,
                            res.result.max_yields[0],
                            res.result.min_yields[0],
                        ),
                    )
                    setTimeout(() => {
                        resolve()
                    }, 1500)
                }).then(() => {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            setTimeout(() => {
                                setLabel('https://static.licaimofang.com/wp-content/uploads/2021/04/global.png')
                            }, 1000)
                            setOptions(
                                getOptions(
                                    [
                                        {
                                            data: chartData.y[0],
                                            color: lineColor[0],
                                            type: 'spline',
                                            animation: false,
                                        },
                                        {
                                            data: chartData.y[1],
                                            color: lineColor[1],
                                            type: 'arearange',
                                            animation: {
                                                duration: LINE_TIME,
                                            },
                                            fillColor: redColor,
                                        },
                                    ],
                                    chartData.x,
                                    res.result.max_yields[1],
                                ),
                            )

                            setTimeout(() => {
                                resolve()
                            }, 1500)
                        }, DELAY)
                    }).then(() => {
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                setLabel('')
                                setTimeout(() => {
                                    setLabel('https://static.licaimofang.com/wp-content/uploads/2021/04/adjust1.png')
                                }, 1000)
                                setOptions(
                                    getOptions(
                                        [
                                            {
                                                data: chartData.y[0],
                                                color: lineColor[0],
                                                type: 'spline',
                                                animation: false,
                                            },
                                            {
                                                data: chartData.y[1],
                                                color: lineColor[2],
                                                animation: false,
                                                fillColor: missRedColor,
                                            },
                                        ],
                                        chartData.x,
                                        res.result.max_yields[2],
                                    ),
                                )
                                setOptions(
                                    getOptions(
                                        [
                                            {
                                                data: chartData.y[0],
                                                color: lineColor[0],
                                                type: 'spline',
                                                animation: false,
                                            },
                                            {
                                                data: chartData.y[1],
                                                color: lineColor[2],
                                                animation: false,
                                                fillColor: missRedColor,
                                            },
                                            {
                                                data: chartData.y[2],
                                                color: lineColor[1],
                                                type: 'arearange',
                                                animation: {
                                                    duration: LINE_TIME,
                                                },
                                                fillColor: redColor,
                                            },
                                        ],
                                        chartData.x,
                                        res.result.max_yields[2],
                                    ),
                                )
                                setTimeout(() => {
                                    resolve()
                                }, 1500)
                            }, DELAY)
                        }).then(() => {
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    setLabel('')
                                    setTimeout(() => {
                                        setLabel(
                                            'https://static.licaimofang.com/wp-content/uploads/2021/04/enhance.png',
                                        )
                                    }, 1000)
                                    setOptions(
                                        getOptions(
                                            [
                                                {
                                                    data: chartData.y[0],
                                                    color: lineColor[0],
                                                    type: 'spline',
                                                    animation: false,
                                                },
                                                {
                                                    data: chartData.y[2],
                                                    color: lineColor[2],
                                                    animation: false,
                                                },
                                            ],
                                            chartData.x,
                                            res.result.max_yields[3],
                                        ),
                                    )
                                    setOptions(
                                        getOptions(
                                            [
                                                {
                                                    data: chartData.y[0],
                                                    color: lineColor[0],
                                                    type: 'spline',
                                                    animation: false,
                                                },
                                                {
                                                    data: chartData.y[2],
                                                    color: lineColor[2],
                                                    animation: false,
                                                },
                                                {
                                                    data: chartData.y[3],
                                                    color: lineColor[1],
                                                    type: 'arearange',
                                                    animation: {
                                                        duration: LINE_TIME,
                                                    },
                                                    fillColor: redColor,
                                                },
                                            ],
                                            chartData.x,
                                            res.result.max_yields[3],
                                        ),
                                    )
                                    setTimeout(() => {
                                        resolve()
                                    }, 1500)
                                }, DELAY)
                            }).then(() => {
                                return new Promise((resolve) => {
                                    setTimeout(() => {
                                        setLabel('')
                                        setTimeout(() => {
                                            setLabel(
                                                'https://static.licaimofang.com/wp-content/uploads/2021/04/risk.png',
                                            )
                                        }, 1000)
                                        setOptions(
                                            getOptions(
                                                [
                                                    {
                                                        data: chartData.y[0],
                                                        color: lineColor[0],
                                                        type: 'spline',
                                                        animation: false,
                                                    },
                                                    {
                                                        data: chartData.y[3],
                                                        color: lineColor[2],
                                                        animation: false,
                                                    },
                                                ],
                                                chartData.x,
                                                res.result.max_yields[4],
                                            ),
                                        )
                                        setOptions(
                                            getOptions(
                                                [
                                                    {
                                                        data: chartData.y[0],
                                                        color: lineColor[0],
                                                        type: 'spline',
                                                        animation: false,
                                                    },
                                                    {
                                                        data: chartData.y[3],
                                                        color: lineColor[2],
                                                        animation: false,
                                                    },
                                                    {
                                                        data: chartData.y[4],
                                                        color: lineColor[1],
                                                        type: 'arearange',
                                                        animation: {
                                                            duration: LINE_TIME,
                                                        },
                                                        fillColor: redColor,
                                                    },
                                                ],
                                                chartData.x,
                                                res.result.max_yields[4],
                                            ),
                                        )

                                        setTimeout(() => {
                                            setOptions(
                                                getOptions(
                                                    [
                                                        {
                                                            data: chartData.y[0],
                                                            color: lineColor[0],
                                                            type: 'spline',
                                                            animation: false,
                                                        },
                                                        {
                                                            data: chartData.y[4],
                                                            color: lineColor[1],
                                                            type: 'arearange',
                                                            animation: false,
                                                            fillColor: redColor,
                                                        },
                                                    ],
                                                    chartData.x,
                                                    res.result.max_yields[4],
                                                    0,
                                                ),
                                            )
                                            setLabel(
                                                'https://static.licaimofang.com/wp-content/uploads/2021/05/znlable1.png',
                                            )
                                        }, 2000)
                                    }, DELAY)
                                }).then(() => {})
                            })
                        })
                    })
                })
                // setOptions(
                //     getOptions([
                //         {
                //             data: chartData.y[0], color:  lineColor[0],type:'arearange',
                //             animation: {
                //                 duration: LINE_TIME,
                //               },
                //
                //         }
                //     ],chartData.x,res.result.max_yields[0])
                // )

                // setTimeout(()=>{
                //     setOptions(
                //         getOptions([
                //             {
                //                 data: chartData.y[0], color:  lineColor[0],type:'arearange',
                //                 animation: false,
                //
                //             },
                //             {
                //                 data: chartData.y[1], color:lineColor[1] ,type:'arearange',
                //                 animation: {
                //                     duration: LINE_TIME,
                //                   },
                //                 fillColor: redColor,
                //             }
                //         ],chartData.x, res.result.max_yields[1])
                //     )
                // },4000)
                // setTimeout(()=>{
                //     setOptions(
                //         getOptions([
                //             {
                //                 data: chartData.y[0], color:  lineColor[0],type:'arearange',
                //                 animation: false,
                //
                //             },
                //             {
                //                 data: chartData.y[1], color:lineColor[2] ,
                //                 animation: false,
                //             },
                //             {
                //                 data: chartData.y[2], color:lineColor[1] ,type:'arearange',
                //                 animation: {
                //                     duration: LINE_TIME,
                //                   },
                //                 fillColor: redColor,
                //             }
                //         ],chartData.x,res.result.max_yields[2])
                //     )
                // },6000)
                // setTimeout(()=>{
                //     setOptions(
                //         getOptions([
                //             {
                //                 data: chartData.y[0], color:  lineColor[0],type:'arearange',
                //                 animation: false,
                //
                //             },
                //             {
                //                 data: chartData.y[2], color:lineColor[2] ,
                //                 animation: false,
                //             },
                //             {
                //                 data: chartData.y[3], color:lineColor[1] ,type:'arearange',
                //                 animation: {
                //                     duration: LINE_TIME,
                //                   },
                //                 fillColor: redColor,
                //             }
                //         ],chartData.x,res.result.max_yields[3])
                //     )
                // },8000)
                // setTimeout(()=>{
                //     setOptions(
                //         getOptions([
                //             {
                //                 data: chartData.y[0], color:  lineColor[0],type:'arearange',
                //                 animation: false,
                //
                //             },
                //             {
                //                 data: chartData.y[3], color:lineColor[2] ,
                //                 animation: false,
                //             },
                //             {
                //                 data: chartData.y[4], color:lineColor[1] ,type:'arearange',
                //                 animation: {
                //                     duration: LINE_TIME,
                //                   },
                //                 fillColor: redColor,
                //             }
                //         ],chartData.x,res.result.max_yields[4])
                //     )
                //     setTimeout(()=>{
                //         setOptions(
                //             getOptions([
                //                 {
                //                     data: chartData.y[0], color:  lineColor[0],type:'arearange',
                //                     animation: false,
                //
                //                 },

                //                 {
                //                     data: chartData.y[4], color:lineColor[1] ,type:'arearange',
                //                     animation: false,
                //                     fillColor: redColor,
                //                 }
                //             ],chartData.x)
                //         )
                //     },100)

                // },15000)
            })
        }
    }, [props])

    return (
        <div style={{position: 'relative', backgroundColor: '#fff'}}>
            <HighchartsReact highcharts={Highcharts} options={options} />
            <div style={{position: 'absolute', top: 0, right: 14}}>
                {label && <img style={{with: 58, height: 24}} alt="" src={label} />}
            </div>
        </div>
    )
}
export default Chart
