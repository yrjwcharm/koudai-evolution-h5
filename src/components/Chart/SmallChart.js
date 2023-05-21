import React, {useEffect, useRef} from 'react'
import F2 from '@antv/f2'

const Index = ({data = []}) => {
    const chartBox = useRef()
    const chartRef = useRef()

    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.clear()
        } else {
            chartRef.current = new F2.Chart({
                el: chartBox.current,
                pixelRatio: window.devicePixelRatio,
                padding: 0,
            })
        }
        chartRef.current.source(data)
        chartRef.current.axis(false)
        chartRef.current.legend(false)
        chartRef.current.tooltip(false)
        chartRef.current
            .area({
                startOnZero: false,
            })
            .position('date*value')
            .color('l(90) 0:#DC4949 1:#ffffff')
            .shape('smooth')
        chartRef.current.line().position('date*value').color('#DC4949').style({
            lineWidth: 1,
        })
        chartRef.current
            .point()
            .position('date*value')
            .size('tag', function (val) {
                if (typeof val != 'string') {
                    return val ? 3 : 0
                } else {
                    return 0
                }
            })
            .style('tag', {
                fill: function fill(val) {
                    //卖红色 tag是2
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
    }, [data])

    return <canvas ref={chartBox} style={{width: '100%', height: '100%'}} />
}

export default Index
