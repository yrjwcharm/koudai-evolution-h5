/*
 * @Date: 2022-07-21 14:30:52
 * @Description: 魔方宝持有信息
 */
import {DotLoading} from 'antd-mobile'
import {RightOutline} from 'antd-mobile-icons'
import React, {useEffect, useState} from 'react'
import {Colors} from '~/common/commonStyle'
import Empty from '~/components/Empty'
import NumText from '~/components/NumText'
import http from '~/service'
import {jump} from '~/utils'
import styles from './index.module.scss'

const MfbHoldingInfo = () => {
    const [data, setData] = useState({})
    const {items} = data
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        http.get('/wallet/v7/funds/20220708', {})
            .then((res) => {
                if (res.code === '000000') {
                    const {title} = res.result
                    document.title = title || '魔方宝持有信息'
                    setData(res.result)
                }
            })
            .finally(() => {
                setLoading(false)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className={styles.container}>
            {loading ? (
                <div className={styles.beforeMask}>
                    <DotLoading />
                </div>
            ) : items?.length > 0 ? (
                items.map((item, index, arr) => {
                    const {amount, code, name, profit, profit_acc, return_daily, return_week, url} = item
                    return (
                        <div key={name + index} onClick={() => jump(url)} className={styles.card}>
                            <div className={styles.flexBetween}>
                                <div className={styles.flexRow}>
                                    <div className={styles.name}>{name}</div>
                                    <div className={styles.code}>{code}</div>
                                </div>
                                <RightOutline color={Colors.lightGrayColor} size={16} />
                            </div>
                            <div style={{display: 'flex', flexWrap: 'wrap'}}>
                                <div className={styles.itemSty}>
                                    <div className={styles.key}>{'持有金额(元)'}</div>
                                    <div className={styles.val}>{amount}</div>
                                </div>
                                <div className={styles.itemSty} style={{alignItems: 'center'}}>
                                    <div className={styles.key}>{'日收益'}</div>
                                    <NumText style={styles.val} text={profit} />
                                </div>
                                <div className={styles.itemSty} style={{alignItems: 'flex-end'}}>
                                    <div className={styles.key}>{'累计收益'}</div>
                                    <NumText style={styles.val} text={profit_acc} />
                                </div>
                                <div className={styles.itemSty}>
                                    <div className={styles.key}>{'七日年化'}</div>
                                    <div className={styles.val}>{return_week}</div>
                                </div>
                                <div className={styles.itemSty} style={{alignItems: 'center'}}>
                                    <div className={styles.key}>{'万份收益'}</div>
                                    <div className={styles.val}>{return_daily}</div>
                                </div>
                            </div>
                        </div>
                    )
                })
            ) : (
                <Empty text={'暂无数据'} />
            )}
        </div>
    )
}

export default MfbHoldingInfo
