/*
 * @Date: 2021-02-22 18:20:12
 * @Author: dx
 * @LastEditors: yhc
 * @LastEditTime: 2021-09-02 14:37:03
 * @Description: 银行卡管理
 */
import React, {useCallback, useEffect, useState} from 'react'
// import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
// import {useFocusEffect} from '@react-navigation/native';
// import Image from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/FontAwesome'
import {isIphoneX} from '../../utils/appUtil.js'
import {Colors, Font, Space, Style} from '../../common/commonStyle'
import http from '../../service/index.js'
import FixedButton from '../../components/Button/FixedButton'
import Empty from '../../components/EmptyTip'
import {jump, px} from '../../utils'
import noCard from '../../image/noCard.png'
import {useHistory} from 'react-router-dom'
// import {sendPoint} from '../Insurance/utils/sendPoint'
const BankCardList = ({navigation}) => {
    const history = useHistory()
    const [data, setData] = useState({})
    const [showEmpty, setShowEmpty] = useState(false)

    const init = useCallback(() => {
        http.get('/passport/bank_card/manage/20210101').then((res) => {
            setShowEmpty(true)
            if (res.code === '000000') {
                document.title = res.result.title || '绑定银行卡'
                setData(res.result)
            }
        })
        // }, [navigation])
    }, [])
    useEffect(() => {
        init()
    }, [init])
    return (
        <div style={styles.container}>
            <div style={{paddingLeft: px(16), paddingRight: px(16)}}>
                {data.xy?.cards?.length > 0 && (
                    <div style={{paddingTop: px(12), paddingBottom: px(6)}}>
                        <span style={{...styles.title}}>{data.xy.text}</span>
                    </div>
                )}
                {data.xy?.cards?.map((item, index) => {
                    return (
                        <div
                            key={item.pay_method}
                            style={{...Style.flexRow, ...styles.cardBox}}
                            onClick={() => {
                                history.push(`/BankCard/${item.pay_method}`)
                            }}
                        >
                            <div style={{...Style.flexRow, flex: 1}}>
                                <img src={item.bank_icon} style={styles.bankLogo} />
                                <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                                    <span style={styles.cardNum}>
                                        {item.bank_name}({item.bank_no})
                                    </span>
                                    <span style={{...styles.title, marginTop: px(2)}}>{item.limit_desc}</span>
                                </div>
                            </div>
                            <Icon name={'angle-right'} size={20} color={Colors.lightGrayColor} />
                        </div>
                    )
                })}
                {data.ym?.cards?.length > 0 && (
                    <div style={{paddingTop: px(12), paddingBottom: px(6)}}>
                        <span style={{...styles.title}}>{'盈米银行卡'}</span>
                    </div>
                )}
                {data.ym?.cards?.map((item, index) => {
                    return (
                        <div
                            key={item.pay_method}
                            style={{...Style.flexRow, ...styles.cardBox}}
                            onClick={() => {
                                history.push(`/BankCard/${item.pay_method}`)
                            }}
                        >
                            <div style={{...Style.flexRow, flex: 1}}>
                                <img src={item.bank_icon} style={styles.bankLogo} />
                                <div style={{display: 'flex', flex: 1, flexDirection: 'column'}}>
                                    <span style={styles.cardNum}>
                                        {item.bank_name}({item.bank_no})
                                    </span>
                                    <span style={{...styles.title, marginTop: px(2)}}>{item.limit_desc}</span>
                                </div>
                            </div>
                            <Icon name={'angle-right'} size={20} color={Colors.lightGrayColor} />
                        </div>
                    )
                })}
                {showEmpty &&
                (Object.keys(data).length === 0 ||
                    (!data?.xy?.cards && !data?.ym?.cards) ||
                    (data?.xy?.cards?.length === 0 && data?.ym?.cards?.length === 0)) ? (
                    <>
                        <Empty img={noCard} text={'暂无银行卡'} desc={'您目前还未绑定任何银行卡'} />
                        <FixedButton
                            isFixed={false}
                            title={data?.button?.text}
                            style={{...styles.btn, ...{marginLeft: px(4), marginRight: px(4), marginTop: px(86)}}}
                            onClick={() => {
                                global.LogTool('click', 'addBankCard')
                                jump(data?.button?.url)
                            }}
                        />
                    </>
                ) : null}
            </div>
            {Object.keys(data).length === 0 ||
            (!data?.xy?.cards && !data?.ym?.cards) ||
            (data?.xy?.cards?.length === 0 && data?.ym?.cards?.length === 0) ? null : (
                <FixedButton
                    title={data?.button?.text}
                    style={styles.btn}
                    onClick={() => {
                        jump(data?.button?.url)
                    }}
                />
            )}
        </div>
    )
}

const styles = {
    container: {
        flex: 1,
        overflowY: 'scroll',
        backgroundColor: Colors.bgColor,
    },
    title: {
        fontSize: Font.pxH3,
        // lineHeight: px(17),
        color: Colors.lightGrayColor,
    },
    cardBox: {
        marginBottom: px(12),
        // paddingVertical: px(13),
        paddingTop: px(13),
        paddingBottom: px(13),
        paddingLeft: px(16),
        paddingRight: px(16),
        borderRadius: Space.borderRadius,
        backgroundColor: '#fff',
    },
    bankLogo: {
        width: px(28),
        height: px(28),
        marginRight: px(13),
    },
    cardNum: {
        fontSize: Font.pxH2,
        // lineHeight: px(20),
        color: Colors.defaultColor,
        fontWeight: '500',
    },
    btn: {
        marginLeft: px(20),
        marginRight: px(20),
        marginBottom: isIphoneX() ? 34 + Space.marginVertical : Space.marginVertical,
    },
}

export default BankCardList
