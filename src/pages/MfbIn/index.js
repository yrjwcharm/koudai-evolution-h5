/*
 * @Author: xjh
 * @Date: 2021-01-26 11:04:08
 * @Description:魔方宝充值
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-20 19:32:22
 */
import React, {Component, useEffect} from 'react'
import {useSelector} from 'react-redux'
import http from '~/service'
import qs from 'querystring'
import {onlyNumber} from '~/utils/appUtil'
import {Dialog, Image, Input, Toast} from 'antd-mobile'
import {jump, px} from '~/utils'
import classNames from 'classnames'
import styles from './index.module.scss'
import {Colors, Font} from '~/common/commonStyle'
import {CloseCircleOutline, RightOutline} from 'antd-mobile-icons'
import {BankCardModal, PasswordModal} from '~/components/Modal'
import BottomDesc from '~/components/BottomDesc'
import Agreements from '~/components/Agreements'

class MfbIn extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: '',
            amount: '',
            password: '',
            bankSelect: '',
            tips: '',
            enable: false,
            checked: true,
            code: this.params?.code || '',
        }
    }

    params = qs.parse(window.location.search.split('?')[1] || '')

    init = () => {
        http.get('/wallet/recharge/info/20210101', {code: this.state.code}).then((data) => {
            if (data.code === '000000') {
                this.setState({
                    data: data.result,
                    bankSelect: data.result?.pay_methods?.[0],
                })
            }
        })
    }

    onInput = (amount) => {
        const {data, bankSelect} = this.state
        const _amount = onlyNumber(amount)
        if (amount > 0) {
            if (amount > Number(bankSelect.left_amount)) {
                const tips = '由于银行卡单日限额，今日最多可转入金额为' + bankSelect.left_amount + '元'
                this.setState({
                    tips,
                    enable: false,
                    amount: _amount,
                })
            } else if (amount > bankSelect.single_amount) {
                const tips = '最大单笔转入金额为' + bankSelect.single_amount + '元'
                this.setState({
                    tips,
                    enable: false,
                    amount: _amount,
                })
            } else if (amount < data.recharge_info.start_amount) {
                const tips = '最低转入金额' + data.recharge_info.start_amount + '元'
                this.setState({
                    tips,
                    enable: false,
                    amount: _amount,
                })
            } else {
                this.setState({
                    tips: '',
                    enable: true,
                    amount: _amount,
                })
            }
        } else {
            const tips = '请输入转入金额'
            this.setState({
                tips,
                enable: false,
                amount: '',
            })
            return false
        }
    }
    submit = () => {
        if (!this.state.checked) {
            Toast.show('请勾选协议！')
        } else {
            this.passwordModal.show()
        }
    }
    //清空输入框
    clearInput = () => {
        this.setState({amount: '', enable: false})
    }
    //切换银行卡
    changeBankCard = () => {
        this.bankCard.show()
    }
    submitData = (password) => {
        const {bankSelect, code} = this.state
        Toast.show({icon: 'loading', duration: 0})
        this.setState(
            {
                password: this.state.password,
            },
            () => {
                http.post('/wallet/recharge/do/20210101', {
                    code: code,
                    amount: this.state.amount,
                    password: password,
                    pay_method: bankSelect.pay_method,
                }).then((res) => {
                    Toast.clear()
                    if (res.code === '000000') {
                        jump({
                            path: 'TradeProcessing',
                            params: {
                                txn_id: res.result.txn_id,
                                fr: this.params?.fr,
                            },
                        })
                    } else {
                        Toast.show(res.message)
                    }
                })
            },
        )
    }
    render_bank() {
        const {data, bankSelect} = this.state
        const {pay_methods} = data
        return (
            <div style={{marginBottom: px(12)}}>
                <div className={classNames([styles.bankCard, styles.flexBetween])}>
                    {pay_methods.length > 0 ? (
                        <div onClick={this.changeBankCard} className={styles.flexRow} style={{width: '100%'}}>
                            <Image className={styles.bank_icon} src={bankSelect.bank_icon} />
                            <div style={{flex: 1}}>
                                <div
                                    style={{
                                        color: '#101A30',
                                        fontSize: px(14),
                                        marginBottom: px(4),
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {bankSelect?.bank_name} ({bankSelect?.bank_no})
                                </div>
                                <div style={{color: Colors.lightGrayColor, fontSize: px(12)}}>
                                    {bankSelect?.limit_desc}
                                </div>
                            </div>
                            <div>
                                <div style={{color: Colors.lightGrayColor, fontSize: px(12)}}>
                                    切换
                                    <RightOutline size={12} />
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        )
    }
    //购买
    render_buy() {
        const {amount, data, tips, bankSelect} = this.state
        const {recharge_info, pay_methods, remit_pay, agreement} = data
        return (
            <div style={{}}>
                <PasswordModal
                    _ref={(ref) => {
                        this.passwordModal = ref
                    }}
                    onDone={(password) => this.submitData(password)}
                />
                <div className={styles.title}>魔方宝</div>
                <div className={styles.buyCon}>
                    <div style={{fontSize: px(16), marginVertical: px(4)}}>{recharge_info?.text}</div>
                    <div className={styles.buyInput}>
                        <div style={{fontSize: px(26), fontFamily: Font.numFontFamily}}>¥</div>
                        <Input
                            type="number"
                            ref={(ref) => {
                                this.textInput = ref
                            }}
                            className={styles.inputStyle}
                            placeholder={recharge_info.placeholder}
                            style={{'--placeholder-color': Colors.placeholderColor, '--font-size': px(30)}}
                            onChange={(value) => {
                                this.onInput(value)
                            }}
                            autoFocus={true}
                            value={amount.toString()}
                        />
                        {amount.length > 0 && (
                            <div onClick={this.clearInput}>
                                <CloseCircleOutline color="#CDCDCD" size={16} />
                            </div>
                        )}
                    </div>
                    {tips ? <div className={styles.tips_sty}>{tips}</div> : null}
                </div>
                {remit_pay ? (
                    <div
                        className={classNames([styles.notice_sty, styles.flexRow])}
                        onClick={() => {
                            jump({path: remit_pay?.button?.url.path})
                        }}
                    >
                        <div style={{color: '#fff', flex: 1}}>{remit_pay?.tip}</div>
                        <div style={{backgroundColor: '#fff', borderRadius: px(3)}}>
                            <div className={styles.notice_btn_sty}>{remit_pay?.button?.text}</div>
                        </div>
                    </div>
                ) : null}
                {/* 银行卡 */}
                {this.render_bank()}

                <Agreements
                    onChange={(checked) => {
                        this.setState({checked})
                    }}
                    title="我已阅读并同意"
                    style={styles.agreementStyle}
                    data={agreement}
                />

                <BottomDesc />
                <BankCardModal
                    data={pay_methods || []}
                    _ref={(ref) => {
                        this.bankCard = ref
                    }}
                    select={pay_methods?.findIndex((item) => item.pay_method === bankSelect?.pay_method)}
                    onDone={(select) => {
                        this.setState({bankSelect: select})
                        this.onInput(amount)
                    }}
                />
            </div>
        )
    }

    render() {
        const {data, enable} = this.state
        const {button, recharge_info} = data
        return (
            <div className={styles.container}>
                <Focus init={this.init} />
                {recharge_info && this.render_buy()}
                {button && (
                    <div className={styles.bottomBtnWrap}>
                        <div
                            className={styles.bottomBtn}
                            style={{opacity: button?.avail == 0 || !enable ? 0.5 : 1}}
                            onClick={() => {
                                let dis = button?.avail == 0 || !enable
                                !dis && this.submit()
                            }}
                        >
                            {button?.text}
                        </div>
                    </div>
                )}
            </div>
        )
    }
}

function Focus({init}) {
    useEffect(() => {
        init()
    }, [init])
    return null
}
function WithHooks(props) {
    const userInfo = useSelector((state) => state.userInfo) || {}
    useEffect(() => {
        const {anti_pop} = userInfo
        if (anti_pop) {
            Dialog.confirm({
                title: anti_pop.title,
                content: anti_pop.content,
                closeOnMaskClick: false,
                confirmText: anti_pop.confirm_action?.text,
                cancelText: anti_pop.cancel_action?.text,
                onCancel: () => props.history.goBack(),
                onConfirm: () => {
                    jump(anti_pop.confirm_action?.url)
                },
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userInfo])
    return <MfbIn {...props} jump={jump} />
}

export default WithHooks
