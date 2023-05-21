/*
 * @Date: 2021-02-23 16:31:24
 * @Description: 添加新银行卡/更换绑定银行卡
 */
import React, {useCallback, useEffect, useRef, useState} from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'
import {isIphoneX} from '../../utils/appUtil.js'
import {Colors, Font, Space, Style} from '../../common/commonStyle'
import http from '../../service/index.js'
import {formCheck} from '../../utils/validator'
import InputView from '../../components/Input'
import Agreements from '../../components/Agreements'
import FixedButton from '../../components/Button/FixedButton'
import {BankCardModal} from '../../components/Modal'
import {useSelector} from 'react-redux'
import Notice from '../../components/Notice'
// import CheckBox from '../../components/CheckBox';
import _ from 'lodash'
import {PasswordModal} from '../../components/Modal'
import {jump, px} from '../../utils'
import {Toast, Checkbox, Popup, Modal} from 'antd-mobile'
import QueryString from 'qs'
import {useHistory} from 'react-router-dom'
import {sendPoint} from '../Insurance/utils/sendPoint'

const params = QueryString.parse(window.location.href.split('?')[1]) || {}
const AddBankCard = () => {
    const history = useHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const userInfo = useSelector((store) => store.userinfo)
    const [, setSecond] = useState(0)
    const [codeText, setCodeText] = useState('发送验证码')
    const btnClick = useRef(true)
    const timerRef = useRef('')
    const [bankList, setBankList] = useState([])
    const [cardNum, setCardNum] = useState('')
    const [bankName, setBankName] = useState('')
    const bankCode = useRef('')
    const [phone, setPhone] = useState('')
    const [code, setCode] = useState('')
    const [signData, setSignData] = useState(null)
    const subBtnClick = useRef(true)
    const bankModal = useRef(null)
    const [check, setCheck] = useState(true)
    const getBank = useRef(true)
    const msgSeq = useRef('')
    const orderNo = useRef('')
    const [aggrement, setAggrement] = useState({})
    const signModal = useRef(null)
    const [signTimer, setSignTimer] = useState(8)
    const [signSelectData, setSignSelectData] = useState([])
    const intervalt_timer = useRef('')
    const passwordRef = useRef(null)
    const onInputCardNum = useCallback((value) => {
        if (value && value.length >= 12) {
            if (getBank.current) {
                getBank.current = false
                http.get('/passport/match/bank_card_info/20210101', {
                    bank_no: value.replace(/ /g, ''),
                    bc_code: params?.bank_code || '',
                    fr: 'AddBankCard',
                }).then((res) => {
                    if (res.code === '000000') {
                        setBankName(res.result.bank_name)
                        bankCode.current = res.result.bank_code
                        setAggrement(res.result?.agreements)
                    }
                })
            }
        } else {
            getBank.current = true
        }
        setCardNum(
            value
                .replace(/\s/g, '')
                .replace(/\D/g, '')
                .replace(/(\d{4})(?=\d)/g, '$1 '),
        )
    }, [])
    const getCode = useCallback(() => {
        global.LogTool('click', 'getCode')
        sendPoint({
            pageid: 'getCode',
            ts: Date.now(),
            chn: 'evolution-h5', // 渠道
            event: 'click',
        })
        if (!btnClick.current) {
            return false
        }
        const checkData = [
            {
                field: cardNum,
                text: '银行卡号不能为空',
            },
            {
                field: bankCode.current,
                text: '请选择银行',
            },
            {
                field: phone,
                text: '银行预留手机号不能为空',
            },
        ]
        if (!formCheck(checkData)) {
            return false
        } else if (!/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(phone)) {
            Toast.show({content: '手机号不合法'})
            return false
        } else if (cardNum.replace(/ /g, '').length < 16) {
            Toast.show({content: '银行卡号不能少于16位'})
            return false
        } else {
            btnClick.current = false
            http.post('/passport/bank_card/bind_prepare/20210101', {
                bank_code: bankCode.current,
                bc_code: params?.bank_code || '',
                bank_no: cardNum,
                mobile: phone,
            }).then((res) => {
                if (res.code === '000000') {
                    msgSeq.current = res.result?.msg_seq || ''
                    orderNo.current = res.result?.order_no || ''
                    Toast.show({content: res.message})
                    timer()
                } else {
                    Toast.show({content: res.message})
                    btnClick.current = true
                }
            })
        }
    }, [bankCode, cardNum, phone, params, timer])
    const onSelectBank = async (value) => {
        if (value.alert_msg) {
            const result = await Modal.confirm({
                content: value.alert_msg,
            })
            if (result) {
                bankCode.current = value.bank_code
                setBankName(value.bank_name)
                setAggrement(value?.agreements)
            } else {
                bankModal.current.show()
            }
        } else {
            bankCode.current = value.bank_code
            setBankName(value.bank_name)
            setAggrement(value?.agreements)
        }
    }
    const timer = useCallback(() => {
        setSecond(60)
        setCodeText('60秒后可重发')
        btnClick.current = false
        timerRef.current = setInterval(() => {
            setSecond((prev) => {
                if (prev === 1) {
                    clearInterval(timerRef.current)
                    setCodeText('重新获取')
                    btnClick.current = true
                    return prev
                } else {
                    setCodeText(prev - 1 + '秒后可重发')
                    return prev - 1
                }
            })
        }, 1000)
    }, [])
    // 完成添加银行卡
    const submit = useCallback(() => {
        sendPoint({
            pageid: 'submit',
            ts: Date.now(),
            chn: 'evolution-h5', // 渠道
            event: 'click',
        })
        if (!subBtnClick.current) {
            return false
        }
        const checkData = [
            {
                field: cardNum,
                text: '银行卡号不能为空',
            },
            {
                field: bankName,
                text: '请选择银行',
            },
            {
                field: phone,
                text: '银行预留手机号不能为空',
            },
            {
                field: code,
                text: '验证码不能为空',
            },
            {
                field: check,
                text: '必须同意服务协议才能完成开户',
                append: '!',
            },
        ]
        if (!formCheck(checkData)) {
            return false
        } else if (!/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(phone)) {
            Toast.show({content: '手机号不合法'})
            return false
        } else if (cardNum.replace(/ /g, '').length < 16) {
            Toast.show({content: '银行卡号不能少于16位'})
            return false
        } else {
            subBtnClick.current = false
            http.post(
                '/passport/bank_card/bind/20210101',
                {
                    bank_code: bankCode.current,
                    bc_code: params?.bank_code || '',
                    bank_no: cardNum.replace(/ /g, ''),
                    mobile: phone,
                    code,
                    bank_name: bankName,
                    msg_seq: msgSeq.current,
                    order_no: orderNo.current,
                },
                '正在提交数据...',
            ).then((res) => {
                if (res.code === '000000') {
                    Toast.show(res.message, {
                        onHidden: () => {
                            subBtnClick.current = true
                        },
                    })
                    if (!signData) {
                        history.goBack()
                    } else {
                        //签约
                        setTimeout(() => {
                            intervalt_timer.current = setInterval(() => {
                                setSignTimer((time) => {
                                    if (time > 0) {
                                        return --time
                                    } else {
                                        intervalt_timer.current && clearInterval(intervalt_timer.current)
                                        return time
                                    }
                                })
                            }, 1000)
                            signModal.current?.show()
                        }, 100)
                    }
                } else {
                    Toast.show(res.message, {
                        onHidden: () => {
                            subBtnClick.current = true
                        },
                    })
                }
            })
        }
    }, [bankName, cardNum, check, code, phone, params, signData])
    //checkBox 选中
    const checkBoxClick = (_check, poid) => {
        //选中
        if (_check) {
            if (poid) {
                setSignSelectData((prev) => {
                    return [...prev, poid]
                })
            } else {
                setSignSelectData((prev) => {
                    let poids = signData?.plan_list?.map((item) => {
                        return item.poid
                    })
                    return [...new Set([...prev, ...poids])]
                })
            }
        } else {
            //非选中
            if (poid) {
                setSignSelectData((prev) => {
                    let data = [...prev]
                    _.remove(data, function (_poid) {
                        return _poid === poid
                    })
                    return data
                })
            } else {
                setSignSelectData([])
            }
        }
    }
    /** @name 点击确认签约，完成输入交易密码 */
    const onSubmit = (password) => {
        Toast.show({icon: 'loading', content: '签约中...'})
        http.post('/adviser/sign/20210923', {password, poids: signSelectData}).then((res) => {
            Toast.clear()
            Toast.show({content: res.message})
            if (res.code === '000000') {
                setTimeout(() => {
                    signModal.current.hide()
                    history.goBack()
                }, 1000)
            }
        })
    }
    useEffect(() => {
        http.get('/passport/bank_list/20210101', {
            channel: userInfo?.po_ver === 0 ? 'ym' : 'xy',
            bc_code: params?.bank_code || '',
            fr: 'AddBankCard',
        }).then((res) => {
            if (res.code === '000000') {
                setBankList(res.result)
                setAggrement(res?.result[0]?.agreements)
            }
        })
    }, [userInfo])
    useEffect(() => {
        if (params?.action === 'add') {
            document.title = '添加新银行卡'
        } else {
            document.title = '更换绑定银行卡'
        }
        http.get('/adviser/bind/bank/signs/20211206').then((sign) => {
            if (sign.code == '000000') {
                setSignTimer(sign?.result?.countdown)
                setSignData(sign.result)
            }
        })
        return () => {
            clearInterval(timerRef.current)
        }
    }, [])
    return (
        <>
            <div style={styles.container}>
                <BankCardModal
                    data={bankList}
                    onDone={onSelectBank}
                    _ref={bankModal}
                    select={bankList?.findIndex((item) => item.bank_name === bankName)}
                    style={{height: px(500)}}
                    title={'请选择银行'}
                    type={'hidden'}
                />
                <InputView
                    clearButtonMode={'while-editing'}
                    keyboardType={'number-pad'}
                    maxLength={23}
                    onChange={onInputCardNum}
                    placeholder={'请输入您的银行卡号'}
                    style={styles.input}
                    title={'银行卡号'}
                    value={cardNum}
                />
                <InputView
                    clearButtonMode={'while-editing'}
                    editable={false}
                    onClick={() => {
                        sendPoint({
                            pageid: 'chooseBank',
                            ts: Date.now(),
                            chn: 'evolution-h5', // 渠道
                            event: 'click',
                        })
                        bankModal.current.show()
                    }}
                    placeholder={'请选择银行'}
                    style={styles.input}
                    textContentType={'newPassword'}
                    title={'银行名称'}
                    value={bankName}
                >
                    <Icon name={'angle-right'} size={20} color={Colors.lightGrayColor} />
                </InputView>
                <InputView
                    clearButtonMode={'while-editing'}
                    keyboardType={'phone-pad'}
                    maxLength={11}
                    onChange={(value) => setPhone(value.replace(/\D/g, ''))}
                    placeholder={'请输入您的银行预留手机号'}
                    style={styles.input}
                    title={'手机号'}
                    value={phone}
                />
                <InputView
                    clearButtonMode={'while-editing'}
                    keyboardType={'number-pad'}
                    maxLength={6}
                    onChange={(value) => setCode(value.replace(/\D/g, ''))}
                    placeholder={'请输入验证码'}
                    style={styles.input}
                    textContentType={'telephoneNumber'}
                    title={'验证码'}
                    value={code}
                >
                    <span style={styles.inputRightText} onClick={getCode}>
                        {codeText}
                    </span>
                </InputView>
                {params?.action === 'add' && (
                    <div style={{paddingTop: Space.padding, paddingLeft: px(16), paddingRight: px(16)}}>
                        <Agreements onChange={(checked) => setCheck(checked)} data={aggrement?.list} />
                    </div>
                )}
                <FixedButton
                    onClick={submit}
                    style={styles.btn}
                    title={params?.action === 'add' ? '添加新银行卡' : '更换新银行卡'}
                />
            </div>
            {signData && (
                <Popup
                    ref={signModal}
                    mask={true}
                    visible={signData ? true : false}
                    showCloseButton
                    height={px(600)}
                    title={signData?.title}
                    onClose={() => {
                        intervalt_timer.current && clearInterval(intervalt_timer.current)
                        history.goBack()
                    }}
                >
                    <div style={{flex: 1, paddingBottom: px(20)}}>
                        {signData?.title_tip && <Notice content={{content: signData?.title_tip}} />}
                        <div
                            style={{
                                flex: 1,
                            }}
                        >
                            <div
                                style={{
                                    flex: 1,
                                    paddingHorizontal: px(16),
                                    paddingTop: px(20),
                                    borderRadius: px(6),
                                }}
                            >
                                {signData?.risk_disclosure_list?.length > 0 &&
                                signData?.risk_disclosure_list[0]?.title ? (
                                    <span style={{fontSize: px(18), fontWeight: '700', marginBottom: px(12)}}>
                                        {signData?.risk_disclosure_list[0]?.title}
                                    </span>
                                ) : null}
                                <div style={styles.sign_scrollview}>
                                    <div
                                        nestedScrollEnabled={true}
                                        style={{
                                            flex: 1,
                                            paddingRight: px(12),
                                        }}
                                    >
                                        {signData?.risk_disclosure_list
                                            ? signData?.risk_disclosure_list?.map((item, index) => {
                                                  return (
                                                      <span
                                                          dangerouslySetInnerHTML={item?.content}
                                                          key={index}
                                                          style={{fontSize: px(13), lineHeight: px(20)}}
                                                      />
                                                  )
                                              })
                                            : null}
                                    </div>
                                </div>
                                <div style={[Style.flexBetween, {marginTop: px(12)}, styles.border_bottom]}>
                                    <div style={Style.flexRow}>
                                        <Checkbox
                                            checked={signSelectData?.length == signData?.plan_list?.length}
                                            style={{marginRight: px(6)}}
                                            onChange={(value) => {
                                                checkBoxClick(value)
                                            }}
                                        />
                                        <span style={{fontSize: px(16), fontWeight: '700'}}>全选</span>
                                    </div>
                                    <span style={{fontSize: px(16)}}>
                                        {signSelectData?.length}/{signData?.plan_list?.length}
                                    </span>
                                </div>
                                <div style={{marginBottom: px(40)}}>
                                    {signData?.plan_list?.map((item, index) => {
                                        return (
                                            <div key={index} style={styles.border_bottom}>
                                                <span
                                                    style={{
                                                        fontSize: px(16),
                                                        fontWeight: '700',
                                                        marginBottom: px(6),
                                                    }}
                                                >
                                                    {item?.name}
                                                </span>
                                                {item?.adviser_cost_desc ? (
                                                    <span style={[styles.light_text, {marginBottom: px(6)}]}>
                                                        {item.adviser_cost_desc}
                                                    </span>
                                                ) : null}
                                                <div style={[Style.flexRow, {alignItems: 'flex-start'}]}>
                                                    <Checkbox
                                                        checked={signSelectData?.includes(item?.poid)}
                                                        style={{marginRight: px(6)}}
                                                        onChange={(value) => {
                                                            checkBoxClick(value, item.poid)
                                                        }}
                                                    />
                                                    <span style={[styles.light_text, {flex: 1}]}>
                                                        {item?.desc}

                                                        <span>
                                                            {item?.link_list?.map((link, _index) => (
                                                                <span
                                                                    style={{color: Colors.btnColor}}
                                                                    key={_index}
                                                                    onClick={() => {
                                                                        if (link?.url) {
                                                                            jump(link?.url)
                                                                        }
                                                                    }}
                                                                >
                                                                    {link?.text}
                                                                    {item?.link_list?.length > 1 &&
                                                                    _index == item?.link_list?.length - 2
                                                                        ? '和'
                                                                        : _index == item?.link_list?.length - 1
                                                                        ? ''
                                                                        : '、'}
                                                                </span>
                                                            ))}
                                                            {item?.desc_end ? (
                                                                <span style={styles.light_text}>{item?.desc_end}</span>
                                                            ) : null}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                        {signData?.button ? (
                            <FixedButton
                                disabled={signTimer > 0 || !signSelectData?.length > 0}
                                style={{marginTop: px(12), marginHorizontal: px(16)}}
                                onClick={() => {
                                    passwordRef.current?.show?.()
                                }}
                                title={
                                    signTimer > 0 ? signTimer + 's' + signData?.button?.text : signData?.button?.text
                                }
                            />
                        ) : null}
                    </div>
                </Popup>
            )}
            <PasswordModal onDone={onSubmit} _ref={passwordRef} />
        </>
    )
}

const styles = {
    container: {
        flex: 1,
        overflowY: 'scroll',
        backgroundColor: Colors.bgColor,
        paddingBottom: isIphoneX() ? px(85) : px(51),
    },
    input: {
        marginTop: px(12),
        paddingHorizontal: Space.padding,
    },
    inputRightText: {
        fontSize: Font.textH2,
        lineHeight: px(20),
        color: Colors.brandColor,
    },
    btn: {
        marginTop: px(28),
        marginHorizontal: px(20),
    },
    light_text: {fontSize: px(13), lineHeight: px(17), color: Colors.lightBlackColor},
    border_bottom: {
        borderColor: Colors.lineColor,
        borderBottomWidth: 0.5,
        paddingVertical: px(12),
    },
    sign_scrollview: {
        height: px(168),
        backgroundColor: '#F5F6F8',
        borderRadius: px(6),
        padding: px(12),
        paddingRight: 0,
    },
}

export default AddBankCard
