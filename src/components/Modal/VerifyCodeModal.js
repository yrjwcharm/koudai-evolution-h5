/*
 * @Date: 2021-01-08 11:43:44
 * @Description: 底部弹窗
 */
import React, {useState, useEffect, useRef} from 'react'
import {Input, Toast} from 'antd-mobile'
import FixedButton from '../Button/FixedButton'
import BottomModal from './BottomModal'
import styles from './index.module.scss'

const VerifyCodeModal = (props) => {
    const bottomModal = useRef()
    const {
        title = '请输入手机验证码',
        desc = '验证码已发送至',
        isSign = true,
        isTouchMaskToClose = false,
        onChangeText = () => {},
        modalCancelCallBack = null,
        getCode = () => {},
        phone = '',
        buttonCallBack = null, //
        validateLength = 6, //校验输入规则
        scene = '', //使用场景 sign->银行签约
        _ref,
    } = props
    const [defaultColor, setDefaultColor] = useState('#EF8743')
    const [num, setNum] = useState(1) // 倒计时
    const timerRef = useRef(null)
    const [code, setCode] = useState('')
    const btnClick = useRef(true)

    const sendCode = () => {
        if (btnClick.current) {
            btnClick.current = false
            getCode(phone)
        }
    }
    const startTimer = (reclock, success = true) => {
        //此处是针对签约做的补丁
        if (scene === 'sign' && ((num === '重新发送验证码' && reclock === 0) || !success)) return
        // eslint-disable-next-line no-unused-expressions
        scene === 'sign' ? (num === 1 || num === '重新发送验证码' ? setNum(60) : '') : setNum(60)

        setDefaultColor('#999')
        btnClick.current = false
        timerRef.current = setInterval(() => {
            setNum((n) => {
                if (n === 1) {
                    clearInterval(timerRef.current)
                    timerRef.current = null
                    setDefaultColor('#EF8743')
                    setNum('重新发送验证码')
                    btnClick.current = true
                    return n
                }
                return n - 1
            })
        }, 1000)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }
    const hide = () => {
        bottomModal.current.hide()
    }
    // success代表验证码是否发送成功
    const show = (success = true, reclock = 1) => {
        bottomModal.current.show()
        if (!success) {
            btnClick.current = true
        }
        if (timerRef.current === null) startTimer(reclock, success)
    }
    const showToast = (t, duration = 2000) => {
        Toast.show({content: t, duration})
    }
    const onClose = () => {
        if (!isSign) {
            modalCancelCallBack && modalCancelCallBack()
        }
        timerRef.current !== null && clearInterval(timerRef.current)
        timerRef.current = null
        setCode('')
        // eslint-disable-next-line no-unused-expressions
        scene === 'sign' ? '' : setNum(1)
        setDefaultColor('#EF8743')
        btnClick.current = true
    }

    React.useImperativeHandle(_ref, () => {
        return {
            hide: hide,
            show: show,
            showToast: showToast,
        }
    })

    useEffect(() => {
        return () => {
            timerRef.current !== null && clearInterval(timerRef.current)
        }
    }, [])

    return (
        <BottomModal
            afterClose={onClose}
            bodyClassName={styles.verifyCodeModal}
            onMaskClick={isTouchMaskToClose ? () => bottomModal.current.hide() : undefined}
            ref={bottomModal}
            title={title}
        >
            <div className={styles.contentBox}>
                <span className={styles.descText}>{desc}</span>
                <div className={`flexCenter ${styles.inputWrapper}`}>
                    <Input
                        autoFocus
                        className={styles.input}
                        maxLength={6}
                        type="tel"
                        placeholder="请输入验证码"
                        onChange={(value) => {
                            setCode(value.replace(/\D/g, ''))
                            onChangeText(value.replace(/\D/g, ''))
                        }}
                        value={code}
                    />
                    <div
                        className={`flexCenter ${styles.sendCodeBtn}`}
                        // activeOpacity={defaultColor === '#EF8743' ? 0.8 : 1}
                        style={{backgroundColor: defaultColor}}
                        onClick={sendCode}
                    >
                        {typeof num === 'number' ? `${num}秒重发` : '重新发送验证码'}
                    </div>
                </div>
                {scene == 'sign' ? (
                    <FixedButton
                        title={props.buttonText}
                        disabled={code.length !== validateLength}
                        onClick={() => {
                            buttonCallBack && buttonCallBack(code)
                        }}
                    />
                ) : null}
            </div>
        </BottomModal>
    )
}

export default VerifyCodeModal
