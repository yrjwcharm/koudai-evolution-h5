/*
 * @Description:
 * @Autor: wxp
 * @Date: 2022-12-13 16:06:19
 */

import React, {useEffect, useRef, useState} from 'react'
import qs from 'querystring'
import {DotLoading, Image, Tabs} from 'antd-mobile'
import styles from './index.module.scss'
import BottomDesc from '~/components/BottomDesc'
import http from '~/service'
import classNames from 'classnames'
import {px} from '~/utils'
import lineIcon from '~/image/icon/line.png'

const TradeRules = () => {
    const params = qs.parse(window.location.search.split('?')[1])
    const head = useRef(
        params.scene === 'adviser'
            ? [
                  {
                      title: '购买规则',
                  },
                  {
                      title: '赎回规则',
                  },
              ]
            : [
                  {
                      title: '交易费率',
                  },
                  {
                      title: '确认时间',
                  },
                  {
                      title: '交易金额',
                  },
                  {
                      title: '银行卡限额',
                  },
              ],
    ).current

    useEffect(() => {
        document.title = '交易须知'
    }, [])

    return (
        <Tabs className={styles.container}>
            {head.map((item, idx) => (
                <Tabs.Tab key={idx} title={item.title}>
                    {idx === 0 && <Part1 />}
                    {idx === 1 && <Part2 />}
                    {idx === 2 && <Part3 />}
                    {idx === 3 && <Part4 />}
                    <BottomDesc />
                </Tabs.Tab>
            ))}
        </Tabs>
    )
}

