/*
 * @Date: 2022-12-20 16:01:59
 * @Description: 基金组合协议和产品概要
 */
import React, {useEffect, useState} from 'react'
import {useLocation} from 'react-router'
import FontAwesome from 'react-native-vector-icons/dist/FontAwesome'
import Empty from '~/components/Empty'
import http from '~/service'
import {jump} from '~/utils'
import styles from './index.module.scss'
import qs from 'qs'

const TradeAgreements = () => {
    const location = useLocation()
    const params = location.search ? qs.parse(location.search.slice(1)) : {}
    const [data, setData] = useState({})
    const {agreements, funds} = data

    useEffect(() => {
        const {fr = '', fund_codes = '', poid = '', type = ''} = params
        const url =
            fr === 'adviser_transfer' || fund_codes
                ? '/fund/product_overview/20210101'
                : '/passport/trade/agreements/20210101'
        const apiParams = fr === 'adviser_transfer' || fund_codes ? {fund_codes, poid} : {poid, type}
        http.get(url, apiParams).then((res) => {
            if (res.code === '000000') {
                const {title = '基金组合协议'} = res.result
                document.title = title
                setData(res.result)
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className={styles.tradeAgreements}>
            {(agreements || funds)?.length > 0 ? (
                <div className={styles.partBox}>
                    {(agreements || funds).map?.((item, index) => {
                        const {name, url} = item
                        return (
                            <div
                                className={`flexBetween hairline${index === 0 ? '' : ' hairline--top'} ${styles.item}`}
                                onClick={() => jump(url)}
                            >
                                {name}
                                <FontAwesome color="#9AA0B1" name="angle-right" size=".4rem" />
                            </div>
                        )
                    })}
                </div>
            ) : (
                <Empty />
            )}
        </div>
    )
}

export default TradeAgreements
