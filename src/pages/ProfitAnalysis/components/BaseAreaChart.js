/*
 * @Date: 2022/12/15 22:21
 * @Author: yanruifeng
 * @Description:
 */
import React, {useEffect, useRef} from 'react'
import F2 from '@antv/f2'
import {px} from '../../../utils'
const BaseAreaChart = (props) => {
    const {
        appendPadding = 10,
        areaColors,
        colors = [
            '#E1645C',
            '#6694F3',
            '#F8A840',
            '#CC8FDD',
            '#5DC162',
            '#C7AC6B',
            '#62C4C7',
            '#E97FAD',
            '#C2E07F',
            '#B1B4C5',
            '#E78B61',
            '#8683C9',
            '#EBDD69',
        ],
        data,
        height = px(220),
        id = '',
        max = null,
        // onChange,
        // onHide,
        width = window.innerWidth,
        // ownColor = false,
        padding = 'auto',
        percent = false,
        showArea = true,
        // showDate = false,
        // snap = false,
        alias = {},
        xTickCount = 3,
        yTickCount = 6,
        tofixed = 2,
        splitTag = null,
    } = props
    const chartRef = useRef()

    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.clear?.()
        } else {
            chartRef.current = new F2.Chart({
                appendPadding,
                id: `${id}BaseAreaChart`,
                padding,
                pixelRatio: window.devicePixelRatio,
                height,
                width,
            })
        }
        chartRef.current.source(data)
        chartRef.current.scale('date', {
            type: 'timeCat',
            tickCount: xTickCount,
            range: [0, 1],
        })
        chartRef.current.scale('value', {
            alias: alias.value || '',
            tickCount: yTickCount,
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
            background: {
                padding: [10],
            }, // tooltip 内容框的背景样式
            crosshairsStyle: {
                stroke: '#E74949',
                lineWidth: 0.5,
                lineDash: [2],
            },
            showCrosshairs: true,
            showItemMarker: false, // 是否展示每条记录项前面的 marker
            showTitle: true, // 展示  tooltip 的标题
            tooltipMarkerStyle: {
                fill: colors[0], // 设置 tooltipMarker 的样式
                lineWidth: 0.5,
                radius: 2,
            },
            layout: 'vertical',
        })
        if (showArea) {
            chartRef.current
                .area({startOnZero: false})
                .position('date*value')
                .color(areaColors)
                .shape('smooth')
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
            .color(colors)
            .animate({
                appear: {
                    animation: 'groupWaveIn',
                    duration: 500,
                },
            })
            .style('type', {
                lineWidth: 1.5,
            })
        chartRef.current.render()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    return <canvas id={`${id}BaseAreaChart`} className="baseAreaChart" />
}

export default BaseAreaChart
