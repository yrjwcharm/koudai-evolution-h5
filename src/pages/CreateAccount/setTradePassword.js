/*
 * @Date: 2022-12-14 15:12:06
 * @Description: 设置交易密码
 */
import React, {useEffect, useRef, useState} from 'react'
import {useDispatch} from 'react-redux'
import {useLocation} from 'react-router'
import {Dialog, PasscodeInput, Toast} from 'antd-mobile'
import qs from 'qs'
import BottomDesc from '~/components/BottomDesc'
import third from '~/image/account/third.png'
import passwordIcon from '~/image/account/password.png'
import {getUserInfo} from '~/redux/actions/userinfo'
import http from '~/service'
import {jump} from '~/utils'
import styles from './index.module.scss'

const SetTradePassword = ({history}) => {
    const dispatch = useDispatch()
    const location = useLocation()
    const params = location.search ? qs.parse(location.search.slice(1)) : {}
    const input = useRef()
    const pwdFirst = useRef('')
    const [pwdMsg, setPwdMsg] = useState('设置6位数字交易密码')
    const [password, setPassword] = useState('')

    const onReset = () => {
        setPassword('')
        setPwdMsg('设置6位数字交易密码')
        pwdFirst.current = ''
    }

    useEffect(() => {
        input.current.focus()
    }, [])

    useEffect(() => {
        if (password.length === 6) {
            if (!/\d/g.test(password)) Toast.show('交易密码只能为6位数字')
            else {
                if (pwdFirst.current === '') {
                    setPwdMsg('请再次设置您的6位数字交易密码')
                    pwdFirst.current = password
                    setPassword('')
                } else {
                    if (password === pwdFirst.current) {
                        http.post('/passport/set_trade_password/20210101', {...params, password}).then((res) => {
                            if (res.code === '000000') {
                                dispatch(getUserInfo())
                                const {jump_url} = res.result
                                input.current.blur()
                                if (params.action === 'modify_phone') {
                                    Dialog.alert({
                                        confirmText: '立即跳转',
                                        content: '交易密码设置成功，即将跳转至修改预留手机号页面',
                                        onConfirm: () => jump(params.url, 'replace'),
                                    })
                                    return false
                                } else if (params.fr === 'add_bank_card') {
                                    Dialog.alert({
                                        confirmText: '立即跳转',
                                        content: '交易密码设置成功，即将跳转至添加银行卡页面',
                                        onConfirm: () => jump(params.url, 'replace'),
                                    })
                                    return false
                                } else if (
                                    params.action === 'unbind' ||
                                    params.fr === 'wallet' ||
                                    params.action === 'firstSet' ||
                                    params.fr === 'TradePwdManagement'
                                ) {
                                    Toast.show({afterClose: history.goBack, content: res.message})
                                    return false
                                }
                                Toast.show({
                                    afterClose: () => {
                                        if (jump_url?.path) {
                                            jump(jump_url, 'replace')
                                        } else {
                                            history.goBack()
                                        }
                                    },
                                    content: '设置密码成功，即将跳转',
                                })
                            } else {
                                Toast.show(res.message)
                                setPassword('')
                                setPwdMsg('设置6位数字交易密码')
                                pwdFirst.current = ''
                            }
                        })
                    } else {
                        Toast.show('两次设置的交易密码不一致')
                        setPassword('')
                    }
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [password])

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <img className={styles.stepImg} src={third} alt="" />
                <div className={styles.card}>
                    <div className={`defaultFlex hairline hairline--bottom ${styles.title} ${styles.cardHeader}`}>
                        <img className={styles.cardMes} src={passwordIcon} alt="" />
                        {pwdMsg}
                    </div>
                    <div className={styles.inputBox}>
                        <PasscodeInput
                            onChange={(val) => setPassword(val.replace(/\D/g, ''))}
                            ref={input}
                            seperated
                            style={{'--cell-gap': 0, '--cell-size': '.92rem', '--border-radius': '.1rem'}}
                            value={password}
                        />
                    </div>
                    <div className={styles.resetText} onClick={onReset}>
                        重新设置密码
                    </div>
                </div>
                <BottomDesc style={{marginRight: 0, marginLeft: 0}} />
            </div>
        </div>
    )
}

export default SetTradePassword
