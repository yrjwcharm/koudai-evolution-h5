/*
 * @Date: 2021-02-18 14:54:52
 * @Author: dx
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-15 16:15:03
 * @Description: 找回交易密码
 */
import {Toast} from 'antd-mobile'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import Input from '~/components/Input'
import http from '~/service'
import {formCheck, jump} from '~/utils'
import styles from './index.module.scss'

const ResetLoginPwd = () => {
    const [name, setName] = useState('')
    const [idCardNum, setIdCardNum] = useState('')
    const btnClick = useRef(true)

    // 下一步
    const submit = useCallback(() => {
        if (!btnClick.current) {
            return false
        }
        const checkData = [
            {
                field: name,
                text: '姓名不能为空',
            },
            {
                field: idCardNum,
                text: '身份证号不能为空',
            },
        ]
        if (!formCheck(checkData)) {
            return false
        } else {
            btnClick.current = false
            http.post('/passport/reset_trade_password_prepare/20210101', {
                name,
                id_no: idCardNum,
            }).then((res) => {
                btnClick.current = true
                if (res.code === '000000') {
                    Toast.show(res.message)
                    jump({
                        path: 'ForgotTradePwdNext',
                        params: {msg: res.result.msg, name, id_no: idCardNum},
                    })
                } else {
                    Toast.show(res.message)
                }
            })
        }
    }, [name, idCardNum])
    useEffect(() => {
        // if (name.length >= 6 && idCardNum.length >= 6) {
        //     setBtnClick(true);
        // } else {
        //     setBtnClick(false);
        // }
    }, [name, idCardNum])
    return (
        <div className={styles.container}>
            <Input
                maxLength={20}
                onChange={(pwd) => setName(pwd)}
                placeholder={'请输入您的姓名'}
                title={'姓名'}
                value={name}
            />
            <Input
                maxLength={20}
                onChange={(pwd) => setIdCardNum(pwd.length <= 17 ? pwd.replace(/\D/g, '') : pwd.replace(/\W/g, ''))}
                placeholder={'请输入您的身份证号'}
                title={'身份证号'}
                value={idCardNum}
            />

            <button disabled={!btnClick} onClick={submit} className={styles.btn}>
                下一步
            </button>
        </div>
    )
}

export default ResetLoginPwd
