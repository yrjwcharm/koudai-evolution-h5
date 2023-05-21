/* eslint-disable react-hooks/exhaustive-deps */
/*
 * @Date: 2022-12-12 10:22:40
 * @Description: 开户绑定银行卡
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useDispatch} from 'react-redux'
import {useLocation} from 'react-router'
import {Button, Form, Input, SafeArea, Toast} from 'antd-mobile'
import {CheckCircleFill} from 'antd-mobile-icons'
import qs from 'qs'
import BottomDesc from '~/components/BottomDesc'
import {BankCardModal} from '~/components/Modal'
import second from '~/image/account/second.png'
import cardMes from '~/image/account/cardMes.png'
import {getUserInfo} from '~/redux/actions/userinfo'
import http from '~/service'
import {formCheck, jump} from '~/utils'
import styles from './index.module.scss'
import {debounce} from 'lodash'

const {Item} = Form

const BankInfo = ({history}) => {
    const dispatch = useDispatch()
    const [form] = Form.useForm()
    const location = useLocation()
    const params = location.search ? qs.parse(location.search.slice(1)) : {}
    const bankModal = useRef()
    const timer = useRef()
    const [bankList, setBankList] = useState([])
    const [bankInfo, setBankInfo] = useState({})
    const [countdown, setCountdown] = useState(60)
    const [verifyText, setVerifyText] = useState('获取验证码')
    const [checked, setChecked] = useState(true)

    const btnDisabled = useMemo(() => {
        const {bank_no, code, phone, selectedBank} = bankInfo
        const errors = form.getFieldsError().reduce((prev, curr) => prev.concat(curr.errors), [])
        if (
            bank_no?.length >= 19 &&
            code?.length >= 6 &&
            errors.length === 0 &&
            phone?.length >= 11 &&
            selectedBank?.bank_code
        )
            return false
        return true
    }, [bankInfo])

    const onValuesChange = (values) => {
        const {bank_no} = values
        if (bank_no) {
            if (bank_no.length > 11)
                http.get('/passport/match/bank_card_info/20210101', {
                    bank_no: bank_no.replace(/ /g, ''),
                    fr: params.fr,
                }).then((res) => {
                    if (res.code === '000000') {
                        const index = bankList.findIndex((item) => item.bank_code === res.result.bank_code)
                        setBankInfo((prev) => ({...prev, select: index, selectedBank: res.result}))
                        form.setFieldValue('bank_name', res.result.bank_name)
                    }
                })
            setBankInfo((prev) => ({...prev, bank_no}))
            form.setFieldValue(
                'bank_no',
                bank_no
                    .replace(/\s/g, '')
                    .replace(/\D/g, '')
                    .replace(/(\d{4})(?=\d)/g, '$1 '),
            )
        } else setBankInfo((prev) => ({...prev, ...values}))
    }

    const onSelectCard = (bank, index) => {
        setBankInfo((prev) => ({...prev, select: index, selectedBank: bank}))
        form.setFieldValue('bank_name', bank.bank_name)
    }

    const sendCode = useCallback(
        debounce(
            () => {
                const errors = form.getFieldsError().reduce((prev, curr) => prev.concat(curr.errors), [])
                if (errors.length > 0) {
                    Toast.show(errors[0])
                    return false
                }
                if (countdown === 60) {
                    const {bank_name, bank_no, phone} = form.getFieldsValue()
                    const checkData = [
                        {field: bank_no, text: '银行卡号不能为空'},
                        {field: bank_name, text: '请选择银行'},
                        {field: phone, text: '手机号不能为空'},
                    ]
                    if (!formCheck(checkData)) return false
                    const {
                        selectedBank: {bank_code},
                    } = bankInfo
                    Toast.show({content: '正在发送验证码...', duration: 0})
                    http.post('/passport/xy_account/bind_prepare/20210101', {
                        ...params,
                        bank_no: bank_no.replace(/ /g, ''),
                        bank_code,
                        phone,
                    }).then((res) => {
                        Toast.clear()
                        if (res.code === '000000') {
                            Toast.show('验证码发送成功')
                            beginCountdown()
                        } else {
                            Toast.show(res.message)
                        }
                    })
                }
            },
            500,
            {leading: true, trailing: false},
        ),
        [countdown, params],
    )

    const beginCountdown = () => {
        setVerifyText(`${countdown}秒重发`)
        timer.current = setInterval(() => {
            setCountdown((prev) => {
                setVerifyText(`${prev - 1}秒重发`)
                if (prev <= 1) {
                    clearInterval(timer.current)
                    setVerifyText('重新发送验证码')
                    return 60
                }
                return prev - 1
            })
        }, 1000)
    }

    const onSubmit = useCallback(
        debounce(
            () => {
                const {bank_no, code, phone, selectedBank} = bankInfo
                const checkData = [
                    {
                        field: bank_no,
                        text: '银行卡号不能为空',
                    },
                    {
                        field: selectedBank?.bank_code,
                        text: '请选择银行',
                    },

                    {
                        field: phone,
                        text: '手机号不能为空',
                    },
                    {
                        field: code,
                        text: '验证码不能为空',
                    },
                    {
                        field: checked,
                        text: '必须同意服务协议才能完成开户',
                        append: '!',
                    },
                ]
                if (!formCheck(checkData)) return false
                Toast.show({content: '正在提交数据...', duration: 0})
                http.post('/passport/xy_account/bind_confirm/20210101', {
                    ...params,
                    bank_code: selectedBank.bank_code,
                    bank_no: bank_no.replace(/ /g, ''),
                    code,
                    phone,
                }).then((res) => {
                    Toast.clear()
                    if (res.code === '000000') {
                        const {jump_url} = res.result
                        dispatch(getUserInfo())
                        Toast.show({
                            afterClose: () => {
                                if (jump_url) jump(jump_url, 'replace')
                                else history.goBack()
                            },
                            content: '开户成功',
                        })
                    } else {
                        Toast.show(res.message)
                    }
                })
            },
            500,
            {leading: true, trailing: false},
        ),
        [bankInfo, checked, params],
    )

    useEffect(() => {
        document.title = '基金交易安全开户'
        http.get('/passport/bank_list/20210101', {fr: params.fr}).then((res) => {
            if (res.code === '000000') {
                setBankList(res.result)
            }
        })
        return () => {
            clearInterval(timer.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const {select, selectedBank} = bankInfo

    return (
        <div className={styles.container}>
            <BankCardModal
                data={bankList}
                onDone={onSelectCard}
                select={select}
                title="请选择银行卡"
                type="hidden"
                _ref={bankModal}
            />
            <div className={styles.content}>
                <img className={styles.stepImg} src={second} alt="" />
                <div className={styles.card}>
                    <div className={`defaultFlex hairline hairline--bottom ${styles.title} ${styles.cardHeader}`}>
                        <img className={styles.cardMes} src={cardMes} alt="" />
                        银行卡信息
                    </div>
                    <Form className={styles.form} form={form} layout="horizontal" onValuesChange={onValuesChange}>
                        <Item
                            label="银行卡号"
                            name="bank_no"
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (!value || value.replace(/ /g, '').length >= 16) return Promise.resolve()
                                        else return Promise.reject(new Error('请输入正确的银行卡号'))
                                    },
                                },
                            ]}
                        >
                            <Input autoComplete="off" placeholder="请输入您的银行卡号" type="text" />
                        </Item>
                        <Item arrow label="银行" name="bank_name" onClick={() => bankModal.current.show()}>
                            <Input placeholder="请选择您的银行" readOnly />
                        </Item>
                        <Item
                            label="手机号"
                            name="phone"
                            rules={[
                                {
                                    validator: (_, value) => {
                                        const phoneReg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/
                                        if (!value || phoneReg.test(value)) return Promise.resolve()
                                        else return Promise.reject(new Error('请输入正确的手机号'))
                                    },
                                },
                            ]}
                        >
                            <Input
                                autoComplete="off"
                                maxLength={11}
                                placeholder="请输入您的银行预留手机号"
                                type="tel"
                            />
                        </Item>
                        <Item
                            label="验证码"
                            name="code"
                            extra={
                                <span className={styles.sendCode} onClick={sendCode}>
                                    {verifyText}
                                </span>
                            }
                        >
                            <Input autoComplete="off" maxLength={6} placeholder="请输入验证码" type="tel" />
                        </Item>
                    </Form>
                </div>
                {(selectedBank || bankList[0])?.agreements ? (
                    <div className={styles.agreement}>
                        <div
                            className={styles.circle}
                            style={{marginRight: '.08rem', borderWidth: checked ? 0 : '.01rem'}}
                            onClick={() => setChecked((prev) => !prev)}
                        >
                            {checked ? <CheckCircleFill color="#0051CC" fontSize={'.3rem'} /> : null}
                        </div>
                        <div className={styles.agreementText}>
                            {(selectedBank || bankList[0]).agreements.desc || ''}
                            {(selectedBank || bankList[0]).agreements.list?.map?.((item, index) => {
                                const {name, url} = item
                                return (
                                    <span key={name + index} onClick={() => jump(url)} style={{color: '#0051CC'}}>
                                        {name}
                                    </span>
                                )
                            })}
                        </div>
                    </div>
                ) : null}
                <BottomDesc style={{marginRight: 0, marginLeft: 0}} />
            </div>
            <div className={styles.fixedBtnContainer}>
                <Button block className={styles.fixedBtn} disabled={btnDisabled} onClick={onSubmit}>
                    立即开户
                </Button>
                <SafeArea position="bottom" />
            </div>
        </div>
    )
}

export default BankInfo
