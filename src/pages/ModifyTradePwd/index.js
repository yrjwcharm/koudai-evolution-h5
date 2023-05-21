import {Toast} from 'antd-mobile'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import Input from '~/components/Input'
import http from '~/service'
import {formCheck} from '~/utils'
import styles from './index.module.scss'

const ModifyTradePwd = ({history}) => {
    const [oldPwd, setOldPwd] = useState('')
    const [newPwd, setNewPwd] = useState('')
    const [confirmPwd, setConfirmPwd] = useState('')
    const btnClick = useRef(true)

    // 完成密码修改
    const submit = useCallback(() => {
        if (!btnClick.current) {
            return false
        }
        const checkData = [
            {
                field: oldPwd,
                text: '当前交易密码不能为空',
            },
            {
                field: newPwd,
                text: '新交易密码不能为空',
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
            if (oldPwd.length < 6) {
                Toast.show('当前交易密码错误')
                return false
            } else if (newPwd.length < 6) {
                Toast.show('新交易密码不能少于6位')
                return false
            } else if (confirmPwd !== newPwd) {
                Toast.show('两次输入不一致')
                return false
            } else {
                btnClick.current = false
                http.post('/passport/edit_trade_password/20210101', {
                    password: oldPwd,
                    new_password: newPwd,
                    con_new_password: confirmPwd,
                }).then((res) => {
                    if (res.code === '000000') {
                        Toast.show(res.message)
                        history.goBack()
                    } else {
                        btnClick.current = true
                        Toast.show(res.message)
                    }
                })
            }
        }
    }, [oldPwd, newPwd, confirmPwd, history])
    useEffect(() => {
        // if (oldPwd.length >= 6 && newPwd.length >= 6 && confirmPwd.length >= 6) {
        //     setBtnClick(true);
        // } else {
        //     setBtnClick(false);
        // }
    }, [oldPwd, newPwd, confirmPwd])
    return (
        <div className={styles.container}>
            <Input
                type="password"
                maxLength={6}
                onChange={(pwd) => setOldPwd(pwd.replace(/\D/g, ''))}
                placeholder={'请输入当前交易密码'}
                title={'当前密码'}
                value={oldPwd}
            />
            <Input
                type="password"
                maxLength={6}
                onChange={(pwd) => setNewPwd(pwd.replace(/\D/g, ''))}
                placeholder={'请输入新的6位数字交易密码'}
                title={'新的密码'}
                value={newPwd}
            />
            <Input
                type="password"
                maxLength={6}
                onChange={(pwd) => setConfirmPwd(pwd.replace(/\D/g, ''))}
                placeholder={'确认新的交易密码'}
                title={'确认密码'}
                value={confirmPwd}
            />
            <button disabled={!btnClick} onClick={submit} className={styles.btn}>
                确定
            </button>
        </div>
    )
}

export default ModifyTradePwd
