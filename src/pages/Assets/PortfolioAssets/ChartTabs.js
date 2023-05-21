/*
 * @Date: 2022-12-16 11:30:53
 * @Description:图表
 */
import React, {useState, useRef, useEffect} from 'react'
import {BaseAreaChart} from '~/components/Chart'
import CustomTabs from '~/components/CustomTabs'
import {isIOS} from '~/utils'
import './index.scss'
import {getChartData} from './services'
import {cloneDeep, times} from 'lodash'
import {Popup} from 'antd-mobile'
import {CloseOutline} from 'antd-mobile-icons'
const RenderChart = ({data, id}) => {
    const {key, params, period: initPeriod} = data || {}
    const [period, setPeriod] = useState(initPeriod)
    const [chartData, setChartData] = useState({})
    const [loading, setLoading] = useState(true)
    const currentIndex = useRef('')
    const [summary, setSummary] = useState([])
    const originSummary = useRef()
    const [popupVisible, setPopupVisible] = useState(false)
    const [popData, setPopData] = useState()
    const init = () => {
        const apiParams = {...params, period, type: key}
        if (currentIndex.current) {
            apiParams.index = currentIndex.current
        }
        getChartData(apiParams)
            .then((res) => {
                if (res.code === '000000') {
                    setChartData(res.result)
                    setSummary(res.result.label)
                    originSummary.current = cloneDeep(res.result.label)
                }
            })
            .finally(() => {
                setLoading(false)
            })
    }
    const onChange = (items) => {
        setSummary((prev) => {
            const next = cloneDeep(prev)
            if (key === 'nav') {
                next.forEach((item, index) => {
                    item.val = items[index]?.value
                })
            } else {
                next.slice(1).forEach((item, index) => {
                    item.val = items[index].value
                })
                next[0].val = items[0].title
            }
            return next
        })
    }

    const onHide = () => {
        setSummary(originSummary.current)
    }
    useEffect(() => {
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, params, period])
    return (
        <>
            <div className="flexCenter" style={{minHeight: '.76rem', marginTop: '.32rem'}}>
                {summary?.map((item, index, arr) => {
                    const {color, name, val, tips} = item

                    return (
                        <div
                            className="flexColumn"
                            key={name}
                            style={{
                                margin: index === 1 ? (arr.length === 3 ? '0 .8rem' : '0 0 0 .8rem') : 0,
                            }}
                        >
                            <div
                                className="chartLegendVal"
                                style={
                                    index > 0 || key === 'inc'
                                        ? {
                                              color: parseFloat(val)
                                                  ? parseFloat(val) > 0
                                                      ? '#E74949'
                                                      : '#4BA471'
                                                  : '#121D3A',
                                          }
                                        : {}
                                }
                            >
                                {val}
                            </div>
                            <div className="defaultFlex chartLegendKey">
                                {color ? <div className="legendLine" style={{backgroundColor: color}} /> : null}
                                {name}
                                {tips && (
                                    <img
                                        src="https://static.licaimofang.com/wp-content/uploads/2022/10/question.png"
                                        alt="qs"
                                        className={'portfolioCardBottomRateDescTip'}
                                        onClick={() => {
                                            setPopData(tips)
                                            setPopupVisible(true)
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
            <div style={{height: '4.4rem'}}>
                {chartData?.chart?.length > 0 && (
                    <BaseAreaChart
                        areaColors={['l(90) 0:#E74949 1:#fff', 'transparent', '#50D88A']}
                        colors={['#E74949', '#545968', '#FFAF00']}
                        data={chartData?.chart}
                        id={id}
                        onChange={(obj) => {
                            const {items} = obj
                            onChange(items)
                        }}
                        onHide={onHide}
                        // splitTag={chartData?.tag_position?.[0]}
                        padding={['auto', 20, 'auto', 40]}
                        percent={key == 'nav'}
                        showArea={true}
                        showDate={true}
                        tofixed={key == 'nav' ? 2 : 0}
                        tag_position={chartData?.tag_position}
                    />
                )}
            </div>
            {chartData?.sub_tabs?.length > 0 && (
                <div className="flexCenter fundChartTabs">
                    {chartData?.sub_tabs?.map((tab) => (
                        <div
                            className={`flexCenter chartTab ${tab.val === period ? 'active' : ''}`}
                            key={tab.val}
                            onClick={() => setPeriod(tab.val)}
                            style={{flex: tab.val === 'all' ? 1.2 : 1, '--active-tab-weight': isIOS() ? 500 : 700}}
                        >
                            {tab.name}
                        </div>
                    ))}
                </div>
            )}
            <Popup
                visible={popupVisible}
                getContainer={document.getElementById('PortfolioAssets')}
                bodyStyle={{borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}}
                onMaskClick={() => {
                    setPopupVisible(false)
                }}
            >
                <div className={'popHeader'}>
                    <div
                        className={'popClose'}
                        onClick={() => {
                            setPopupVisible(false)
                        }}
                    >
                        <CloseOutline fontSize={18} color="#545968" />
                    </div>
                    <div className={'poptitle'}>{popData?.title}</div>
                </div>
                <div className={'popContent'}>
                    {popData?.content.map((item, index) => {
                        return (
                            <div key={item + index} style={{marginTop: index === 0 ? 0 : '0.32rem'}}>
                                {item.key ? <div className={'tipTitle'}>{item.key}:</div> : null}
                                <div
                                    style={{lineHeight: '0.36rem', fontSize: '0.26rem'}}
                                    dangerouslySetInnerHTML={{__html: item.val}}
                                />
                            </div>
                        )
                    })}
                </div>
            </Popup>
        </>
    )
}
function ChartTabs({data = []}) {
    return (
        <div className="card" style={{padding: '10px'}}>
            {data?.length > 0 && (
                <CustomTabs
                    contents={data?.map((tab) => {
                        const {key} = tab
                        return (
                            // <div style={{height: '200px', width: '100%'}}>
                            <RenderChart id={key} data={tab} />
                            // </div>
                        )
                    })}
                    tabItems={data}
                ></CustomTabs>
            )}
        </div>
    )
}

export default ChartTabs
