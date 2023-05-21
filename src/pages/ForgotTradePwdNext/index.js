/*
 * @Date: 2021-02-23 16:31:24
 * @Author: dx
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-15 16:15:13
 * @Description: 找回交易密码下一步
 */
import {Toast} from 'antd-mobile'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useDispatch} from 'react-redux'
import {getUserInfo} from '~/redux/actions/userinfo'
import http from '~/service'
import {formCheck, px} from '~/utils'
import styles from './index.module.scss'
import qs from 'querystring'
import Input from '~/components/Input'

const ForgotTradePwdNext = ({history}) => {
    const params = qs.parse(window.location.search.split('?')[1] || '')
    const dispatch = useDispatch()
    const [msg] = useState(params?.msg)
    const [second, setSecond] = useState(0)
    const [codeText, setCodeText] = useState('60秒后可重发')
    const btnClick = useRef(true)
    const timerRef = useRef('')
    const [code, setCode] = useState('')
    const [newPwd, setNewPwd] = useState('')
    const [confirmPwd, setConfirmPwd] = useState('')
    const subBtnClick = useRef(true)

    const getCode = useCallback(() => {
        if (btnClick.current) {
            btnClick.current = false
            http.post('/passport/reset_trade_password_prepare/20210101', {
                name: params?.name,
                id_no: params?.id_no,
            }).then((res) => {
                if (res.code === '000000') {
                    Toast.show(res.message)
                    timer()
                } else {
                    Toast.show(res.message)
                    btnClick.current = true
                }
            })
        }
    }, [btnClick, timer, params])
    const timer = useCallback(() => {
        setSecond(60)
        setCodeText('60秒后可重发')
        btnClick.current = false
        timerRef.current = setInterval(() => {
            setSecond((prev) => {
                if (prev === 1) {
                    clearInterval(timerRef.current)
                    setCodeText('重新获取')
                    btnClick.current = true
                    return prev
                } else {
                    setCodeText(prev - 1 + '秒后可重发')
                    return prev - 1
                }
            })
        }, 1000)
    }, [])
    // 完成找回密码
    const submit = useCallback(() => {
        if (!subBtnClick.current) {
            return false
        }
        const checkData = [
            {
                field: code,
                text: '验证码不能为空',
            },
            {
                field: newPwd,
                text: '新密码不能为空',
            },
            {
                field: confirmPwd,
                text: '确认密码不能为空',
            },
        ]
        if (!formCheck(checkData)) {
            return false
        } else if (newPwd !== confirmPwd) {
            Toast.show('两次输入的密码不一致')
            return false
        } else {
            subBtnClick.current = false
            http.post('/passport/reset_trade_password/20210101', {
                code,
                new_password: newPwd,
                con_new_password: confirmPwd,
            }).then((res) => {
                subBtnClick.current = true
                if (res.code === '000000') {
                    dispatch(getUserInfo())
                    Toast.show(res.message)
                    history.go(-2)
                } else {
                    Toast.show(res.message)
                }
            })
        }
    }, [code, dispatch, newPwd, confirmPwd, history])

    useEffect(() => {
        timer()
        return () => {
            clearInterval(timerRef.current)
        }
    }, [timer, timerRef])
    return (
        <div className={styles.container}>
            <div className={styles.desc} style={{paddingTop: px(22), paddingLeft: px(16)}}>
                {msg}
            </div>
            <Input
                type="tel"
                maxLength={6}
                onChange={(value) => setCode(value.replace(/\D/g, ''))}
                placeholder={'请输入验证码'}
                style={styles.input}
                title={'验证码'}
                value={code}
            >
                <div className={styles.inputRightText} onClick={getCode}>
                    {codeText}
                </div>
            </Input>
            <Input
                type="password"
                maxLength={6}
                onChange={(value) => setNewPwd(value.replace(/\D/g, ''))}
                placeholder={'请输入新的6位数字交易密码'}
                style={styles.input}
                title={'新密码'}
                value={newPwd}
            />
            <Input
                type="password"
                maxLength={6}
                onChange={(value) => setConfirmPwd(value.replace(/\D/g, ''))}
                placeholder={'请确认新的交易密码'}
                style={styles.input}
                title={'确认密码'}
                value={confirmPwd}
            />

            <button onClick={submit} className={styles.btn}>
                确认
            </button>
        </div>
    )
}

export default ForgotTradePwdNext
