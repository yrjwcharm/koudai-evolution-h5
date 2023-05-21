/*
 * @Date: 2022-12-14 09:37:54
 * @Description: 银行卡Modal组件
 */
import React, {useEffect, useImperativeHandle, useRef, useState} from 'react'
import {CheckOutline, RightOutline} from 'antd-mobile-icons'
import mfbIcon from '~/image/account/mfbIcon.png'
import {jump} from '~/utils'
import BottomModal from './BottomModal'
import styles from './index.module.scss'

const BankCardModal = (props) => {
    const {
        clickable = true, // 是否禁用点击
        data = [],
        initIndex, // 是否默认选择大额极速购
        onDone,
        select: defaultSelect, // 默认选中的银行卡数组下标
        title = '请选择付款方式',
        type = '', // type为hidden时隐藏添加新银行卡
        _ref,
        ...restProps
    } = props
    const bottomModal = useRef()
    const first = useRef(true)
    const [select, setSelect] = useState(defaultSelect)

    const show = () => {
        setSelect(defaultSelect)
        bottomModal.current.show()
    }

    const hide = () => bottomModal.current?.hide?.()

    const confirmClick = (index) => {
        if (!clickable) return false
        setSelect(index)
        setTimeout(() => {
            hide()
            onDone?.(data[index], index)
        }, 200)
    }

    const renderItem = (item, index) => {
        const {bank_code, bank_icon, bank_name, bank_no, button, desc, large_pay_tip, limit_desc} = item
        return (
            <div key={`${bank_name}${bank_code}${index}`} onClick={() => confirmClick(index)}>
                <div className={`defaultFlex hairline hairline--bottom ${styles.bankCard}`}>
                    <img className={styles.bankIcon} src={bank_icon} alt="" />
                    <div style={{flex: 1}}>
                        <div className="defaultFlex">
                            <div className={styles.bankName}>
                                {bank_name}
                                {bank_no ? `(${bank_no})` : ''}
                            </div>
                            {button?.text ? (
                                <div
                                    className={`defaultFlex ${styles.bankName}`}
                                    onClick={() => {
                                        hide()
                                        jump(button.url)
                                    }}
                                    style={{marginLeft: '.16rem', color: '#0051CC'}}
                                >
                                    {button.text}
                                    <RightOutline color="#0051CC" fontSize={'.24rem'} />
                                </div>
                            ) : null}
                        </div>
                        <div className={styles.bankLimit}>{limit_desc || desc}</div>
                    </div>
                    {select === index ? <CheckOutline color="#0051CC" fontSize={'.24rem'} /> : null}
                </div>
                {large_pay_tip ? <div className={styles.largePayTip}>{large_pay_tip}</div> : null}
            </div>
        )
    }

    useImperativeHandle(_ref, () => ({
        show,
        hide,
    }))

    useEffect(() => {
        setSelect(defaultSelect)
    }, [defaultSelect])

    useEffect(() => {
        if (data.length > 0 && initIndex && first.current) {
            first.current = false
            confirmClick(initIndex)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, initIndex])

    return (
        <BottomModal {...restProps} bodyStyle={{paddingBottom: 0}} ref={bottomModal} title={title}>
            <div className={styles.listBox}>
                {data?.map?.(renderItem)}
                {type === 'hidden' ? null : (
                    <div
                        className={`defaultFlex hairline hairline--bottom ${styles.bankCard}`}
                        onClick={() => {
                            hide()
                            jump({path: 'AddBankCard', params: {action: 'add'}})
                        }}
                    >
                        <img className={styles.bankIcon} src={mfbIcon} alt="" />
                        <div className={styles.bankName} style={{flex: 1}}>
                            添加新银行卡
                        </div>
                        <RightOutline color="#121d3a" fontSize={'.24rem'} />
                    </div>
                )}
            </div>
        </BottomModal>
    )
}

export default BankCardModal
