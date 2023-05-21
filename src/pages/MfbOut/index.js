import {Image, Input, Toast} from 'antd-mobile'
import React, {Component, useEffect} from 'react'
import http from '~/service'
import {jump, px} from '~/utils'
import styles from './index.module.scss'
import {onlyNumber} from '~/utils/appUtil'
import qs from 'querystring'
import {Colors, Font} from '~/common/commonStyle'
import PasswordModal from '~/components/Modal/PasswordModal'
import BottomDesc from '~/components/BottomDesc'
import {BankCardModal} from '~/components/Modal'
import classNames from 'classnames'
import Radio from '~/components/Radio'
import {RightOutline} from 'antd-mobile-icons'
function Focus({init}) {
    useEffect(() => {
        init()
    }, [init])
    return null
}
class MfbOut extends Component {
    constructor(props) {
        super(props)
        const params = qs.parse(window.location.search.split('?')[1] || '')
        this.state = {
            data: '',
            amount: '',
            password: '',
            bankSelect: 0,
            check: [],
            selectData: {},
            optionChoose: 1,
            tips: '',
            enable: false,
            code: params.code,
        }
    }
    init = () => {
        const {selectData, code} = this.state
        http.get('/wallet/withdraw/info/20210101', {code: code}).then((data) => {
            selectData.comAmount = data.result.pay_methods?.[0].common_withdraw_amount
            selectData.comText = data.result.pay_methods?.[0].common_withdraw_subtext
            selectData.quickAmount = data.result.pay_methods?.[0].quick_withdraw_amount
            selectData.quickText = data.result.pay_methods?.[0].quick_withdraw_subtext
            const withdraw_options = data.result.withdraw_options
            this.state.check.push(withdraw_options[0].default)
            if (withdraw_options.length > 1) {
                this.state.check.push(withdraw_options[1].default)
            }
            this.setState({
                data: data.result,
                selectData: selectData,
                check: this.state.check,
                optionChoose: withdraw_options[0]?.type,
            })
        })
    }
    onInput = (amount) => {
        this.setState({amount: onlyNumber(amount)})
        const {data, bankSelect} = this.state
        const pay_methods = data.pay_methods[bankSelect]
        if (amount > 0) {
            //optionChoose==1快速提现
            if (this.state.optionChoose === 1) {
                if (amount > pay_methods.quick_withdraw_amount || amount > pay_methods?.left_amount) {
                    const tips = '转出金额大于可转出金额'
                    return this.setState({
                        tips,
                        enable: false,
                    })
                } else {
                    if (pay_methods.left_amount - amount < 500 && pay_methods.left_amount - amount > 0) {
                        return this.setState({
                            tips: '账户最低持仓金额500元',
                            enable: false,
                        })
                    }
                    return this.setState({
                        tips: '',
                        enable: true,
                    })
                }
            } else if (this.state.optionChoose === 0) {
                if (amount > pay_methods.common_withdraw_amount || amount > pay_methods?.left_amount) {
                    const tips = '转出金额大于可转出金额'
                    return this.setState({
                        tips,
                        enable: false,
                    })
                } else {
                    if (pay_methods.left_amount - amount < 500 && pay_methods.left_amount - amount > 0) {
                        return this.setState({
                            tips: '账户最低持仓金额500元',
                            enable: false,
                        })
                    }
                    return this.setState({
                        tips: '',
                        enable: true,
                    })
                }
            }
        } else if (amount && amount == 0) {
            const tips = '转出金额不能为0'
            this.setState({
                tips,
                enable: false,
            })
        } else {
            const tips = '请输入转出金额'
            this.setState({
                tips,
                enable: false,
            })
        }
    }

    submit = () => {
        this.passwordModal.show()
    }
    allAmount = () => {
        //optionChoose==1快速提现
        if (this.state.optionChoose === 1) {
            this.setState(
                {
                    amount: this.state.selectData.quickAmount.toString(),
                },
                () => {
                    this.isEnAble()
                },
            )
        } else {
            this.setState(
                {
                    amount: this.state.selectData.comAmount.toString(),
                },
                () => {
                    this.isEnAble()
                },
            )
        }
    }
    isEnAble = () => {
        if (!Number(this.state.amount)) {
            this.setState({
                enable: false,
            })
        } else {
            this.setState({
                enable: true,
            })
        }
        this.onInput(this.state.amount)
    }
    //切换银行卡
    changeBankCard = () => {
        this.bankCard.show()
    }
    radioChange(index, type) {
        let check = this.state.check
        check = check.map((item) => false)
        check[index] = true
        this.setState(
            {
                check,
                optionChoose: type,
            },
            () => {
                this.onInput(this.state.amount)
            },
        )
    }
    getBankInfo(index, comAmount, comText, quickAmount, quickText) {
        const selectData = this.state.selectData
        selectData.comAmount = comAmount
        selectData.comText = comText
        selectData.quickAmount = quickAmount
        selectData.quickText = quickText
        this.setState({
            selectData: selectData,
            bankSelect: index,
        })
    }
    // 提交数据
    submitData = (password) => {
        Toast.show({icon: 'loading', duration: 0})
        const {code, amount, data, bankSelect, optionChoose} = this.state
        this.setState({password: this.state.password}, () => {
            http.post('/wallet/withdraw/do/20210101', {
                code: code,
                amount: amount,
                password: password,
                pay_method: data.pay_methods[bankSelect].pay_method,
                type: optionChoose,
            }).then((res) => {
                Toast.clear()
                if (res.code === '000000') {
                    jump({path: 'TradeProcessing', params: {txn_id: res.result.txn_id}})
                } else {
                    Toast.show(res.message)
                }
            })
        })
    }

