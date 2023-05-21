/*
 * @Date: 2022-08-04 11:24:04
 * @Description: 饼图
 */
import React, {useEffect, useRef} from 'react'
import * as echarts from 'echarts'

const Index = ({data = []}) => {
    const chartRef = useRef()
    const myChart = useRef()

    const genChart = () => {
        if (myChart.current) {
            myChart.current.clear()
        } else {
            myChart.current = echarts.init(chartRef.current)
        }
        myChart.current.setOption({
            dataset: {
                dimensions: ['name', 'value'],
                source: data,
            },
            legend: {
                show: false,
            },
            series: [
                {
                    avoidLabelOverlap: false,
                    emphasis: {
                        disabled: true,
                    },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 3,
                        color: ({dataIndex}) => data[dataIndex].color,
                    },
                    label: {
                        show: false,
                    },
                    labelLine: {
                        show: false,
                    },
                    name: 'ratio',
                    radius: ['60%', '100%'],
                    type: 'pie',
                },
            ],
            tooltip: {
                trigger: 'none',
            },
        })
    }

    useEffect(() => {
        if (chartRef.current) {
            genChart()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="defaultFlex" id="pieChartContainer">
            <div id="pieChart" ref={chartRef} style={{flex: 1, height: '2.4rem'}} />
            <div className="legendContainer" style={{flex: 1, padding: '.32rem 0'}}>
                {data?.map((item, index) => {
                    const {color, name} = item
                    return (
                        <div className="defaultFlex" key={name + index} style={{marginTop: index === 0 ? 0 : '.24rem'}}>
                            <div
                                style={{
                                    width: '.12rem',
                                    height: '.12rem',
                                    backgroundColor: color,
                                    marginRight: '.16rem',
                                    borderRadius: '100%',
                                }}
                            />
                            <span
                                style={{
                                    fontSize: '.24rem',
                                    lineHeight: '.34rem',
                                    color: '#545968',
                                }}
                            >
                                {name}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Index
