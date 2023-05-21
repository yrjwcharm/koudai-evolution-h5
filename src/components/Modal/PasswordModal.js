/*
 * @Date: 2021-02-02 12:27:26
 * @Description:交易密码组件
 */
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react'

import {jump} from '~/utils'
import BottomModal from './BottomModal'
import styles from './index.module.scss'
import {NumberKeyboard, PasscodeInput, Space} from 'antd-mobile'

const PasswordModal = (props) => {
    const {
        onDone,
        tip = '忘记交易密码',
        tipProps = {
            onClick: () => {
                hide()
                jump({path: 'ForgotTradePwd'})
            },
        },
        _ref,
        ...restProps
    } = props
    const bottomModal = useRef()
    const modal_id = useRef()
    const [visible, setVisible] = useState(true)

    const [pwd, setPwd] = useState('')

    const show = (id) => {
        setPwd('')
        modal_id.current = id
        bottomModal.current.show()
        setVisible(true)
    }

    const hide = () => bottomModal.current.hide()

    const onDelete = () => {
        if (pwd.length === 0) return
        const p = pwd.substring(0, pwd.length - 1)
        setPwd(p)
    }

    const onInput = (v) => {
        if (pwd.length < 6) {
            const p = pwd + v
            setPwd(p)
            if (p.length === 6) {
                onDone(p, modal_id.current)
                hide()
            }
        }
    }

    useImperativeHandle(_ref, () => ({
        show,
        hide,
    }))

    return (
        <BottomModal
            {...restProps}
            title="请输入交易密码"
            beforeHide={() => setVisible(false)}
            bodyStyle={{paddingBottom: 0}}
            ref={bottomModal}
        >
            <div className={styles.passwordBox}>
                <PasscodeInput value={pwd} />
                {tip ? (
                    <span className={styles.tip} {...tipProps}>
                        {tip}
                    </span>
                ) : null}
                <NumberKeyboard showCloseButton={false} visible={visible} onInput={onInput} onDelete={onDelete} />
            </div>
        </BottomModal>
    )
}

export default forwardRef(PasswordModal)
