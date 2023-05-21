/*
 * @Date: 2022/10/11 14:00
 * @Author: yanruifeng
 * @Description: 渲染列表
 */
import React from 'react'
import {px, isEmpty} from '../../../utils/appUtil'
import {Colors, Font, Style} from '../../../common/commonStyle'
import {useHistory} from 'react-router-dom'
const shadow = {
    color: '#aaa',
    border: 6,
    radius: 1,
    opacity: 0.102,
    x: 0,
    y: 1,
    style: {
        position: 'relative',
        left: px(16),
    },
}
const RenderItem = ({item, index}) => {
    // const jump = useJump();
    const history = useHistory()
    // item.url.params.avail = avail;
    return (
        <div
            style={{marginTop: px(16), marginLeft: px(32), marginRight: px(32)}}
            key={item + `` + index}
            onClick={() => {
                const {
                    params: {invest_plan_id},
                } = item.url
                history.push(`/FixedInvestDetail/${invest_plan_id}`)
            }}
        >
            <div style={styles.listRowWrap}>
                <div
                    style={{
                        ...styles.status,
                        backgroundColor:
                            item.status == '定投中' ? '#EDF7EC' : item.status == '已暂停' ? '#FDEFE4' : '#E9EAEF',
                    }}
                >
                    <span
                        style={{
                            ...styles.statusText,
                            color:
                                item.status == '定投中'
                                    ? Colors.green
                                    : item.status == '已暂停'
                                    ? '#FF7D41'
                                    : Colors.lightGrayColor,
                        }}
                    >
                        {item.status}
                    </span>
                </div>
                <div style={styles.listRowTopView}>
                    <div style={styles.listRowTopWrap}>
                        <div style={styles.top}>
                            <div style={styles.topView}>
                                <span style={styles.type}>{item.type}</span>
                            </div>
                            <span
                                style={{
                                    ...styles.invest_num,
                                    fontSize: px(24),
                                    marginLeft: px(16),
                                    fontWeight: 'normal',
                                    fontFamily: Font.pingFangMedium,
                                }}
                            >
                                {item.name}
                            </span>
                        </div>
                        <div style={{...styles.bottom, marginTop: px(22)}}>
                            <div style={styles.bottomWrap}>
                                <div style={Style.flexRow}>
                                    <span style={styles.autoInvestIssure}>{item.unit}</span>
                                    <span
                                        style={{
                                            ...styles.invest_num,
                                            fontSize: px(28),
                                            fontWeight: '500',
                                            fontFamily: Font.numMedium,
                                        }}
                                    >
                                        {item.values}
                                    </span>
                                </div>
                                <span
                                    style={{
                                        ...styles.invest_num,
                                        fontSize: px(28),
                                        fontWeight: '500',
                                        fontFamily: Font.numMedium,
                                    }}
                                >
                                    {item.times}
                                </span>
                                <span
                                    style={{
                                        ...styles.invest_num,
                                        fontSize: px(28),
                                        fontWeight: '500',
                                        fontFamily: Font.numMedium,
                                    }}
                                >
                                    {item.sum}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                {!isEmpty(item.detail) && (
                    <div style={styles.listRowBottomView}>
                        <span style={styles.desc}>{item.detail}</span>
                    </div>
                )}
            </div>
        </div>
    )
}

RenderItem.propTypes = {}

export default RenderItem
const styles = {
    status: {
        display: 'flex',
        position: 'absolute',
        right: 0,
        top: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: px(92),
        height: px(38),
        borderBottomLeftRadius: px(8),
        borderTopRightRadius: px(12),
    },
    top: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    autoInvestWrap: {
        display: 'flex',
        flexDirection: 'row',
        position: 'absolute',
        top: px(124),
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    bottomWrap: {
        ...Style.flexBetween,
    },
    autoInvest: {
        width: window.innerWidth - px(64),
        height: px(140),
    },
    header: {},
    automaticInvestDaysView: {
        marginLeft: px(32),
        marginTop: px(40),
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: px(20),
        fontFamily: Font.pingFangMedium,
        fontWeight: 'normal',
        color: Colors.white,
    },
    topView: {
        borderStyle: 'solid',
        borderWidth: 0.5,
        backgroundColor: Colors.white,
        borderRadius: px(4),
        paddingLeft: px(8),
        paddingRight: px(8),
        paddingTop: px(4),
        paddingBottom: px(4),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#BDC2CC',
    },
    desc: {
        fontSize: px(24),
        fontFamily: Font.pingFangRegular,
        fontWeight: '400',
        color: Colors.lightGrayColor,
    },
    statusText: {
        fontSize: px(20),
        fontFamily: Font.pingFangRegular,
        fontWeight: 'normal',
    },
    autoInvestIssure: {
        marginRight: px(12),
        fontSize: px(20),
        fontFamily: Font.numRegular,
        color: Colors.lightGrayColor,
    },
    listRowWrap: {
        // marginHorizontal: px(16),
        position: 'relative',
        backgroundColor: Colors.white,
        // paddingHorizontal: px(32),
        paddingLeft: px(32),
        paddingRight: px(32),
        borderRadius: px(12),
        background: `linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 100%)`,
        boxShadow: `0px 8px 20px 0px rgba(170,170,170,0.102)`,
    },
    invest_num: {
        color: Colors.defaultColor,
    },
    type: {
        fontSize: px(20),
        fontFamily: Font.pingFangRegular,
        fontWeight: 'normal',
        color: Colors.lightBlackColor,
    },
    listRowTopWrap: {
        position: 'relative',
    },

    listRowTopView: {
        display: 'flex',
        flexDirection: 'column',
        height: px(140),
        justifyContent: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: '#E9EAEF',
        borderBottomStyle: 'solid',
    },
    listRowBottomView: {
        display: 'flex',
        flexDirection: 'column',
        borderTopWidth: 0.5,
        borderTopColor: '#E9EAEF',
        borderTopStyle: 'solid',
        height: px(100),
        justifyContent: 'center',
    },
}
