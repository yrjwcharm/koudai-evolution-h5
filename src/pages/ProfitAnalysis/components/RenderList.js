/*
 * @Date: 2022/10/1 16:22
 * @Author: yanruifeng
 * @Description:列表渲染封装
 */

import React, {useEffect, useMemo, useState} from 'react'
import {delMille, isEmpty} from '../../../utils/appUtil'
import {Colors, Font, Style} from '../../../common/commonStyle'
import {getProfitDetail} from '../services'
// import {useJump} from '../../../components/hooks';
import Empty from '../../../components/Empty'
import Sort from '../assets/sort.png'
import Desc from '../assets/desc.png'
import Asc from '../assets/asc.png'
import {Loading} from 'antd-mobile'
import {jump, px} from '../../../utils'
import {px as convertPx} from '../../../utils/appUtil'
import {sendPoint} from '../../Insurance/utils/sendPoint'
const RenderList = React.memo(({curDate = '', poid = '', type, fund_code = '', unitType}) => {
    const [[left, right], setHeaderList] = useState([])
    const [profitList, setProfitList] = useState([])
    const [loading] = useState(false)
    const [showEmpty, setShowEmpty] = useState(false)
    // const jump = useJump();
    useEffect(() => {
        let didCancel = false
        ;(async () => {
            let params = {
                type,
                unit_type: unitType,
                poid,
                unit_key: curDate,
                fund_code,
            }
            if (type && unitType && curDate) {
                const res = await getProfitDetail(params)
                if (res?.code === '000000') {
                    if (!didCancel) {
                        const {head_list = [], data_list = []} = res?.result || {}
                        setHeaderList(head_list)
                        setProfitList(data_list)
                        data_list.length > 0 ? setShowEmpty(false) : setShowEmpty(true)
                    }
                }
            }
        })()
        return () => (didCancel = true)
    }, [type, unitType, curDate, poid, fund_code])
    const executeSort = async (data) => {
        if (data.sort_key) {
            const res = await getProfitDetail({
                type,
                unit_type: unitType,
                unit_key: curDate,
                poid,
                fund_code,
                sort_key: data?.sort_key,
                sort: data?.sort_type == 'asc' ? '' : data?.sort_type == 'desc' ? 'asc' : 'desc',
            })
            if (res.code === '000000') {
                const {head_list, data_list} = res.result || {}
                setHeaderList(head_list)
                setProfitList(data_list)
            }
        }
    }
    const renderList = useMemo(
        () => (
            <>
                {profitList?.length > 0 ? (
                    profitList?.map((item, index) => {
                        let color =
                            delMille(item.profit) > 0
                                ? Colors.red
                                : delMille(item.profit) < 0
                                ? Colors.green
                                : Colors.lightGrayColor
                        return (
                            <div style={styles.listRow} key={item + '' + index}>
                                <div style={styles.typeView}>
                                    <div style={styles.typeWrap}>
                                        <span style={{...styles.type, fontSize: px(10)}}>{item.type}</span>
                                    </div>
                                    <div
                                        onClick={() => {
                                            sendPoint({
                                                pageid: 'MfbIndex',
                                                ts: Date.now(),
                                                chn: 'evolution-h5', // 渠道
                                                event: 'click',
                                            })
                                            jump(item?.url)
                                        }}
                                    >
                                        <span
                                            style={{...styles.title, fontSize: item.text.length > 10 ? px(8) : px(10)}}
                                        >
                                            {item.text}
                                        </span>
                                    </div>
                                    {!isEmpty(item.anno) && <span style={{fontSize: px(8)}}>{item.anno}</span>}
                                    {item.tag ? (
                                        <div
                                            style={{
                                                borderRadius: px(4),
                                                backgroundColor: '#EFF5FF',
                                                marginLeft: px(6),
                                            }}
                                        >
                                            <span style={styles.tag}>{item.tag}</span>
                                        </div>
                                    ) : null}
                                </div>
                                <span style={{...styles.detail, color: `${color}`}}>{item.profit}</span>
                            </div>
                        )
                    })
                ) : showEmpty ? (
                    <Empty text={'暂无数据'} imageStyle={{width: px(120), height: px(64)}} />
                ) : null}
            </>
        ),

        [profitList, showEmpty],
    )
    return (
        <>
            {loading ? (
                <Loading color={Colors.btnColor} />
            ) : (
                <>
                    {left && right && (
                        <div style={styles.profitHeader}>
                            <div style={styles.profitHeaderLeft}>
                                <span style={styles.profitLabel}>{left?.text}</span>
                                <span style={styles.profitDate}>{left?.time}</span>
                            </div>
                            <div onClick={() => executeSort(right)}>
                                <div style={styles.profitHeaderRight}>
                                    <span style={styles.moneyText}>{right?.text}</span>
                                    <img
                                        width={convertPx(12)}
                                        src={isEmpty(right?.sort_type) ? Sort : right?.sort_type == 'desc' ? Desc : Asc}
                                        alt={''}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <div style={{marginBottom: px(8)}}>{renderList}</div>
                </>
            )}
        </>
    )
})
export default RenderList
const styles = {
    profitHeader: {
        marginTop: px(24),
        ...Style.flexBetween,
    },
    tag: {
        // paddingHorizontal: px(12),
        // paddingVertical: px(4),
        paddingTop: px(2),
        paddingBottom: px(2),
        paddingLeft: px(6),
        paddingRight: px(6),
        borderRadius: px(2),
        // fontSize: Font.textSm,
        fontSize: px(11),
        color: Colors.brandColor,
    },
    profitHeaderLeft: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    profitHeaderRight: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    profitLabel: {
        fontSize: px(13),
        fontFamily: Font.pingFangMedium,
        color: Colors.defaultColor,
    },
    profitDate: {
        marginLeft: px(4),
        // fontSize: Font.textH3,
        fontSize: px(12),
        fontFamily: Font.pingFangRegular,
        color: Colors.lightGrayColor,
    },
    moneyText: {
        marginRight: px(4),
        fontFamily: Font.pingFangRegular,
        color: Colors.defaultColor,
        fontSize: px(12),
    },
    listRow: {
        marginTop: px(12),
        ...Style.flexBetween,
    },
    typeView: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeWrap: {
        // width: px(28),
        // height: px(18),
        // paddingVertical: px(4),
        // paddingHorizontal: px(8),
        paddingTop: px(2),
        paddingBottom: px(2),
        paddingLeft: px(4),
        paddingRight: px(4),
        borderRadius: px(2),
        borderStyle: 'solid',
        borderWidth: 0.5,
        ...Style.flexCenter,
        borderColor: '#BDC2CC',
    },
    type: {
        fontSize: px(10),
        fontFamily: Font.pingFangRegular,
        color: Colors.lightBlackColor,
    },
    title: {
        marginLeft: px(6),
        // fontSize: Font.textH3,
        fontSize: px(12),
        fontFamily: Font.pingFangRegular,
        color: Colors.defaultColor,
    },
    detail: {
        fontSize: px(13),
        fontFamily: Font.numMedium,
        fontWeight: '500',
    },
}
