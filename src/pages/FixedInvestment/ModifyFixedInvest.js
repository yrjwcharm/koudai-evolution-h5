import decrease from './assets/jian.png'
import add from './assets/jia.png'
import BottomDesc from '../../components/BottomDesc'
import Http from '../../service'
import icon from '../../image/icon/close.png'
import {isIphoneX, formaNum, onlyNumber} from '../../utils/appUtil'
import {jump, px} from '../../utils'
import {BankCardModal, PasswordModal} from '../../components/Modal'
import {useCallback, useEffect, useRef, useState} from 'react'
import {Toast, Popup, CascadePicker, Input} from 'antd-mobile'
import {useSelector} from 'react-redux'
import QueryString from 'qs'
import {Colors, Font, Style} from '../../common/commonStyle'
import FontAwesome from 'react-native-vector-icons/dist/FontAwesome'
import Loading from '../../components/Loading'
import {DownOutline, UpOutline} from 'antd-mobile-icons'
import FixedButton from '../../components/Button/FixedButton'
import Styles from './index.module.scss'
import {sendPoint} from '../Insurance/utils/sendPoint'
const ModifyFixedInvest = ({navigation, route}) => {
    const params = QueryString.parse(window.location.href.split('?')[1]) || {}
    const {plan_id = ''} = params
    const [data, setData] = useState({})
    const [state, setState] = useState({
        fund_name: '',
        fund_code: '',
    })
    const [loading, setLoading] = useState(true)
    const [visible, setVisible] = useState(false)
    const [num, setNum] = useState()
    const [cycle, setCycle] = useState('')
    const [options, setOptions] = useState([])
    const [autoChargeStatus, updateAutoChargeStatus] = useState(false)
    const passwordModal = useRef(null)
    const [type, setType] = useState()
    const intervalRef = useRef('')
    const cycleRef = useRef('')
    const timingRef = useRef('')
    const [showMask, setShowMask] = useState(false)
    const [cycleVisible, setCycleVisible] = useState(false)
    const [modalProps, setModalProps] = useState({})
    const [iptVal, setIptVal] = useState('')
    const inputModal = useRef(null)
    const inputRef = useRef(null)
    const iptValRef = useRef('')
    const [payMethod, setPayMethod] = useState({})
    const bankCardModal = useRef(null)
    const initAmount = useRef('')
    const userInfo = useSelector((state) => state.userInfo)
    // const isFocused = useIsFocused();
    const show_risk_disclosure = useRef(true)
    const riskDisclosureModalRef = useRef(null)
    const addNum = () => {
        setNum((prev) => {
            if (prev + intervalRef.current > payMethod.day_limit) {
                Toast.show({content: `${cycleRef.current}投入金额最大为${formaNum(payMethod.day_limit, 'nozero')}`})
            }
            return prev + intervalRef.current > payMethod.day_limit ? payMethod.day_limit : prev + intervalRef.current
        })
    }
    const subtractNum = () => {
        setNum((prev) => {
            if (prev - intervalRef.current < initAmount.current) {
                Toast.show({content: `${cycleRef.current}投入金额最小为${formaNum(initAmount.current, 'nozero')}`})
            }
            return prev - intervalRef.current < initAmount.current ? initAmount.current : prev - intervalRef.current
        })
    }
    /**
     * @description 展示风险揭示书
     * @param {any} risk_disclosure 风险揭示书内容
     * @returns void
     */
    const showRiskDisclosure = (risk_disclosure) => {
        show_risk_disclosure.current = false
        // Modal.show({
        //     children: () => {
        //         return (
        //             <View>
        //                 <Text
        //                     style={{
        //                         marginTop: text(2),
        //                         fontSize: Font.textH2,
        //                         lineHeight: text(20),
        //                         color: Colors.red,
        //                         textAlign: 'center',
        //                     }}>
        //                     {risk_disclosure.sub_title}
        //                 </Text>
        //                 <ScrollView
        //                     bounces={false}
        //                     style={{
        //                         marginVertical: Space.marginVertical,
        //                         paddingHorizontal: text(20),
        //                         maxHeight: text(352),
        //                     }}
        //                     ref={(e) => (riskDisclosureModalRef.current = e)}>
        //                     <Html
        //                         style={{fontSize: text(13), lineHeight: text(22), color: Colors.descColor}}
        //                         html={risk_disclosure.content}
        //                     />
        //                 </ScrollView>
        //             </View>
        //         );
        //     },
        //     confirmText: '关闭',
        //     countdown: risk_disclosure.countdown,
        //     isTouchMaskToClose: false,
        //     onCloseCallBack: () => navigation.goBack(),
        //     onCountdownChange: (val) => {
        //         if (+val == 1) {
        //             riskDisclosureModalRef.current.scrollToEnd({animated: true});
        //         }
        //     },
        //     title: risk_disclosure.title,
        // });
    }
    const initPlan = useCallback(() => {
        ;(async () => {
            Http.get('/trade/update/invest_plan/info/20210101', {
                invest_id: plan_id,
            })
                .then((res) => {
                    if (res.code === '000000') {
                        // if (isFocused && res.result.risk_disclosure && show_risk_disclosure.current) {
                        //     if (res.result?.pay_methods[0]?.pop_risk_disclosure) {
                        //         showRiskDisclosure(res.result.risk_disclosure);
                        //     }
                        // }
                        if (res.result.risk_disclosure && show_risk_disclosure.current) {
                            if (res.result?.pay_methods[0]?.pop_risk_disclosure) {
                                showRiskDisclosure(res.result.risk_disclosure)
                            }
                        }
                        intervalRef.current = res.result.target_info.invest.incr
                        initAmount.current = res.result.target_info.invest.init_amount
                        setData(res.result)
                        setPayMethod(res.result.pay_methods[0] || {})
                        setNum(parseFloat(res.result.target_info.invest.amount))
                        updateAutoChargeStatus(res.result?.auto_charge?.is_open)
                        const _date = res.result.target_info.fix_period.current_date
                        setCycle(_date)
                        cycleRef.current = _date.split(' ')[0]
                        timingRef.current = _date.split(' ')[1]
                        setLoading(false)
                    }
                })
                .catch(() => {
                    setLoading(false)
                })
        })()
    })
    useEffect(() => {
        document.title = '修改定投'
        initPlan()
    }, [])
    useEffect(() => {
        iptValRef.current = iptVal
    }, [iptVal])
    const confirmClick = () => {
        setVisible(false)
        if (iptValRef.current < initAmount.current) {
            // inputModal.current.hide();
            setNum(initAmount.current)
            Toast.show({content: `${cycleRef.current}投入金额最小为${formaNum(initAmount.current, 'nozero')}`})
        } else if (iptValRef.current > payMethod.day_limit) {
            // /**/ inputModal.current.hide();
            setNum(payMethod.day_limit)
            Toast.show({content: `${cycleRef.current}投入金额最大为${formaNum(payMethod.day_limit, 'nozero')}`})
        } else {
            // inputModal.current.hide();
            setNum(parseFloat(iptValRef.current))
        }
    }
    const submit = (password) => {
        if (type == 'redeem') {
            Http.get('/trade/stop/invest_plan/20210101', {
                invest_id: data.invest_id,
                password,
            }).then((res) => {
                Toast.show(res.message)
                if (res.code == '000000') {
                    setTimeout(() => {
                        jump(data.button[0].url)
                    }, 1000)
                }
            })
        } else {
            Http.get('/trade/update/invest_plan/20210101', {
                invest_id: data?.invest_id,
                amount: num,
                cycle: cycleRef.current,
                wallet_auto_charge: +autoChargeStatus,
                timing: timingRef.current,
                password,
                pay_method: payMethod.pay_method,
            }).then((res) => {
                Toast.show(res.message)
                if (data.auto_charge?.is_open !== autoChargeStatus) {
                    sendPoint({
                        pageid: +autoChargeStatus,
                        ts: Date.now(),
                        chn: 'evolution-h5', // 渠道
                        event: 'click',
                    })
                }
                if (res.code == '000000') {
                    setTimeout(() => {
                        jump(data.button[1].url)
                    }, 1000)
                }
            })
        }
    }
    const handleClick = (t) => {
        setType(t)
        passwordModal?.current?.show()
    }
    const selectTime = () => {
        setCycleVisible(true)
        let cycleList = data?.target_info?.fix_period?.date_items.map((el) => {
            return {
                label: el.key,
                value: el.key,
                children: el.val.map((item) => {
                    return {label: item, value: item}
                }),
            }
        })
        setOptions(cycleList)
    }
    return (
        <>
            {loading ? (
                <Loading color={Colors.btnColor} />
            ) : (
                <div className={Styles.container}>
                    <div className={Styles.list_row}>
                        <div className={Styles.list_row_wrap}>
                            <span>每月定投金额(元)</span>
                            <div className={Styles.right_wrap}>
                                <img src={decrease} className={Styles.decrease} onClick={subtractNum} />
                                <span className={Styles.money} onClick={() => setVisible(true)}>
                                    {formaNum(num)}
                                </span>
                                <img src={add} className={Styles.add} onClick={addNum} />
                            </div>
                        </div>
                    </div>
                    <div className={Styles.list_row}>
                        <div className={Styles.list_row_wrap}>
                            <span>定投周期</span>
                            <div className={Styles.right_wrap} onClick={selectTime}>
                                <span className={Styles.cycle}>{cycle}</span>
                                {cycleVisible ? (
                                    <UpOutline size={12} color={'#9095A5'} />
                                ) : (
                                    <DownOutline size={12} color={'#9095A5'} />
                                )}
                            </div>
                        </div>
                    </div>
                    <div
                        className={Styles.list_row}
                        style={styles.bankCard}
                        onClick={() => bankCardModal?.current.show()}
                    >
                        <div className={Styles.list_row_wrap}>
                            <div className={Styles.left}>
                                <img src={payMethod.bank_icon} style={styles.bankIcon} />
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <span style={styles.bankName}>
                                        {payMethod.bank_name}
                                        {payMethod.bank_no}
                                    </span>
                                    <span style={styles.limitDesc}>{payMethod.limit_desc}</span>
                                </div>
                            </div>
                            <div style={Style.flexRow}>
                                <span style={styles.limitDesc}>切换</span>
                                <FontAwesome
                                    name={'angle-right'}
                                    size={18}
                                    color={Colors.lightGrayColor}
                                    style={{marginLeft: 6}}
                                />
                            </div>
                        </div>
                    </div>
                    <PasswordModal _ref={passwordModal} onDone={submit} />
                    <BankCardModal
                        data={data?.pay_methods || []}
                        onDone={(value) => {
                            setPayMethod(value)
                            if (value?.pop_risk_disclosure) {
                                setTimeout(() => {
                                    showRiskDisclosure(data.risk_disclosure)
                                }, 300)
                            }
                        }}
                        select={data?.pay_methods?.findIndex((item) => item.bank_name === payMethod.bank_name)}
                        _ref={bankCardModal}
                        title={'请选择支付银行卡'}
                    />
                    <Popup
                        visible={visible}
                        onMaskClick={() => {
                            setVisible(false)
                        }}
                        bodyStyle={{
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px',
                            minHeight: '40vh',
                        }}
                    >
                        <div className={Styles.popup_content}>
                            <div className={Styles.popup_header}>
                                <div className={Styles.popup_wrap}>
                                    <img
                                        src={icon}
                                        className={Styles.close}
                                        onClick={() => {
                                            setVisible(false)
                                        }}
                                    />
                                    <span className={Styles.title}>每月投入金额</span>
                                    <span className={Styles.confirm_text} onClick={confirmClick}>
                                        确定
                                    </span>
                                </div>
                            </div>
                            <div className={Styles.input_wrap}>
                                <div className={Styles.input_money}>
                                    <span className={Styles.price}>¥</span>
                                    <Input
                                        className={Styles.input}
                                        onChange={(value) => setIptVal(onlyNumber(value))}
                                        type="number"
                                        onClear={() => setIptVal('')}
                                        placeholder={'请输入每月投入金额'}
                                        clearable
                                    />
                                </div>
                            </div>
                        </div>
                    </Popup>
                    <CascadePicker
                        title="时间选择"
                        options={options}
                        visible={cycleVisible}
                        onClose={() => {
                            setCycleVisible(false)
                        }}
                        onConfirm={(val, extend) => {
                            setCycle(val[0] + ` ` + val[1])
                        }}
                        onSelect={(val) => {}}
                    />
                    <BottomDesc style={{marginBottom: isIphoneX() ? px(104) : px(78)}} />
                    {data?.button?.length > 0 ? (
                        <>
                            {data.button.map?.((btn, i, arr) => {
                                const {avail, text: btnText} = btn
                                return (
                                    <FixedButton
                                        key={i + '' + btn}
                                        title={btnText}
                                        onClick={() => handleClick(i === 0 && arr.length > 1 ? 'redeem' : 'update')}
                                    />
                                )
                            })}
                        </>
                    ) : null}
                </div>
            )}
        </>
    )
}
export default ModifyFixedInvest
const styles = {
    bankIcon: {
        width: px(28),
        marginRight: px(8),
    },
    bankCard: {
        marginTop: px(12),
        paddingLeft: px(16),
        paddingRight: px(16),
        paddingTop: px(12),
        paddingBottom: px(12),
        backgroundColor: '#fff',
    },
    bankName: {
        fontSize: px(14),
        color: Colors.defaultColor,
        marginBottom: px(1),
    },
    limitDesc: {
        fontSize: px(12),
        color: Colors.lightGrayColor,
    },
}
