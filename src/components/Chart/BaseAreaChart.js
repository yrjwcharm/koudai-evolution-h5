import React, {useEffect, useRef} from 'react'
import F2 from '@antv/f2'

const Index = (props) => {
    const {
        appendPadding = 10,
        areaColors,
        colors,
        data,
        id = '',
        max = null,
        onChange,
        onHide,
        ownColor = false,
        padding = 'auto',
        percent = false,
        showArea = true,
        showDate = false,
        snap = false,
        tofixed = 2,
        splitTag = null,
        tag_position,
    } = props
    const chartRef = useRef()
    const tagColors = {
        buy: '#4BA471',
        redeem: '#E74949',
        adjust: '#0051CC',
        risk_trans: '#EB7121',
    }
    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.clear?.()
        } else {
            chartRef.current = new F2.Chart({
                appendPadding,
                id: `${id}BaseAreaChart`,
                padding,
                pixelRatio: window.devicePixelRatio,
            })
        }
        chartRef.current.source(data)
        chartRef.current.scale('date', {
            type: 'timeCat',
            tickCount: 3,
            range: [0, 1],
        })
        chartRef.current.scale('value', {
            tickCount: 6,
            max,
            formatter: (value) => {
                const val = (value * 100).toFixed(tofixed)
                return percent ? `${val}%` : (value * 1).toFixed(tofixed)
            },
        })
        chartRef.current.axis('date', {
            label: function label(text, index, total) {
                const textCfg = {}
                if (index === 0) {
                    textCfg.textAlign = 'left'
                } else if (index === total - 1) {
                    textCfg.textAlign = 'right'
                }
                textCfg.fontSize = 10
                textCfg.lineHeight = 14
                textCfg.fontFamily = 'DINAlternate-Bold'
                return textCfg
            },
        })
        chartRef.current.axis('value', {
            label: function label(text) {
                const cfg = {}
                cfg.fontFamily = 'DINAlternate-Bold'
                cfg.fontSize = 10
                cfg.lineHeight = 14
                return cfg
            },
        })
        chartRef.current.legend(false)
        chartRef.current.tooltip({
            crosshairsType: 'y',
            custom: true,
            onChange,
            onHide,
            showCrosshairs: true,
            showXTip: showDate,
            snap,
            tooltipMarkerStyle: {
                radius: 1,
            },
        })
        if (tag_position) {
            for (var key in tag_position) {
                tagColors[key] &&
                    chartRef.current.guide().tag({
                        position: tag_position[key]?.position,
                        content: tag_position[key]?.name,
                        limitInPlot: true,
                        offsetY: -5,
                        background: {
                            fill: tagColors[key],
                            padding: 2,
                        },
                        pointStyle: {
                            fill: tagColors[key],
                        },
                        textStyle: {
                            fontSize: 10, // 字体大小
                        },
                    })
            }
        }
        if (showArea) {
            chartRef.current
                .area({startOnZero: false})
                .position('date*value')
                .shape('smooth')
                .color(ownColor ? 'area' : 'type', ownColor ? (area) => area : areaColors)
                .animate({
                    appear: {
                        animation: 'groupWaveIn',
                        duration: 500,
                    },
                })
        }
        if (splitTag) {
            chartRef.current.guide().tag({
                position: [splitTag?.date, splitTag?.value],
                content: splitTag?.text,
                limitInPlot: true,
                offsetY: -5,
                offsetX: 0,
                direct: 'tc',
                background: {
                    fill: '#545968',
                    padding: [4, 4],
                    opacity: 0.7,
                },
                pointStyle: {
                    fill: '#545968',
                    r: 5,
                },
                textStyle: {
                    fontSize: 11, // 字体大小
                },
            })
        }

        chartRef.current
            .line()
            .position('date*value')
            .shape('smooth')
            .color(ownColor ? 'line' : 'type', ownColor ? (line) => line : colors)
            .animate({
                appear: {
                    animation: 'groupWaveIn',
                    duration: 500,
                },
            })
            .style('type', {
                lineWidth: function (val) {
                    if (val.includes('本基金')) {
                        return 1
                    } else {
                        return 0.5
                    }
                },
                lineDash(val) {
                    if (val === '底线') return [4, 4, 4]
                    else return []
                },
            })
        chartRef.current
            .point()
            .position('date*value')
            .size('tag', function (val) {
                return val ? 3 : 0
            })
            .style('tag', {
                fill: function fill(val) {
                    if (val === 2) {
                        return '#E74949'
                    } else if (val === 1) {
                        return '#4BA471'
                    } else if (val === 3) {
                        return '#0051CC'
                    } else if (val === 4) {
                        return '#EB7121'
                    }
                },
                stroke: '#fff',
                lineWidth: 1,
            })

        chartRef.current.render()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    return <canvas id={`${id}BaseAreaChart`} className="baseAreaChart"></canvas>
}

export default Index
