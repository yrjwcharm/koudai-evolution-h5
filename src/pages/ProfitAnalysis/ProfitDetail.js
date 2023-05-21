/*
 * @Date: 2022-09-30 10:01:18
 * @Author: yanruifeng
 * @Description:收益明细
 */
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Colors, Font, Space, Style} from '../../common/commonStyle'
import ProfitDistribution from './ProfitDistribution'
import {isEmpty, px as text, px} from '../../utils/appUtil'
import {getEarningsUpdateNote, getHeadData, getResetDate} from './services'
// import Loading from '../Portfolio/components/PageLoading';
import './tabs.css'
import {Tabs} from 'antd-mobile'
import QueryString from 'qs'
const ProfitDetail = () => {
    const params = QueryString.parse(window.location.href.split('?')[1]) || {}
    const {fund_code = '', poid = '', page = 0, type = 200} = params || {}
    const [headData, setHeadData] = useState({})
    const [data, setData] = useState({})
    const [diff, setDiff] = useState(0)
    const [tabs, setTabs] = useState([
        // {text: '全部', type: 200},
        // {text: '公募基金', type: 10},
        {text: '投顾组合', type: 30},
        // {text: '理财计划', type: 40},
        // {text: '私募基金', type: 20},
    ])
    const init = useCallback((type) => {
        ;(async () => {
            const res = await Promise.all([
                getHeadData({type, poid, fund_code}),
                getEarningsUpdateNote({}),
                getResetDate({type, unit_type: 'day', poid, fund_code}),
            ])
            if (res[0].code === '000000' && res[1].code === '000000' && res[2].code === '000000') {
                const {title: navigationTitle = '', header = {}, button = {}, tabs = []} = res[0]?.result || {}
                const {title: rightTitle = '', declare_pic = ''} = res[1]?.result || {}
                const {month_reset} = res[2]?.result || {}
                setDiff(month_reset ? -1 : 0)
                // setTabs(tabs)
                setHeadData(header)
                button && setData(button)
            }
        })()
    }, [])
    useEffect(() => {
        document.title = '收益明细'
        init(type)
    }, [init])

    useEffect(() => {
        // Platform.OS === 'android' && page !== 0 && scrollTab.current?.goToPage(page);
    }, [page])
    return (
        <>
            <div style={{flex: 1, paddingTop: isEmpty(poid) ? 0 : '12px', backgroundColor: Colors.bgColor}}>
                {isEmpty(poid) ? (
                    <Tabs
                        stretch={false}
                        activeLineMode="fixed"
                        onChange={(key) => {
                            init(tabs[~~key].type)
                        }}
                    >
                        {tabs.map((el, index) => {
                            return (
                                <Tabs.Tab title={el.text} key={index}>
                                    <ProfitDistribution
                                        poid={poid}
                                        data={data}
                                        type={el.type}
                                        differ={diff}
                                        headData={headData}
                                        fund_code={fund_code}
                                        tabLabel={el.text}
                                    />
                                </Tabs.Tab>
                            )
                        })}
                    </Tabs>
                ) : (
                    <ProfitDistribution type={type} headData={headData} poid={poid} fund_code={fund_code} />
                )}
            </div>
        </>
    )
}
export default ProfitDetail
