/* eslint-disable react-hooks/exhaustive-deps */
/*
 * @Date: 2022-12-15 10:40:51
 * @Description: 购买/定投页
 */
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import {useHistory, useLocation} from 'react-router'
import {
    Button,
    CascadePicker,
    Checkbox,
    Collapse,
    Dialog,
    Input,
    Popover,
    SafeArea,
    SpinLoading,
    Switch,
    Toast,
} from 'antd-mobile'
import {QuestionCircleOutline, RightOutline} from 'antd-mobile-icons'
import AntDesign from 'react-native-vector-icons/dist/AntDesign'
import qs from 'qs'
import fire from '~/image/trade/fire.png'
import fixIcon from '~/image/trade/fixIcon.png'
import BottomDesc from '~/components/BottomDesc'
import {BankCardModal, BottomModal, PasswordModal} from '~/components/Modal'
import http from '~/service'
import {jump, px} from '~/utils'
import styles from './index.module.scss'

const {Panel} = Collapse

const FixedButton = (props) => {
    const {agreement, disabled, onClick, otherAgreements, otherParams = {}, title = '按钮'} = props
    const {agree_text = '', default_agree, list, radio_text, text = '我已阅读并同意', text1 = ''} = agreement || {}
    const [checked, setChecked] = useState(default_agree)

    return (
        <div className={styles.fixedBtnContainer}>
            {agreement ? (
                <div className={styles.agreementBox}>
                    <Popover
                        content={radio_text}
                        getContainer={() => document.querySelector(`.${styles.container}`)}
                        mode="dark"
                        placement="topLeft"
                        style={{'--z-index': 999}}
                        visible={!checked && radio_text ? true : false}
                    >
                        <div
                            onClick={() => {
                                setChecked((prev) => !prev)
                            }}
                            style={{marginRight: px(4)}}
                        >
                            <Checkbox className={styles.checkbox} checked={checked} />
                        </div>
                    </Popover>
                    <div>
                        {text}
                        {list?.map?.((item, index) => {
                            const {title, url} = item
                            return (
                                <span key={title + index} onClick={() => jump(url)} style={{color: '#0051CC'}}>
                                    {title}
                                </span>
                            )
                        })}
                        {text1}
                        {otherAgreements?.length > 0 ? (
                            <>
                                <span
                                    onClick={() => jump({path: 'TradeAgreements', params: otherParams})}
                                    style={{color: '#0051CC'}}
                                >
                                    《产品概要》
                                </span>
                                {otherAgreements.map?.((item, index) => {
                                    const {title, url} = item
                                    return (
                                        <span key={title + index} onClick={() => jump(url)} style={{color: '#0051CC'}}>
                                            《{title}》
                                        </span>
                                    )
                                })}
                            </>
                        ) : null}
                        {agree_text}
                    </div>
                </div>
            ) : null}
            <Button block className={styles.fixedBtn} disabled={(agreement && !checked) || disabled} onClick={onClick}>
                {title}
            </Button>
            <SafeArea />
        </div>
    )
}

