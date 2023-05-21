/*
 * @Date: 2022-12-20 10:11:49
 * @Description: 交易确认页
 */
import React, {useEffect, useRef, useState} from 'react'
import {useDispatch} from 'react-redux'
import {useHistory, useLocation} from 'react-router'
import {Button, Dialog} from 'antd-mobile'
import Ionicons from 'react-native-vector-icons/dist/Ionicons'
import FontAwesome from 'react-native-vector-icons/dist/FontAwesome'
import Loading from '~/components/Loading'
import {VerifyCodeModal} from '~/components/Modal'
import {getUserInfo} from '~/redux/actions/userinfo'
import http from '~/service'
import {jump} from '~/utils'
import styles from './index.module.scss'
import qs from 'qs'

const TradeProcessing = () => {
    const dispatch = useDispatch()
    const history = useHistory()
    const location = useLocation()
    const params = location.search ? qs.parse(location.search.slice(1)) : {}
    const loopRef = useRef(0)
    const scrollRef = useRef()
    const signFlag = useRef(false)
    const timerRef = useRef()
    const verifyCodeModal = useRef()
    const [data, setData] = useState({})
    const {desc, header, items} = data
    const [bankInfo, setBankInfo] = useState('')
    const [isSign, setSign] = useState(false)
    const [finished, setFinished] = useState(false)

    const init = (sign = false, refused = 0) => {
        http.get('/trade/order/processing/20210101', {
            ...params,
            loop: loopRef.current,
            refused,
        }).then((res) => {
            if (res.code === '000000') {
                setData(res.result)
                const {finish, loop, need_verify_code, title = '交易确认'} = res.result
                document.title = title
                if (need_verify_code && !sign) return signSendVerify(true)
                if (finish || finish === -2 || loopRef.current >= loop) {
                    setFinished(true)
                } else {
                    timerRef.current = setTimeout(() => {
                        loopRef.current++
                        if (loopRef.current <= loop) init(sign, refused)
                    }, 1000)
                }
                setTimeout(() => {
                    scrollRef.current.scrollTo({behavior: 'smooth', top: scrollRef.current.scrollHeight})
                }, 200)
            }
        })
    }

    //获取验证码信息
    const signSendVerify = (first = false) => {
        http.get('/trade/recharge/verify_code_send/20210101', params).then((res) => {
            if (res.code === '000000') {
                first && setBankInfo(res.result)
                verifyCodeModal.current.show()
            } else {
                verifyCodeModal.current.show(false)
            }
            verifyCodeModal.current.showToast(res.message)
        })
    }

    const modalCancelCallBack = () => {
        if (bankInfo) {
            const content = bankInfo?.back_info?.content
            Dialog.alert({
                closeOnMaskClick: true,
                confirmText: '立即签约',
                content: <div dangerouslySetInnerHTML={{__html: content}} />,
                onClose: () => {
                    loopRef.current++
                    init(true, 1)
                },
                onConfirm: () => verifyCodeModal.current.show(true, 0),
            })
        }
    }

    const buttonCallBack = (code) => {
        if (signFlag.current) return false
        signFlag.current = true
        http.post('/trade/recharge/verify_code_confirm/20210101', {
            ...params,
            code,
        }).then((res) => {
            setTimeout(() => {
                signFlag.current = false
            }, 300)
            if (res.code === '000000') {
                setSign(true)
                loopRef.current++
                init(true)
                verifyCodeModal.current.hide()
            } else {
                verifyCodeModal.current.showToast(res.message)
            }
        })
    }

    const finishClick = () => {
        dispatch(getUserInfo())
        if (['trade_buy', 'fund_trade_buy'].includes(params.fr)) {
            history.go(-2)
        } else {
            jump(data.button.url)
        }
    }

    useEffect(() => {
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className={styles.tradeProcessing} ref={scrollRef}>
            {Object.keys(data).length > 0 ? (
                <>
                    {header ? (
                        <div className={styles.headerStyle}>
                            <img className={styles.headerImg} src={header.img} alt="" />
                            <div className={styles.headerStatus} dangerouslySetInnerHTML={{__html: header.status}} />
                            {header.amount ? <div className={styles.headerAmount}>{header.amount}</div> : null}
                            {header.pay_method ? (
                                <div className={styles.headerAmount} style={{marginTop: '.1rem'}}>
                                    {header.pay_method}
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                    {desc ? <div className={styles.title}>{desc}</div> : null}
                    <div className={styles.processingContainer}>
                        {items?.map?.((item, index, arr) => {
                            const {d, done, k, v} = item
                            return (
                                <div
                                    className={styles.processItem}
                                    key={k + v + index}
                                    style={{marginTop: index === 0 ? '.32rem' : '.24rem'}}
                                >
                                    <div className={styles.icon}>
                                        {done === 0 ? (
                                            <FontAwesome color="#CCD0DB" name="circle-thin" size=".32rem" />
                                        ) : (
                                            <Ionicons
                                                color={done === 1 ? '#4BA471' : '#E74949'}
                                                name={done === 1 ? 'checkmark-circle' : 'close-circle'}
                                                size=".32rem"
                                            />
                                        )}
                                    </div>
                                    {index !== arr.length - 1 && <div className={styles.line} />}
                                    <div className={styles.contentBox}>
                                        <div className={styles.caretStyle}>
                                            <FontAwesome color="#fff" name="caret-left" size=".6rem" />
                                        </div>
                                        <div className={styles.content}>
                                            <div className="flexBetween">
                                                <div className={styles.processTitle}>{k}</div>
                                                {v ? <div className={styles.date}>{v}</div> : null}
                                            </div>
                                            {d?.length > 0 && (
                                                <div className={styles.moreInfo}>
                                                    {d.map?.((val, i) => {
                                                        return (
                                                            <div
                                                                dangerouslySetInnerHTML={{__html: val}}
                                                                key={val + i}
                                                            />
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {finished && (
                        <Button block className={styles.finishBtn} onClick={finishClick}>
                            完成
                        </Button>
                    )}
                    <VerifyCodeModal
                        buttonCallBack={buttonCallBack}
                        buttonText="立即签约"
                        desc={bankInfo?.content || ''}
                        getCode={signSendVerify}
                        isSign={isSign}
                        modalCancelCallBack={modalCancelCallBack}
                        _ref={verifyCodeModal}
                        scene="sign"
                        validateLength={6}
                    />
                </>
            ) : (
                <Loading />
            )}
        </div>
    )
}

export default TradeProcessing
