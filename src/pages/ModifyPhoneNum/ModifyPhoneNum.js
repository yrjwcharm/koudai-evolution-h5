/* eslint-disable react-hooks/exhaustive-deps */
/*
 * @Date: 2021-02-23 15:56:11
 * @Description: 修改预留手机号
 */
import React, {useCallback, useRef, useState} from 'react'
import {handlePhone} from '~/utils/appUtil.js'
import {Colors, Style} from '~/common/commonStyle'
import http from '~/service/index'
import FixedButton from '~/components/Button/FixedButton'
import InputView from '~/components/Input'
import {VerifyCodeModal} from '~/components/Modal'
import {PasswordModal} from '~/components/Modal'
import {px} from '~/utils'
import {Toast} from 'antd-mobile'
import {useHistory} from 'react-router-dom'
import QueryString from 'qs'
import {sendPoint} from '../Insurance/utils/sendPoint'
import classes from './index.module.scss'
const ModifyPhoneNum = () => {
    const [phone, setPhone] = useState('')
    const history = useHistory()
    const params = QueryString.parse(window.location.href.split('?')[1]) || {}
    const btnClick = useRef(true)
    const codeModal = useRef(null)
    const passwordModal = useRef(null)
    const tradePwdVerified = useRef(false)

    const submit = useCallback(() => {
        sendPoint({
            pageid: 'modify',
            ts: Date.now(),
            chn: 'evolution-h5', // 渠道
            event: 'click',
        })
        if (!btnClick.current) {
            return false
        }
        if (phone.length === 0) {
            Toast.show({content: '手机号不能为空'})
        } else {
            if (!/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(phone)) {
                Toast.show({content: '手机号不合法'})
                return false
            } else {
                btnClick.current = false
                http.post('/passport/check/payment_mobile/20210101', {
                    mobile: phone,
                    pay_method: params.pay_method,
                }).then((res) => {
                    if (res.code === '000000') {
                        if (tradePwdVerified.current === true) {
                            getCode(phone)
                        } else {
                            passwordModal.current.show()
                        }
                    } else {
                        Toast.show({
                            content: res.message,
                            afterClose: () => {
                                btnClick.current = true
                            },
                        })
                    }
                })
            }
        }
    }, [phone])
    const onDone = useCallback(
        (password) => {
            http.post('/passport/verify_trade_password/20210101', {password}).then((res) => {
                if (res.code === '000000') {
                    tradePwdVerified.current = true
                    getCode(phone)
                } else {
                    Toast.show({content: res.message})
                    btnClick.current = true
                }
            })
        },
        [phone],
    )
    const getCode = useCallback((mobile) => {
        if (!mobile) {
            return false
        }
        http.post('/passport/send_verify_code/20210101', {
            mobile,
            operation: 'change_payment_mobile',
        }).then((res) => {
            btnClick.current = true
            Toast.show({content: res.message})
            if (res.code === '000000') {
                setTimeout(() => {
                    codeModal.current.show()
                }, 2000)
            }
        })
    }, [])
    const onChangeText = useCallback(
        (value) => {
            if (value.length === 6) {
                http.post('/passport/update/payment_mobile/20210101', {
                    mobile: phone,
                    pay_method: params.pay_method,
                    verify_code: value,
                }).then((res) => {
                    // Toast.show(res.message, {position: px(120), showMask: false});
                    codeModal.current.showToast(res.message)
                    if (res.code === '000000') {
                        sendPoint({
                            pageid: 'modifySuccess',
                            ts: Date.now(),
                            chn: 'evolution-h5', // 渠道
                            event: 'click',
                        })
                        codeModal.current.hide()
                        history.goBack()
                    }
                })
            }
        },
        [phone],
    )

    return (
        <>
            <VerifyCodeModal
                _ref={codeModal}
                desc={`验证码已发送至${handlePhone(phone)}`}
                onChangeText={onChangeText}
                getCode={getCode}
                phone={phone}
            />
            <div style={styles.container}>
                <PasswordModal
                    _ref={passwordModal}
                    onDone={onDone}
                    onClose={() => {
                        btnClick.current = true
                    }}
                />
                <div style={{...Style.flexRowCenter, paddingTop: px(32), paddingBottom: px(16)}}>
                    <img src={params.bank_icon} style={styles.icon} alt="" />
                    <span style={styles.cardNum}>{params.bank_name}</span>
                </div>
                <InputView
                    clearButtonMode={'while-editing'}
                    keyboardType={'phone-pad'}
                    maxLength={11}
                    onChange={(value) => setPhone(value.replace(/\D/g, ''))}
                    placeholder={'请输入您的银行预留手机号'}
                    style={classes.inputView}
                    textContentType={'telephoneNumber'}
                    title={'手机号'}
                    value={phone}
                />
                <div style={{...styles.tips, paddingTop: px(12), paddingBottom: px(24), paddingLeft: px(32)}}>
                    {'请务必确认已在发卡行完成预留手机号修改'}
                </div>
                <FixedButton
                    isFixed={false}
                    title={'修改'}
                    style={{marginLeft: px(22), marginRight: px(22)}}
                    onClick={submit}
                />
            </div>
        </>
    )
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        backgroundColor: '#fff',
    },
    icon: {
        width: px(28),
        height: px(28),
        borderRadius: px(14),
        marginRight: px(12),
    },
    cardNum: {
        fontSize: px(14),
        lineHeight: px(20),
        color: Colors.defaultColor,
        fontWeight: '500',
    },
    inputView: {
        marginLeft: px(22),
        marginRight: px(22),
        backgroundColor: '#F5F6F8',
        height: px(50),
    },
    tips: {
        fontSize: px(12),
        lineHeight: px(17),
        color: Colors.lightGrayColor,
    },
}

export default ModifyPhoneNum