const Part1 = () => {
    const [data, setData] = useState({})
    const [, setIsPlan] = useState()
    const params = qs.parse(window.location.search.split('?')[1])
    useEffect(() => {
        const {upid, poid, allocation_id, risk, scene} = params || {}
        if (scene === 'adviser') {
            http.get('/adviser/tran/rules/20210923', {poid, type: 'buy_rule'}).then((res) => {
                if (res.code === '000000') {
                    setData(res.result.data || {})
                }
            })
        } else {
            http.get('/portfolio/mustknow/20210101', {
                upid,
                type: 'trade_rate',
                poid,
                allocation_id,
                risk,
            }).then((res) => {
                if (res.code == '000000') {
                    setData(res.result.data || {})
                    setIsPlan(res.result.is_plan)
                }
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return Object.keys(data).length > 0 ? (
        <div>
            {params.scene === 'adviser' ? (
                <>
                    <div className={classNames([styles.title, {}])} style={{paddingTop: px(16), paddingBottom: px(16)}}>
                        {data.confirm_time?.title}
                    </div>
                    <div style={{paddingLeft: px(16), backgroundColor: '#fff'}}>
                        <img alt="" src={lineIcon} className={styles.line} />
                        <div
                            className={classNames([styles.buyComfirmTime])}
                            style={{marginBottom: px(4), borderBottomWidth: 0}}
                        >
                            {data.confirm_time?.steps?.map?.((step, idx, arr) => {
                                return (
                                    <div
                                        key={`confirm_step${idx}`}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems:
                                                idx === 0
                                                    ? 'flex-start'
                                                    : idx === arr.length - 1
                                                    ? 'flex-end'
                                                    : 'center',
                                        }}
                                    >
                                        <div className={styles.buyComfirmTimeText}>{step.key}</div>
                                        <div className={styles.buyComfirmTimeText}>{step.value}</div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className={styles.buyNotice}>
                            <div className={styles.blueCircle}>•&nbsp;</div>
                            <div className={styles.buyNoticeText}>
                                {
                                    'T日：交易日，15:00(含)之前为T日，15:00之后为T+1日。周末和法定节假日属于非交易日，以支付成功时间为准。\n'
                                }
                            </div>
                            <div className={styles.blueCircle}>•&nbsp;</div>
                            <div className={styles.buyNoticeText}>
                                {'以上时间点仅供参考，具体时间以各基金公司实际确认为准。'}
                            </div>
                        </div>
                    </div>
                    <div className={classNames([styles.title])} style={{marginTop: px(10), paddingTop: px(16)}}>
                        {data.rate?.title}
                    </div>
                    <div className={classNames([styles.feeDescBox, {}])} style={{paddingTop: 0}}>
                        <div className={classNames([styles.feeDesc])} style={{color: '#545968'}}>
                            {data.rate?.tip}
                        </div>
                    </div>
                    <div className={classNames([styles.title])} style={{marginTop: px(10), paddingTop: px(16)}}>
                        {data.service_rate?.title}
                    </div>
                    <div className={classNames([styles.feeDescBox])} style={{paddingTop: 0}}>
                        <div className={classNames([styles.feeDesc])} style={{color: '#545968'}}>
                            {data.service_rate?.tip}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className={styles.title}>赎回费率</div>
                    <div className={classNames([styles.feeHeadTitle, styles.flexBetween])}>
                        <div className={styles.feeHeadTitleText}>{data.th && data.th[0]}</div>
                        <div className={styles.feeHeadTitleText}>{data.th && data.th[1]}</div>
                    </div>
                    {data.tr_list?.map?.((item, index, arr) => {
                        return (
                            <div
                                key={`fee${index}`}
                                className={classNames([styles.feeTableItem, styles.flexBetween])}
                                style={{
                                    backgroundColor: index % 2 === 0 ? '#fff' : '#F5F6F8',
                                    borderBottomWidth: index === arr?.length - 1 ? '1px' : 0,
                                }}
                            >
                                <div className={styles.feeTableLeftText}>{item[0]}</div>
                                <div className={styles.feeTableRightText}>{item[1]}</div>
                            </div>
                        )
                    })}
                    <div className={[styles.feeDescBox]}>
                        <div
                            className={styles.feeDesc}
                            style={{lineHeight: px(20)}}
                            dangerouslySetInnerHTML={{__html: data?.redeem?.content}}
                        ></div>
                    </div>
                    {Object.values(data?.desc_list)?.map((item, index) => (
                        <div key={item.title + index}>
                            <div className={classNames([styles.title])} style={{marginTop: px(10), paddingTop: px(16)}}>
                                {item.title}
                            </div>
                            <div className={classNames([styles.feeDescBox])} style={{paddingTop: 0}}>
                                <div
                                    className={styles.feeDesc}
                                    style={{color: '#545968'}}
                                    dangerouslySetInnerHTML={{__html: item.content}}
                                ></div>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    ) : (
        <div className={styles.beforeMask}>
            <DotLoading />
        </div>
    )
}

const Part2 = () => {
    const [data, setData] = useState({})
    const [isPlan, setIsPlan] = useState()
    const params = qs.parse(window.location.search.split('?')[1])
    useEffect(() => {
        const {upid, poid, allocation_id, scene} = params || {}
        if (scene === 'adviser') {
            http.get('/adviser/tran/rules/20210923', {poid, type: 'redeem_rule'}).then((res) => {
                if (res.code === '000000') {
                    setData(res.result.data || {})
                }
            })
        } else {
            http.get('/portfolio/mustknow/20210101', {
                upid,
                type: 'confirm_time',
                poid,
                allocation_id,
            }).then((res) => {
                if (res.code == '000000') {
                    setData(res.result.data)
                    setIsPlan(res.result.is_plan)
                }
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return Object.keys(data || {}).length > 0 ? (
        <div>
            {params.scene === 'adviser' ? (
                <>
                    <div className={styles.title} style={{paddingVertical: px(16)}}>
                        {data.confirm_time?.title}
                    </div>
                    <div style={{paddingHorizontal: px(16), backgroundColor: '#fff'}}>
                        <img alt="" src={lineIcon} className={styles.line} />
                        <div className={styles.buyComfirmTime} style={{marginBottom: px(4), borderBottomWidth: 0}}>
                            {data.confirm_time?.steps?.map?.((step, idx, arr) => {
                                return (
                                    <div
                                        key={`confirm_step${idx}`}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems:
                                                idx === 0
                                                    ? 'flex-start'
                                                    : idx === arr.length - 1
                                                    ? 'flex-end'
                                                    : 'center',
                                        }}
                                    >
                                        <div className={styles.buyComfirmTimeText}>{step.key}</div>
                                        <div className={styles.buyComfirmTimeText}>{step.value}</div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className={styles.buyNotice}>
                            <div className={styles.buyNoticeText}>
                                <div className={styles.blueCircle}>•&nbsp;</div>
                                {
                                    'T日：交易日，15:00(含)之前为T日，15:00之后为T+1日。周末和法定节假日属于非交易日，以支付成功时间为准。\n'
                                }
                            </div>
                            <div className={styles.blueCircle}>•&nbsp;</div>
                            <div className={styles.buyNoticeText}>
                                {'以上时间点仅供参考，具体时间以各基金公司实际确认为准。'}
                            </div>
                        </div>
                    </div>
                    <div className={styles.title} style={{marginTop: px(10), paddingTop: px(16)}}>
                        {data.rate?.title}
                    </div>
                    <div className={classNames([styles.feeHeadTitle, styles.flexBetween])}>
                        <div className={styles.feeHeadTitleText}>{data.rate?.table?.th && data.rate?.table?.th[0]}</div>
                        <div className={styles.feeHeadTitleText}>{data.rate?.table?.th && data.rate?.table?.th[1]}</div>
                    </div>
                    {data.rate?.table?.tr_list?.map?.((item, index, arr) => {
                        return (
                            <div
                                key={`fee${index}`}
                                className={classNames([styles.feeTableItem, styles.flexBetween])}
                                style={{
                                    backgroundColor: index % 2 === 0 ? '#fff' : '#F5F6F8',
                                    borderBottomWidth: index === arr?.length - 1 ? '1px' : 0,
                                }}
                            >
                                <div className={styles.feeTableLeftText}>{item[0]}</div>
                                <div className={styles.feeTableRightText}>{item[1]}</div>
                            </div>
                        )
                    })}
                    <div className={styles.feeDescBox}>
                        <div
                            className={styles.feeDesc}
                            dangerouslySetInnerHTML={{__html: data.rate?.table?.adjust_content}}
                        ></div>
                    </div>
                </>
            ) : (
                <>
                    <div className={styles.productInfoWrap}>
                        <div className={styles.productInfoTitle}>{data[0]?.title}</div>
                        <img alt="" src={lineIcon} className={styles.line} />
                        <div className={styles.buyComfirmTime}>
                            {data[0]?.steps?.map?.((step, idx, arr) => {
                                return (
                                    <div
                                        key={`confirm_step${idx}`}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems:
                                                idx === 0
                                                    ? 'flex-start'
                                                    : idx === arr.length - 1
                                                    ? 'flex-end'
                                                    : 'center',
                                        }}
                                    >
                                        <div className={styles.buyComfirmTimeText}>{step.key}</div>
                                        <div className={styles.buyComfirmTimeText}>{step.value}</div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className={styles.buyNotice}>
                            <div className={styles.blueCircle}>•&nbsp;</div>
                            <div className={[styles.buyNoticeText]}>
                                {
                                    'T日：交易日15:00前购买/赎回则当日为T日，15:00后购买/赎回则下一个交易日为T日，购买/赎回净值均按T日基金单位净值确认。周末和法定节假日不属于交易日。'
                                }
                            </div>
                        </div>
                        <div className={styles.buyTableWrap}>
                            <div className={styles.buyTableHead}>
                                <div className={styles.buyTableCell} style={{flex: 1.5}}>
                                    <div className={classNames([styles.buyTableItem, styles.fontColor])}>
                                        {data[0]?.table?.th[0]}
                                    </div>
                                </div>
                                <div className={styles.buyTableCell}>
                                    <div className={classNames([styles.buyTableItem, styles.fontColor])}>
                                        {data[0]?.table?.th[1]}
                                    </div>
                                </div>
                                <div className={styles.buyTableCell} style={{borderRightWidth: 0}}>
                                    <div className={classNames([styles.buyTableItem, styles.fontColor])}>
                                        {data[0]?.table?.th[2]}
                                    </div>
                                </div>
                            </div>
                            {data[0]?.table?.tr_list?.map((item, index) => {
                                return (
                                    <div
                                        className={styles.buyTableBody}
                                        style={{backgroundColor: index % 2 === 1 ? '#F5F6F8' : '#fff'}}
                                        key={`confirm_row${index}`}
                                    >
                                        <div className={styles.buyTableCell} style={{flex: 1.5}}>
                                            <div
                                                className={styles.buyTableItem}
                                                dangerouslySetInnerHTML={{__html: item[0]}}
                                            ></div>
                                        </div>
                                        <div className={styles.buyTableCell}>
                                            <div
                                                className={styles.buyTableItem}
                                                dangerouslySetInnerHTML={{__html: item[1]}}
                                            ></div>
                                        </div>
                                        <div className={styles.buyTableCell} style={{borderRightWidth: 0}}>
                                            <div
                                                className={styles.buyTableItem}
                                                dangerouslySetInnerHTML={{__html: item[2]}}
                                            ></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className={styles.productInfoWrap}>
                        <div className={styles.productInfoTitle}>{data[1]?.title}</div>
                        <img alt="" src={lineIcon} className={styles.line} />
                        <div className={styles.buyComfirmTime} style={{borderBottomWidth: 0, marginBottom: 0}}>
                            {data[1]?.steps?.map((step, idx, arr) => {
                                return (
                                    <div
                                        key={`confirm_step${idx}`}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems:
                                                idx === 0
                                                    ? 'flex-start'
                                                    : idx === arr.length - 1
                                                    ? 'flex-end'
                                                    : 'center',
                                        }}
                                    >
                                        <div className={styles.buyComfirmTimeText}>{step.key}</div>
                                        <div className={styles.buyComfirmTimeText}>{step.value}</div>
                                    </div>
                                )
                            })}
                        </div>
                        {/* <Text style={styles.buyNotice}>
                              <Text style={styles.blueCircle}>• </Text>
                              <Text style={[styles.buyNoticeText]}>{''}</Text>
                          </Text> */}
                        <div className={styles.buyTableWrap}>
                            <div className={styles.buyTableHead}>
                                <div className={styles.buyTableCell} style={{flex: 1.5}}>
                                    <div className={classNames([styles.buyTableItem, styles.fontColor])}>
                                        {data[1]?.table?.th[0]}
                                    </div>
                                </div>
                                <div className={styles.buyTableCell}>
                                    <div className={classNames([styles.buyTableItem, styles.fontColor])}>
                                        {data[1]?.table?.th[1]}
                                    </div>
                                </div>
                                <div className={styles.buyTableCell} style={{borderRightWidth: 0}}>
                                    <div className={classNames([styles.buyTableItem, styles.fontColor])}>
                                        {data[1]?.table?.th[2]}
                                    </div>
                                </div>
                            </div>
                            {data[1]?.table?.tr_list?.map((item, index) => {
                                return (
                                    <div
                                        className={styles.buyTableBody}
                                        style={{backgroundColor: index % 2 === 1 ? '#F5F6F8' : '#fff'}}
                                        key={`confirm_row${index}`}
                                    >
                                        <div className={styles.buyTableCell} style={{flex: 1.5}}>
                                            <div
                                                dangerouslySetInnerHTML={{__html: item[0]}}
                                                className={styles.buyTableItem}
                                            ></div>
                                        </div>
                                        <div className={styles.buyTableCell}>
                                            <div
                                                dangerouslySetInnerHTML={{__html: item[1]}}
                                                className={styles.buyTableItem}
                                            ></div>
                                        </div>
                                        <div className={styles.buyTableCell} style={{borderRightWidth: 0}}>
                                            <div
                                                dangerouslySetInnerHTML={{__html: item[2]}}
                                                className={styles.buyTableItem}
                                            ></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className={styles.productInfoWrap} style={{marginBottom: 0}}>
                        <div className={styles.productInfoTitle}>{`${isPlan ? '优化计划' : '调仓'} 确认时间`}</div>
                        <div className={styles.buyNotice} style={{paddingTop: 0}}>
                            <div className={styles.blueCircle}>•&nbsp;</div>
                            <div className={styles.buyNoticeText}>
                                {`${isPlan ? '优化计划' : '调仓'}确认时间是由赎回时间+购买时间组成，${
                                    isPlan ? '优化计划' : '调仓'
                                }赎回的资金是分别到账的，每到账一笔，都会按比例购买需要调入的基金。一般情况将在T+2日完成${
                                    isPlan ? '优化计划' : '调仓'
                                }，如遇QDII基金赎回，这部分资金将在T+7日完成${isPlan ? '优化计划' : '调仓'}。`}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    ) : (
        <div className={styles.beforeMask}>
            <DotLoading />
        </div>
    )
}

const Part3 = () => {
    const [data, setData] = useState({})
    const params = qs.parse(window.location.search.split('?')[1])
    useEffect(() => {
        const {upid, poid, allocation_id} = params || {}
        http.get('/portfolio/mustknow/20210101', {
            upid,
            type: 'trade_amount',
            poid,
            allocation_id,
        }).then((res) => {
            if (res.code == '000000') {
                setData(res.result.data)
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return Object.keys(data).length > 0 ? (
        <div>
            <div className={styles.productInfoWrap}>
                <div className={styles.productInfoTitle}>{data[0]?.title}</div>
                <div className={styles.buyNotice}>
                    <div
                        className={styles.buyComfirmTimeText}
                        style={{color: '#9aA1B2'}}
                        dangerouslySetInnerHTML={{__html: data[0]?.content}}
                    ></div>
                </div>
                <div className={styles.buyTableWrap}>
                    <div className={styles.buyTableHead}>
                        <div className={styles.buyTableCell}>
                            <div className={classNames([styles.buyTableItem, styles.fontColor])}>
                                {data[0]?.table?.th[0]}
                            </div>
                        </div>
                        <div className={styles.buyTableCell} style={{borderRightWidth: 0}}>
                            <div className={classNames([styles.buyTableItem, styles.fontColor])}>
                                {data[0]?.table?.th[1]}
                            </div>
                        </div>
                    </div>
                    {data[0]?.table?.tr_list?.map((item, index) => {
                        return (
                            <div
                                className={styles.buyTableBody}
                                key={index + 'baaa'}
                                style={{backgroundColor: (index + 1) % 2 == 0 ? '#F5F6F8' : '#fff'}}
                            >
                                <div className={styles.buyTableCell}>
                                    <div
                                        className={styles.buyTableItem}
                                        dangerouslySetInnerHTML={{__html: item[0]}}
                                    ></div>
                                </div>
                                <div className={styles.buyTableCell} style={{borderRightWidth: 0}}>
                                    <div
                                        className={styles.buyTableItem}
                                        dangerouslySetInnerHTML={{__html: item[1]}}
                                    ></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className={styles.productInfoWrap} style={{marginBottom: 0}}>
                <div className={styles.productInfoTitle}>{data[1]?.title}</div>
                <div className={styles.buyNotice}>
                    <div
                        className={styles.buyComfirmTimeText}
                        style={{color: '#9aA1B2'}}
                        dangerouslySetInnerHTML={{__html: data[1]?.content}}
                    ></div>
                </div>
                <div className={styles.buyTableWrap}>
                    <div className={styles.buyTableHead}>
                        <div className={styles.buyTableCell} style={{flex: 1.5}}>
                            <div className={classNames([styles.buyTableItem, styles.fontColor])}>
                                {data[1]?.table?.th[0]}
                            </div>
                        </div>
                        <div className={styles.buyTableCell}>
                            <div className={classNames([styles.buyTableItem, styles.fontColor])}>
                                {data[1]?.table?.th[1]}
                            </div>
                        </div>
                        <div className={styles.buyTableCell} style={{borderRightWidth: 0}}>
                            <div className={classNames([styles.buyTableItem, styles.fontColor])}>
                                {data[1]?.table?.th[2]}
                            </div>
                        </div>
                    </div>
                    {data[1]?.table?.tr_list?.map((item, index) => {
                        return (
                            <div
                                key={index + 'c'}
                                className={styles.buyTableBody}
                                style={{backgroundColor: (index + 1) % 2 == 0 ? '#F5F6F8' : '#fff'}}
                            >
                                <div className={styles.buyTableCell} style={{flex: 1.5}}>
                                    <div
                                        className={styles.buyTableItem}
                                        dangerouslySetInnerHTML={{__html: item[0]}}
                                    ></div>
                                </div>
                                <div className={styles.buyTableCell}>
                                    <div
                                        className={styles.buyTableItem}
                                        dangerouslySetInnerHTML={{__html: item[1]}}
                                    ></div>
                                </div>
                                <div className={styles.buyTableCell} style={{borderRightWidth: 0}}>
                                    <div
                                        className={styles.buyTableItem}
                                        dangerouslySetInnerHTML={{__html: item[2]}}
                                    ></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    ) : (
        <div className={styles.beforeMask}>
            <DotLoading />
        </div>
    )
}

const Part4 = () => {
    const [data, setData] = useState([])
    const params = qs.parse(window.location.search.split('?')[1])
    useEffect(() => {
        const {upid, poid, allocation_id} = params || {}
        http.get('/portfolio/mustknow/20210101', {
            upid,
            type: 'bank_limit',
            poid,
            allocation_id,
        }).then((res) => {
            if (res.code == '000000') {
                setData(res.result.data)
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <div style={{backgroundColor: '#fff'}}>
            {data.map((item, index) => {
                return (
                    <div className={styles.banklistWrap} key={index + 'l'}>
                        <Image src={item.icon} style={{width: px(28), height: px(28)}} />
                        <div className={styles.banklistItem}>
                            <div style={{textAlign: 'left', color: '#545968'}}>{item.name}</div>
                            <div style={{textAlign: 'right', flex: 1, color: '#545968'}}>{item.tip}</div>
                        </div>
                    </div>
                )
            })}
            {data?.length === 0 && (
                <div className={styles.beforeMask}>
                    <DotLoading />
                </div>
            )}
        </div>
    )
}

export default TradeRules
