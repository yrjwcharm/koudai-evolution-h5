/*
 * @Date: 2021-02-23 10:41:48
 * @Description: 银行卡
 */
import React, {useEffect, useRef, useState} from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'
import {Colors, Font, Space, Style} from '../../common/commonStyle'
import http from '../../service/index.js'
// import {Modal} from '../../components/Modal';
import {PasswordModal} from '../../components/Modal'
import {useSelector} from 'react-redux'
import {jump, px} from '../../utils'
import {Dialog, Toast} from 'antd-mobile'
import {useHistory} from 'react-router-dom'
import {sendPoint} from '../Insurance/utils/sendPoint'
const BankCard = ({match}) => {
    const params = match.params || {}
    const history = useHistory()
    const userInfo = useSelector((store) => store.userinfo)
    const [data, setData] = useState({})
    const passwordModal = useRef(null)

    const onClick = async (item) => {
        sendPoint({
            pageid: item.type,
            ts: Date.now(),
            chn: 'evolution-h5', // 渠道
            event: 'click',
        })
        if (item.url) {
            if (item.type === 'modify_phone') {
                if (userInfo?.has_trade_pwd) {
                    jump(item.url)
                } else {
                    // jump(item.url)
                    const result = await Dialog.confirm({
                        content: `为了资金安全，${item.text}需先设置数字交易密码`,
                    })
                    if (result) {
                        history.push(`/SetTradePassword`, {action: 'modify_phone', url: item.url})
                    }
                }
            }
        } else {
            if (item.type === 'unbind') {
                if (userInfo?.has_trade_pwd) {
                    passwordModal.current.show()
                } else {
                    const result = await Dialog.confirm({
                        content: `为了资金安全，${item.text}需先设置数字交易密码`,
                    })
                    if (result) {
                        history.push(`/SetTradePassword`, {action: 'unbind'})
                    }
                }
            }
        }
    }
    const onDone = (password) => {
        http.post('/passport/bank_card/unbind/20210101', {
            password,
            pay_method: params?.pay_method,
        }).then((res) => {
            Toast.show({content: res.message})
            if (res.code === '000000') {
                global.LogTool('unbind', 'success')
                history.goBack()
            }
        })
    }

    useEffect(() => {
        http.get('/passport/bank_card/detail/20210101', {
            pay_method: params?.pay_method,
        }).then((res) => {
            if (res.code === '000000') {
                document.title = res.result.title || '银行卡'
                setData(res.result)
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <div style={styles.container}>
            <PasswordModal _ref={passwordModal} onDone={onDone} />
            <div style={styles.cardBox}>
                <div style={{background: `url(${data?.bank_info?.bank_bg}) no-repeat center`, ...styles.cardBg}}>
                    <div style={{paddingTop: px(19), display: 'flex', flexDirection: 'column', paddingLeft: px(68)}}>
                        <span style={{...styles.name, marginBottom: px(2)}}>{data?.bank_info?.bank_name}</span>
                        <span style={styles.limit}>{data?.bank_info?.limit_desc}</span>
                    </div>
                    <div style={{...Style.flexRow, marginTop: px(32)}}>
                        <span style={styles.cardNo}>{'****'}</span>
                        <span style={styles.cardNo}>{'****'}</span>
                        <span style={styles.cardNo}>{'****'}</span>
                        <span style={styles.cardNo}>{data?.bank_info?.bank_no}</span>
                    </div>
                </div>
                <div style={{paddingLeft: px(16), paddingRight: px(16), backgroundColor: '#fff'}}>
                    {data?.operation?.map((item, index) => {
                        return (
                            <div key={item + index}>
                                {index !== 0 && <div style={styles.line} />}
                                <div style={{...Style.flexBetween, height: px(60)}} onClick={() => onClick(item)}>
                                    <div style={Style.flexRow}>
                                        <img src={item.icon} style={styles.icon} alt="" />
                                        <span style={styles.opTitle}>{item.text}</span>
                                    </div>
                                    <Icon name={'angle-right'} size={20} color={Colors.lightGrayColor} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: {
        flex: 1,
        overflowY: 'scroll',
        backgroundColor: Colors.bgColor,
    },
    cardBox: {
        margin: Space.marginAlign,
        borderRadius: Space.borderRadius,
        overflow: 'hidden',
    },
    cardBg: {
        width: '100%',
        height: px(150),
    },
    name: {
        fontSize: Font.textH1,
        lineHeight: px(22),
        color: '#fff',
        fontWeight: '500',
    },
    limit: {
        fontSize: Font.textH3,
        lineHeight: px(17),
        color: '#fff',
        opacity: 0.69,
    },
    cardNo: {
        flex: 1,
        fontSize: px(24),
        lineHeight: px(29),
        color: '#fff',
        fontWeight: '500',
        fontFamily: Font.numMedium,
        textAlign: 'center',
    },
    icon: {
        width: px(22),
        // height: px(22),
        marginRight: px(8),
    },
    opTitle: {
        fontSize: Font.textH2,
        lineHeight: px(20),
        color: Colors.lightBlackColor,
    },
    line: {
        borderTopWidth: Space.borderWidth,
        borderColor: Colors.borderColor,
    },
}

export default BankCard