    render_Radio() {
        const {withdraw_options} = this.state.data
        const {selectData} = this.state
        return (
            <div style={{marginBottom: px(20)}}>
                {withdraw_options &&
                    !!withdraw_options.length > 0 &&
                    withdraw_options.map((_item, index) => {
                        return (
                            <div
                                onClick={() => this.radioChange(index, _item.type)}
                                key={index}
                                className={classNames([styles.flexRow, styles.card_item, styles.card_select])}
                                style={{
                                    borderBottomWidth: index < withdraw_options.length - 1 ? 0.5 : 0,
                                    borderColor: Colors.borderColor,
                                }}
                            >
                                <Radio
                                    checked={this.state.check[index]}
                                    index={index}
                                    onChange={() => this.radioChange(index, _item.type)}
                                />
                                <div style={{flex: 1, paddingLeft: px(10)}}>
                                    <div style={{color: Colors.descColor, fontWeight: 'bold'}}>{_item.text}</div>
                                    <div className={styles.desc_sty}>
                                        {index == 0 ? selectData?.quickText : selectData?.comText}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
            </div>
        )
    }

    render_bank() {
        const {data, bankSelect} = this.state
        const {pay_methods} = data
        return (
            <>
                <div className={classNames([styles.bankCard, styles.flexBetween])}>
                    {pay_methods ? (
                        <div className={styles.flexRow} style={{width: '100%'}} onClick={() => this.changeBankCard()}>
                            <Image className={styles.bank_icon} src={pay_methods[bankSelect]?.bank_icon} />
                            <div style={{flex: 1}}>
                                <div style={{color: '#101A30', fontSize: px(14), marginBottom: 8}}>
                                    {pay_methods[bankSelect]?.bank_name}({pay_methods[bankSelect]?.bank_no})
                                </div>
                                <div style={{color: Colors.lightGrayColor, fontSize: px(12)}}>
                                    {pay_methods[bankSelect]?.limit_desc}
                                </div>
                            </div>
                            <div>
                                <div style={{color: Colors.lightGrayColor}}>
                                    切换
                                    <RightOutline size={12} />
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </>
        )
    }

    render_buy() {
        const {amount, data, bankSelect, tips} = this.state
        const {withdraw_info, pay_methods} = data
        return (
            <div style={{}}>
                <PasswordModal
                    _ref={(ref) => {
                        this.passwordModal = ref
                    }}
                    onDone={(password) => this.submitData(password)}
                />
                {this.render_bank()}
                <div className={styles.buyCon}>
                    <div style={{fontSize: px(16), marginVertical: px(4)}}>{withdraw_info.text}</div>
                    <div className={styles.buyInput}>
                        <div style={{fontSize: px(26), fontFamily: Font.numFontFamily}}>¥</div>
                        <div style={{flex: 1}}>
                            <Input
                                type="number"
                                className={styles.inputStyle}
                                placeholder={withdraw_info?.placeholder}
                                onChange={(value) => {
                                    this.onInput(value)
                                }}
                                style={{'--placeholder-color': '#CCD0DB', '--font-size': px(30)}}
                                value={amount}
                                autoFocus={true}
                            />
                        </div>
                        <div onClick={this.allAmount}>
                            <div style={{color: '#0051CC'}}>{withdraw_info?.button.text}</div>
                        </div>
                    </div>
                    {tips ? <div className={styles.tips_sty}>{tips}</div> : null}
                </div>

                {this.render_Radio()}
                <BottomDesc />
                <BankCardModal
                    data={pay_methods || []}
                    _ref={(ref) => {
                        this.bankCard = ref
                    }}
                    select={bankSelect}
                    onDone={(item, index) => {
                        this.getBankInfo(
                            index,
                            pay_methods[index]?.common_withdraw_amount,
                            pay_methods[index]?.common_withdraw_subtext,
                            pay_methods[index]?.quick_withdraw_amount,
                            pay_methods[index]?.quick_withdraw_subtext,
                        )
                        this.setState({
                            bankSelect: index,
                        })
                        this.onInput(amount)
                    }}
                />
            </div>
        )
    }

    render() {
        const {data, enable} = this.state
        const {button, withdraw_info} = data
        return (
            <div className={styles.container}>
                <Focus init={this.init} />
                {withdraw_info && this.render_buy()}
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

export default MfbOut