const TradeBuy = () => {
    const history = useHistory()
    const location = useLocation()
    const params = location.search ? qs.parse(location.search.slice(1)) : {}
    const userInfo = useSelector((store) => store.userinfo)
    const bankcardModal = useRef()
    const bottomModal = useRef()
    const passwordModal = useRef()
    const timer = useRef() // 风险揭示书倒计时
    const contentNode = useRef() // 风险揭示书内容DOM
    const needBuy = useRef()
    const isContinueBuy = useRef(false)
    const controller = useRef()
    const [type, setType] = useState(0) // 0 购买 1 定投
    const [data, setData] = useState({})
    const [planData, setPlanData] = useState({})
    const [amount, setAmount] = useState(params.amount || '')
    const [btnDisabled, setBtnDisabled] = useState(true)
    const [errTip, setErrTip] = useState('')
    const [isLargeAmount, setIsLargeAmount] = useState(params.isLargeAmount === 'true')
    const [bankcard, setBankcard] = useState()
    const [autoChargeStatus, setAutoChargeStatus] = useState(false)
    const [periodInfo, setPeriodInfo] = useState({}) // 定投周期数据
    const [countdown, setCountdown] = useState(0)
    const [visible, setVisible] = useState(false) // 风险揭示书弹窗显示状态
    const [showPicker, setShowPicker] = useState(false) // 定投周期选择器展示状态

    /** @name 支付方式列表 */
    const bankList = useMemo(() => {
        const {large_pay_method, large_pay_show_type, pay_methods = []} = data
        return [...pay_methods, ...(large_pay_method && large_pay_show_type === 1 ? [large_pay_method] : [])]
    }, [data])

    /** @name 是否为盈米用户 */
    const isYM = useMemo(() => {
        return userInfo?.po_ver === 0
    }, [userInfo])

    const init = async () => {
        const res = await http.get('/trade/set_tabs/20210101', params)
        if (res.code === '000000') {
            const {active} = res.result
            setType(active)
            http.get('/trade/buy/info/20210101', {...params, type: active}).then((resp) => {
                if (resp.code === '000000') {
                    const {
                        pay_methods,
                        period_info,
                        pop_risk_disclosure,
                        risk_disclosure,
                        risk_pop,
                        title = '买入',
                    } = resp.result
                    if (pop_risk_disclosure && risk_disclosure) showRiskDisclosure(risk_disclosure)
                    else if (risk_pop) showRiskPop(risk_pop)
                    document.title = title
                    setBankcard(pay_methods?.[0])
                    setPeriodInfo(period_info)
                    setData(resp.result)
                }
            })
        }
    }

    const showRiskDisclosure = (risk_disclosure) => {
        setCountdown(risk_disclosure.countdown)
        setVisible(true)
        timer.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev === 1)
                    contentNode.current.scrollTo({behavior: 'smooth', top: contentNode.current.scrollHeight})
                if (prev <= 1) clearInterval(timer.current)
                return prev - 1
            })
        }, 1000)
    }

    const showRiskPop = (risk_pop) => {
        const {cancel, confirm, content, title} = risk_pop
        Dialog.confirm({
            cancelText: cancel?.text,
            confirmText: confirm?.text,
            content,
            onCancel: () => {
                if (cancel?.act === 'back') history.goBack()
                else if (cancel?.act === 'jump') jump(cancel?.url)
            },
            onConfirm: () => {
                isContinueBuy.current = true
                if (confirm?.act === 'back') history.goBack()
                else if (confirm?.act === 'jump') jump(confirm?.url)
                else if (confirm?.act === 'pop_risk_disclosure') showRiskDisclosure(data.risk_disclosure)
            },
            title,
        })
    }

    const plan = (amount) => {
        return new Promise((resolve, reject) => {
            const {
                buy_info: {initial_amount},
                large_pay_method,
            } = data
            const {pay_method} = (isLargeAmount ? large_pay_method : bankcard) || {}
            controller.current?.abort?.()
            controller.current = new AbortController()
            http.get(
                '/trade/buy/plan/20210101',
                {
                    ...params,
                    amount: amount || initial_amount,
                    init: amount ? 0 : 1,
                    pay_method,
                },
                '',
                'kapi',
                controller.current.signal,
            ).then((res) => {
                if (res.code === '000000') {
                    setPlanData(res.result)
                    resolve(res.result.buy_id)
                } else {
                    setBtnDisabled(true)
                    if (res.message !== 'canceled') {
                        setErrTip(res.message)
                        reject(res.message)
                    }
                }
            })
        })
    }

    const onInput = () => {
        const {
            buy_info: {initial_amount},
            large_pay_method,
        } = data
        const currentMethod = isLargeAmount ? large_pay_method : bankcard
        const isWallet = currentMethod.pay_method === 'wallet'
        if (type === 0) {
            if (amount > currentMethod.left_amount) {
                setBtnDisabled(true)
                if (isWallet) {
                    setErrTip('魔方宝余额不足，建议')
                } else {
                    setErrTip(`您当日剩余可用额度为${currentMethod.left_amount}元${isYM ? '' : '，推荐使用大额极速购'}`)
                }
            } else if (amount > currentMethod.single_amount) {
                setBtnDisabled(true)
                setErrTip(`最大单笔购买金额为${currentMethod.single_amount}元`)
            } else if (amount >= initial_amount) {
                setBtnDisabled(false)
                setErrTip('')
                plan(amount)
            } else if (amount && amount < initial_amount) {
                setBtnDisabled(true)
                setErrTip(`起购金额为${initial_amount}元`)
            } else {
                setBtnDisabled(true)
                setErrTip('')
            }
        } else {
            if (amount > currentMethod.day_limit && !isWallet) {
                setBtnDisabled(true)
                setErrTip(`最大单日购买金额为${currentMethod.day_limit}元`)
            } else if (amount >= initial_amount) {
                setBtnDisabled(false)
                setErrTip('')
            } else if (amount && amount < initial_amount) {
                setBtnDisabled(true)
                setErrTip(`起购金额为${initial_amount}元`)
            } else {
                setBtnDisabled(true)
                setErrTip('')
            }
        }
    }

    /** @name 展示现在买一笔弹窗 */
    const showFixModal = () => {
        const {fix_modal} = data
        if (fix_modal) {
            const {cancel_text, confirm_text, content, title} = fix_modal
            Dialog.confirm({
                cancelText: cancel_text,
                closeOnMaskClick: true,
                confirmText: confirm_text,
                content,
                onCancel: () => {
                    needBuy.current = false
                    passwordModal.current.show()
                },
                onConfirm: () => {
                    needBuy.current = true
                    passwordModal.current.show()
                },
                title,
            })
        }
    }

    /** @name 点击购买按钮 */
    const buyClick = () => {
        http.post('/advisor/action/report/20220422', {action: 'confirm', poids: [params.poid]})
        const {buy_do_pop, fix_info} = data
        if (buy_do_pop) {
            const {cancel, confirm, content, title} = buy_do_pop
            Dialog.confirm({
                cancelText: cancel?.text,
                closeOnMaskClick: true,
                confirmText: confirm?.text,
                content,
                onCancel: () => {
                    if (cancel?.act === 'bakc') history.goBack()
                    else if (cancel?.act === 'jump') jump(cancel?.url)
                },
                onConfirm: () => {
                    if (confirm?.url) jump(confirm.url)
                    else if (fix_info?.first_order && type === 1) showFixModal()
                    else passwordModal.current.show()
                },
                title,
            })
        } else if (fix_info?.first_order && type === 1) showFixModal()
        else passwordModal.current.show()
    }

    /** @name 购买/定投提交 */
    const submit = (password) => {
        const {large_pay_method} = data
        const {current_date} = periodInfo || {}
        const method = isLargeAmount ? large_pay_method : bankcard
        Toast.show({content: '请稍等...', icon: 'loading'})
        if (type === 0)
            plan(amount).then((buy_id) => {
                http.post('/trade/buy/do/20210101', {
                    ...params,
                    amount,
                    buy_id: buy_id || planData.buy_id || '',
                    password,
                    pay_method: method?.pay_method || '',
                    poid: params.poid,
                    trade_method: method?.pay_type || '',
                    is_continue_buy: isContinueBuy.current,
                }).then((res) => {
                    Toast.clear()
                    if (res.code === '000000') {
                        jump({path: 'TradeProcessing', params: res.result})
                    } else {
                        Toast.show({
                            afterClose: () => passwordModal.current.show(),
                            content: res.message,
                        })
                    }
                })
            })
        else
            http.post('/trade/fix_invest/do/20210101', {
                amount,
                cycle: current_date[0],
                need_buy: needBuy.current,
                password,
                pay_method: method?.pay_method || '',
                poid: params.poid,
                timing: current_date[1],
                trade_method: method?.pay_type || '',
                wallet_auto_charge: +autoChargeStatus,
            }).then((res) => {
                Toast.clear()
                if (res.code === '000000') {
                    jump({path: 'TradeFixedConfirm', params: res.result}, 'replace')
                } else {
                    Toast.show(res.message)
                }
            })
    }

    /** @name 金额输入框 */
    const renderBuy = () => {
        const {actual_amount, adviser_fee, buy_info} = data
        const isWallet = isLargeAmount || bankcard?.pay_method === 'wallet'

        return (
            <div className={styles.inputPart}>
                <div className={styles.buyInfoTitle}>
                    {buy_info.title}
                    {buy_info.sub_title ? (
                        <span style={{fontSize: '.28rem', color: '#9aa1b2'}}> {buy_info.sub_title}</span>
                    ) : null}
                </div>
                <div className={`defaultFlex ${styles.inputBox}`}>
                    <span className={styles.unit}>￥</span>
                    <Input
                        className={styles.input}
                        max={99999999.99}
                        onChange={(val) => {
                            val >= 100000000 && Toast.show('金额需小于1亿')
                            setAmount(val >= 100000000 ? 99999999.99 : val)
                        }}
                        placeholder={buy_info.hidden_text}
                        style={{
                            '--placeholder-color': '#bdc2cc',
                            '--font-family': `${amount}`.length > 0 ? 'DINAlternate-Bold' : 'initial',
                        }}
                        type="number"
                        value={amount}
                    />
                </div>
                {amount.length > 0 ? (
                    <>
                        {errTip ? (
                            <>
                                <div className={`hairline hairline--top ${styles.tipsSty}`}>
                                    <span style={{color: '#E74949'}}>{errTip}</span>
                                    {isWallet ? (
                                        <span
                                            onClick={() => jump({path: 'MfbIn', params: {fr: 'trade_buy'}})}
                                            style={{color: '#0051CC'}}
                                        >
                                            立即充值
                                        </span>
                                    ) : null}
                                </div>
                                {isWallet && planData.left_discount_count > 0 ? (
                                    <div className={`defaultFlex hairline hairline--top ${styles.tipsSty}`}>
                                        您尚有{planData.left_discount_count}次大额极速购优惠，去汇款激活使用
                                        <div className={styles.redTag}>推荐</div>
                                    </div>
                                ) : null}
                            </>
                        ) : (
                            <>
                                {planData.fee_text && planData.large_pay_fee_info?.status !== 2 ? (
                                    <div
                                        className={`hairline hairline--top ${styles.tipsSty}`}
                                        dangerouslySetInnerHTML={{__html: planData.fee_text}}
                                    />
                                ) : null}
                                {planData.large_pay_fee_info?.text ? (
                                    <div className={`defaultFlex hairline hairline--top ${styles.tipsSty}`}>
                                        <div dangerouslySetInnerHTML={{__html: planData.large_pay_fee_info.text}} />
                                        <div className={styles.redTag}>
                                            {planData.large_pay_fee_info.status === 1 ? '推荐' : '优惠'}
                                        </div>
                                    </div>
                                ) : null}
                                {planData.score_text ? (
                                    <div
                                        className={`hairline hairline--top ${styles.tipsSty}`}
                                        dangerouslySetInnerHTML={{__html: planData.score_text}}
                                    />
                                ) : null}
                                {adviser_fee ? (
                                    <div
                                        className={`hairline hairline--top ${styles.tipsSty}`}
                                        dangerouslySetInnerHTML={{__html: adviser_fee}}
                                    />
                                ) : null}
                                {actual_amount ? (
                                    <div className={`flexBetween ${styles.tipsSty} ${styles.fixTips}`}>
                                        <div className="ellipsisLine" style={{flexShrink: 1, '--line-num': 1}}>
                                            实际定投金额:
                                            <span style={{color: '#EB7121'}}>
                                                {amount * actual_amount.min}元~{amount * actual_amount.max}元
                                            </span>
                                        </div>
                                        <span onClick={() => bottomModal.current.show()} style={{color: '#0051CC'}}>
                                            计算方式
                                        </span>
                                    </div>
                                ) : null}
                                {data.buy_info?.tip ? (
                                    <div
                                        className={`hairline hairline--top ${styles.tipsSty}`}
                                        dangerouslySetInnerHTML={{__html: data.buy_info.tip}}
                                    />
                                ) : null}
                            </>
                        )}
                    </>
                ) : null}
            </div>
        )
    }

    /** @name 定投周期 */
    const renderAutoInvestDate = () => {
        const {current_date, date_items, nextday} = periodInfo || {}
        const options =
            date_items?.map?.((item) => {
                const {key, val} = item
                return {label: key, value: key, children: val.map((v) => ({label: v, value: v}))}
            }) || []

        const onConfirm = (value) => {
            http.get('/trade/fix_invest/next_day/20210101', {
                cycle: value[0],
                timing: value[1],
            }).then((res) => {
                setPeriodInfo((prev) => ({...prev, current_date: value, nextday: res.result.nextday}))
            })
        }

        return periodInfo ? (
            <div className={styles.autoInvestDate} onClick={() => setShowPicker(true)}>
                <CascadePicker
                    onClose={() => setShowPicker(false)}
                    onConfirm={onConfirm}
                    options={options}
                    title="定投周期"
                    value={current_date}
                    visible={showPicker}
                ></CascadePicker>
                <div className={`flexBetween ${styles.autoTitle}`}>
                    定投周期
                    <div>
                        {current_date?.join?.(' ') || ''}
                        <RightOutline color="#9AA0B1" fontSize={'.24rem'} />
                    </div>
                </div>
                <div className={styles.nextday} dangerouslySetInnerHTML={{__html: nextday}} />
            </div>
        ) : null
    }

    /** @name 魔方宝自动充值 */
    const renderAutoCharge = () => {
        const {auto_charge} = data
        const {button, close_tip, desc, detail_img, label, title} = auto_charge || {}

        return auto_charge ? (
            <div className={styles.autoChargeBox}>
                <div className={`flexBetween hairline hairline--bottom ${styles.autoChargePanel}`}>
                    <div>
                        <div className={styles.autoChargeTitle}>{title}</div>
                        <div className={styles.autoChargeLabel}>{label}</div>
                    </div>
                    <Switch
                        checked={autoChargeStatus}
                        onChange={(val) => setAutoChargeStatus(val)}
                        style={{'--checked-color': '#0051CC'}}
                    />
                </div>
                <div className={styles.autoChargeDesc}>
                    <span dangerouslySetInnerHTML={{__html: desc}} />
                    {button?.text ? (
                        <div
                            className={styles.autoChargeDetail}
                            onClick={() => {
                                const {url} = button
                                url.params = {...url.params, img: detail_img}
                                jump(url)
                            }}
                        >
                            {button.text}
                        </div>
                    ) : null}
                </div>
                {autoChargeStatus && (
                    <div
                        className={`hairline hairline--top ${styles.autoChargeOpenHint}`}
                        dangerouslySetInnerHTML={{__html: close_tip}}
                    />
                )}
            </div>
        ) : null
    }

    /** @name 选择支付方式 */
    const renderMethod = () => {
        const {auto_charge, large_pay_method, large_pay_show_type, large_pay_tip} = data
        const {button} = large_pay_method || {}
        const showRadio = large_pay_method && large_pay_show_type === 2
        const needCharge = bankcard?.pay_method === 'wallet' && large_pay_show_type === 2

        return (
            <div className={styles.methodsBox}>
                <div className={`defaultFlex ${styles.payMethod}`}>
                    {showRadio ? (
                        <div onClick={() => setIsLargeAmount(false)} style={{marginRight: '.2rem'}}>
                            <Checkbox
                                indeterminate={!isLargeAmount}
                                style={{'--icon-size': '.4rem', '--adm-color-primary': '#0051CC'}}
                            />
                        </div>
                    ) : null}
                    <div className="flexBetween" onClick={() => bankcardModal.current.show()} style={{flex: 1}}>
                        <div className="defaultFlex">
                            <img className={styles.bankIcon} src={bankcard?.bank_icon} alt="" />
                            <div>
                                <div className={styles.bankName}>
                                    {bankcard?.bank_name}
                                    {bankcard?.bank_no ? `(${bankcard.bank_no})` : null}
                                </div>
                                <div className={styles.limitDesc}>{bankcard?.limit_desc}</div>
                            </div>
                        </div>
                        <div
                            className="defaultFlex"
                            onClick={() => needCharge && jump({path: 'MfbIn', params: {fr: 'trade_buy'}})}
                            style={{color: needCharge ? '#0051CC' : '#9AA0B1'}}
                        >
                            {needCharge ? '充值' : '切换'}
                            <RightOutline color="inherit" fontSize={'.24rem'} />
                        </div>
                    </div>
                </div>
                {auto_charge && autoChargeStatus && bankcard.pay_method === 'wallet' ? (
                    <div
                        className={styles.autoChargeHint}
                        dangerouslySetInnerHTML={{__html: auto_charge.conflict_tip}}
                    />
                ) : null}
                {showRadio ? (
                    <div className={`defaultFlex hairline hairline--top ${styles.payMethod}`}>
                        <div onClick={() => setIsLargeAmount(true)} style={{marginRight: '.2rem'}}>
                            <Checkbox
                                indeterminate={isLargeAmount}
                                style={{'--icon-size': '.4rem', '--adm-color-primary': '#0051CC'}}
                            />
                        </div>
                        <div className="flexBetween" style={{flex: 1}}>
                            <div className="defaultFlex">
                                <img className={styles.bankIcon} src={large_pay_method?.bank_icon} alt="" />
                                <div>
                                    <div className={styles.bankName}>{large_pay_method?.bank_name}</div>
                                    <div className={styles.limitDesc}>{large_pay_method?.limit_desc}</div>
                                </div>
                            </div>
                            {button ? (
                                <Button className={styles.useBtn} fill="outline" onClick={() => jump(button.url)}>
                                    {button.text}
                                    <RightOutline color="#EB7121" fontSize={'.24rem'} />
                                </Button>
                            ) : null}
                        </div>
                    </div>
                ) : null}
                {large_pay_show_type === 2 && large_pay_tip ? (
                    <div className={styles.largePayTip}>
                        <img className={styles.fire} src={fire} alt="" />
                        {large_pay_tip}
                    </div>
                ) : null}
            </div>
        )
    }

    /** @name 买入明细 */
    const renderBuyDetail = () => {
        const {
            buy_info: {buy_text, tips},
        } = data
        const {body, header} = planData

        const showTips = (e) => {
            e.stopPropagation()
            Dialog.alert({
                closeOnMaskClick: true,
                confirmText: '知道了',
                content:
                    tips ||
                    '根据您输入的购买金额不同，系统会实时计算匹配最优的基金配置方案，金额的变动可能会导致配置的基金和比例跟随变动。',
                title: buy_text || '买入明细',
            })
        }

        return body && header ? (
            <Collapse className={styles.assetsDetail} defaultActiveKey={['1']}>
                <Panel
                    key="1"
                    title={
                        <div className="defaultFlex">
                            买入明细
                            <QuestionCircleOutline
                                color="#9AA0B1"
                                fontSize={'.32rem'}
                                onClick={showTips}
                                style={{marginLeft: '.2rem'}}
                            />
                        </div>
                    }
                >
                    <div style={{padding: '.32rem'}}>
                        {body?.map?.((item, index) => {
                            const {color, funds, title} = item
                            const {title1, title2} = header
                            return (
                                <div key={title + index} style={{marginTop: index === 0 ? 0 : '.28rem'}}>
                                    <div className="defaultFlex">
                                        <div className="defaultFlex" style={{width: '4rem'}}>
                                            <div className={styles.circle} style={{backgroundColor: color}} />
                                            <div className={styles.assetsTitle}>{title}</div>
                                        </div>
                                        {index === 0 && (
                                            <>
                                                <div className={styles.assetsTitle} style={{width: '1.2rem'}}>
                                                    {title1}
                                                </div>
                                                <div
                                                    className={styles.assetsTitle}
                                                    style={{flex: 1, textAlign: 'right'}}
                                                >
                                                    {title2}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {funds?.map?.((fund, i) => {
                                        const {compare1, compare2, field1, field2, name} = fund
                                        const colorMap = {
                                            gt: '#E74949',
                                            lt: '#4BA471',
                                        }
                                        const nameMap = {
                                            gt: 'arrowup',
                                            lt: 'arrowdown',
                                        }
                                        return (
                                            <div className="defaultFlex" key={name + i} style={{marginTop: '.28rem'}}>
                                                <div className={styles.fundText} style={{width: '4rem'}}>
                                                    {name}
                                                </div>
                                                <div
                                                    className={styles.fundText}
                                                    style={{width: '1.2rem', textAlign: 'center'}}
                                                >
                                                    <span
                                                        dangerouslySetInnerHTML={{__html: field1}}
                                                        style={{fontFamily: 'DINAlternate-Bold'}}
                                                    />
                                                    {compare1 !== 'et' ? (
                                                        <AntDesign
                                                            color={colorMap[compare1]}
                                                            name={nameMap[compare1]}
                                                        />
                                                    ) : null}
                                                </div>
                                                <div className={styles.fundText} style={{flex: 1, textAlign: 'right'}}>
                                                    <span
                                                        dangerouslySetInnerHTML={{__html: field2}}
                                                        style={{fontFamily: 'DINAlternate-Bold'}}
                                                    />
                                                    {compare2 !== 'et' ? (
                                                        <AntDesign
                                                            color={colorMap[compare2]}
                                                            name={nameMap[compare2]}
                                                        />
                                                    ) : null}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                </Panel>
            </Collapse>
        ) : null
    }

    useEffect(() => {
        http.post('/advisor/action/report/20220422', {
            action: 'select',
            poids: [params.poid],
        })
        init()
    }, [])

    useEffect(() => {
        if (Object.keys(data).length > 0) {
            if (!amount && type === 0) plan()
            else onInput()
        }
    }, [amount, bankcard, data, isLargeAmount, isYM, type])

    const {add_payment_disable, agreement, agreement_bottom, auto_charge, button, footer, risk_disclosure, tips} = data
    const {content, sub_title, title} = risk_disclosure || {}

    return Object.keys(data).length > 0 ? (
        <div className={styles.container}>
            <BankCardModal
                data={bankList}
                onDone={(select) => {
                    setBankcard((prev) => {
                        if (prev.pay_method !== select.pay_method && select.pop_risk_disclosure)
                            showRiskDisclosure(risk_disclosure)
                        return select
                    })
                }}
                _ref={bankcardModal}
                select={bankList.findIndex((card) => card.pay_method === bankcard.pay_method)}
                type={add_payment_disable ? 'hidden' : ''}
            />
            <BottomModal ref={bottomModal} title="低估值定投计算方式">
                <img className={styles.fixIcon} src={fixIcon} alt="" />
            </BottomModal>
            <PasswordModal onDone={submit} _ref={passwordModal} />
            <Dialog
                actions={[
                    {
                        key: 'close',
                        onClick: () => {
                            countdown === 0 && setVisible(false)
                            http.post('/advisor/action/report/20220422', {
                                action: 'read',
                                poids: [params.poid],
                            })
                        },
                        text:
                            countdown > 0 ? (
                                <div style={{color: '#121d3a'}}>
                                    <span style={{color: '#0051CC'}}>{countdown}s</span>后关闭
                                </div>
                            ) : (
                                <div style={{color: '#0051CC'}}>关闭</div>
                            ),
                    },
                ]}
                className={styles.riskDisclosure}
                content={
                    <div>
                        <div className={styles.title}>{title}</div>
                        {sub_title ? <div className={styles.subTitle}>{sub_title}</div> : null}
                        <div className={styles.content} dangerouslySetInnerHTML={{__html: content}} ref={contentNode} />
                    </div>
                }
                visible={visible}
            />
            <div className={styles.content}>
                <div className={styles.productTitle}>{data.sub_title}</div>
                {renderBuy()}
                {renderAutoInvestDate()}
                {renderAutoCharge()}
                {renderMethod()}
                {auto_charge?.deduction ? (
                    <div className={styles.autoChargeDeduction}>{auto_charge.deduction}</div>
                ) : null}
                {renderBuyDetail()}
                {tips ? (
                    <div style={{padding: '.32rem'}}>
                        {tips.map?.((tip, i) => {
                            return (
                                <div className={styles.tips} key={tip + i}>
                                    {tip}
                                </div>
                            )
                        })}
                    </div>
                ) : null}
                <BottomDesc />
                {footer?.text ? <div className={styles.footerText}>{footer.text}</div> : null}
            </div>
            {button?.text ? (
                <FixedButton
                    agreement={agreement_bottom}
                    disabled={
                        button.avail === 0 ||
                        btnDisabled ||
                        (autoChargeStatus && bankcard?.pay_method === 'wallet' && type === 1)
                    }
                    onClick={buyClick}
                    otherAgreements={agreement}
                    otherParams={{fund_codes: planData?.codes, type}}
                    title={button.text}
                />
            ) : null}
        </div>
    ) : (
        <div className="flexColumn" style={{height: '100vh'}}>
            <SpinLoading color="#0051CC" />
        </div>
    )
}

export default TradeBuy
