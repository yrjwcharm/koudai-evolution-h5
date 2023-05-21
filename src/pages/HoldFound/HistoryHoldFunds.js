/*
 * @Date: 2021-01-29 17:10:11
 * @Author: dx
 * @LastEditors: dx
 * @LastEditTime: 2021-04-13 21:31:42
 * @Description: 历史持有基金
 */
import React, {useCallback, useMemo, useEffect, useState} from 'react'

import Empty from '~/pages/Trade/components/EmptyTip'
// import {jump} from '~/utils'
import {Colors, Space, Style, Font} from '~/common/commonStyle'
import QueryString from 'qs'
import http from '~/service'
import FlatList from '~/pages/Trade/components/FlatList'
import PageDataLoader from '~/pages/Trade/components/PageDataLoader.js'

const merge = (list) => Object.assign({}, ...list)

const getData = (param, {signal, next}) => {
    http.get(
        '/portfolio/funds/user_redeemed/20210101',
        {
            ...param,
        },
        null,
        'kapi',
        signal,
    )
        .then((res) => {
            if (res.code === '000000') {
                const {has_more, list} = res.result
                next(null, {hasMore: has_more, data: list, result: res.result})
            } else {
                next(res)
            }
        })
        .catch((err) => {
            next(err)
        })
}

const HistoryHoldFunds = ({navigation, route}) => {
    const params = QueryString.parse(window.location.href.split('?')[1]) || {}
    const {poid = 'X00F000003'} = params
    const loader = useMemo(() => {
        return new PageDataLoader({
            name: 'HistoryHoldFunds',
            fetcher: getData,
            initParams: {poid, page: 1},
        })
    }, [poid])
    const [header, setHeader] = useState([])
    const [showEmpty, setShowEmpty] = useState(false)

    window.document.title = '历史持有基金'
    useEffect(() => {
        const onData = ({result}) => {
            const {header, title} = result
            setHeader(header)
            setShowEmpty(true)
            window.document.title = title || '历史持有基金'
        }
        loader.addListener('data', onData)
        return () => {
            loader.removeListener('data', onData)
        }
    }, [])

    // 渲染头部
    const renderHeader = useCallback(() => {
        return (
            <div style={merge([Style.flexRow, styles.header])}>
                {(header || []).map((item, index, arr) => {
                    return (
                        <span
                            key={item + index}
                            style={merge([
                                styles.headerText,
                                index === 0 ? {textAlign: 'left'} : {},
                                index === arr.length - 1 ? {textAlign: 'right'} : {},
                            ])}
                        >
                            {item}
                        </span>
                    )
                })}
            </div>
        )
    }, [header])

    // 渲染空数据状态
    const renderEmpty = useCallback(() => {
        return showEmpty ? <Empty text={'暂无历史持有基金数据'} /> : null
    }, [showEmpty])
    // 渲染列表项
    const renderItem = useCallback(
        ({item, index}) => {
            return (
                <div
                    onClick={() => {
                        // 暂时不能点击
                        // global.LogTool('click', 'fund', item.code)
                        // jump(item.url)
                    }}
                    style={merge([
                        Style.flexRow,
                        styles.item,
                        index % 2 === 1 ? {backgroundColor: Colors.bgColor} : {},
                    ])}
                >
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <span style={styles.itemText}>{item.name}</span>
                        <span style={merge([styles.itemText, {fontFamily: Font.numRegular}])}>{item.code}</span>
                    </div>
                    <span
                        style={merge([
                            styles.itemText,
                            {
                                textAlign: 'right',
                                color: getColor(`${item.profit_acc}`),
                                fontWeight: 'bold',
                                fontFamily: Font.numFontFamily,
                            },
                        ])}
                    >
                        {parseFloat(`${item.profit_acc}`?.replace(/,/g, '')) > 0
                            ? `+${item.profit_acc}`
                            : item.profit_acc}
                    </span>
                </div>
            )
        },
        [navigation, getColor],
    )
    // 获取涨跌颜色
    const getColor = useCallback((t) => {
        if (!t) {
            return Colors.defaultColor
        }
        if (parseFloat(t.replace(/,/g, '')) < 0) {
            return Colors.green
        } else if (parseFloat(t.replace(/,/g, '')) > 0) {
            return Colors.red
        } else {
            return Colors.defaultColor
        }
    }, [])

    return (
        <div style={styles.container}>
            {renderHeader()}
            <FlatList loader={loader} renderItem={renderItem} renderEmpty={renderEmpty} />
        </div>
    )
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: Colors.bgColor,
        paddingTop: 36,
    },
    header: {
        position: 'fixed',
        width: '100vw',
        top: 0,
        left: 0,
        zIndex: 2,
        height: 36,
        backgroundColor: Colors.bgColor,
        paddingLeft: 12,
        paddingRight: 14,
    },

    headerText: {
        flex: 1,
        fontSize: 13,
        lineHeight: '18px',
        color: Colors.darkGrayColor,
        textAlign: 'center',
    },
    item: {
        // height: 45,
        backgroundColor: '#fff',
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: 12,
        paddingRight: 14,
    },
    itemText: {
        flex: 1,
        fontSize: 13,
        lineHeight: '18px',
        whiteSpace: 'nowrap',
        color: Colors.defaultColor,
    },
}

export default HistoryHoldFunds
