/*
 * @Date: 2022-12-20 16:01:59
 * @Description: 权益须知
 */
import React, {useEffect, useState} from 'react'
import {useLocation} from 'react-router'
import FontAwesome from 'react-native-vector-icons/dist/FontAwesome'
import Empty from '~/components/Empty'
import http from '~/service'
import {jump} from '~/utils'
import styles from './index.module.scss'
import qs from 'qs'

const TradeAgreementList = () => {
    const location = useLocation()
    const params = location.search ? qs.parse(location.search.slice(1)) : {}
    const [data, setData] = useState({})
    const {agreements, funds} = data

    useEffect(() => {
        const url = '/trade/agreement/list/20220620'
        const apiParams = params
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
                (agreements || funds).map?.((item, index) => {
                    return (
                        <div className={styles.partBox} key={index}>
                            {item?.map?.((agree, i) => {
                                const {name, title, url} = agree
                                return (
                                    <div
                                        className={`flexBetween hairline${i === 0 ? '' : ' hairline--top'} ${
                                            styles.item
                                        }`}
                                        key={(name || title) + i}
                                        onClick={() => jump(url)}
                                    >
                                        {name || title}
                                        <FontAwesome color="#9AA0B1" name="angle-right" size=".4rem" />
                                    </div>
                                )
                            })}
                        </div>
                    )
                })
            ) : (
                <Empty />
            )}
        </div>
    )
}

export default TradeAgreementList
