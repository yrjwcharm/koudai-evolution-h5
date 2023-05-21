/*
 * @Date: 2022-07-21 15:19:00
 * @Description: 自动充值
 */
import React, {useEffect, useState} from 'react'
import Empty from '~/components/Empty'
import qs from 'querystring'
import http from '~/service'
import {DotLoading, Tabs} from 'antd-mobile'
import classNames from 'classnames'
import {jump} from '~/utils'
import styles from './index.module.scss'

const AutoCharge = () => {
    const params = qs.parse(window.location.search.split('?')[1] || '')

    const [data, setData] = useState({})
    const [active, setActive] = useState(params?.active || 0)
    const {type_list} = data
    const [loading, setLoading] = useState(true)

    const init = () => {
        http.get('/wallet/v7/auto_charge/20220708')
            .then((res) => {
                if (res.code === '000000') {
                    const {title} = res.result
                    document.title = title || '自动充值'
                    setData(res.result)
                }
            })
            .finally(() => {
                setLoading(false)
            })
    }

    useEffect(() => {
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className={styles.container}>
            {loading ? (
                <div className={styles.beforeMask}>
                    <DotLoading />
                </div>
            ) : (
                <Tabs
                    activeKey={'' + active}
                    defaultActiveKey={0}
                    onChange={(key) => {
                        setActive(key)
                    }}
                >
                    {type_list?.map((type, i) => {
                        const {header, items, text} = type
                        return (
                            <Tabs.Tab key={i} style={{flex: 1}} title={text}>
                                {items?.length > 0 ? (
                                    <div className={styles.card}>
                                        <div className={classNames([styles.flexRow, styles.header])}>
                                            {header?.map((h, idx, arr) => {
                                                return (
                                                    <div
                                                        key={h + idx}
                                                        className={styles.headerText}
                                                        style={{
                                                            flex: idx === 0 ? 1 : idx === arr.length - 1 ? 0.3 : 0.7,
                                                            textAlign: idx === 0 ? 'left' : 'center',
                                                        }}
                                                    >
                                                        {h}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        {items.map((row, idx, arr) => {
                                            const {amount, button, name, url} = row
                                            const disabled = button?.avail === 0
                                            return (
                                                <div
                                                    key={name + idx}
                                                    onClick={() => {
                                                        // jump(url)
                                                    }}
                                                >
                                                    <div className={classNames([styles.flexRow, styles.row])}>
                                                        <div className={styles.name}>{name}</div>
                                                        <div className={styles.amount}>{amount}</div>
                                                        {button?.text ? (
                                                            <div
                                                                onClick={() => !disabled && jump(button.url)}
                                                                className={styles.btn}
                                                                style={disabled ? {backgroundColor: '#E9EAEF'} : {}}
                                                            >
                                                                <div
                                                                    className={styles.btnText}
                                                                    style={disabled ? {color: '#BDC2CC'} : {}}
                                                                >
                                                                    {button.text}
                                                                </div>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    {idx < arr.length - 1 && (
                                                        <div className={styles.divider}>
                                                            <div
                                                                className={classNames([
                                                                    styles.circle,
                                                                    styles.leftCircle,
                                                                ])}
                                                            />
                                                            <div
                                                                className={classNames([
                                                                    styles.circle,
                                                                    styles.rightCircle,
                                                                ])}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <Empty text={'暂无数据'} />
                                )}
                            </Tabs.Tab>
                        )
                    })}
                </Tabs>
            )}
        </div>
    )
}

export default AutoCharge
