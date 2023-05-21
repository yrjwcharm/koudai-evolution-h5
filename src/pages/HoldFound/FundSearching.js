/*
 * @Date: 2021-01-28 14:23:24
 * @Author: dx
 * @LastEditors: yhc
 * @LastEditTime: 2022-04-13 10:52:20
 * @Description: 基金查询
 */
import React, {useEffect, useState} from 'react'

import {Colors, Style, Space, Font} from '~/common/commonStyle'

import QueryString from 'qs'
import http from '~/service'
import EmptyTip from '~/pages/Trade/components/EmptyTip'

const merge = (list) => Object.assign({}, ...list)
const FundSearching = ({route}) => {
    const params = QueryString.parse(window.location.href.split('?')[1]) || {}
    const {poid = 'X00F000003'} = params

    const [data, setData] = useState({})
    const [loaded, setLoaded] = useState(false)
    // 打开查询网址
    window.document.title = '基金查询方式'

    useEffect(() => {
        http.get('/portfolio/funds/searching/20210101', {
            ...params,
            poid,
        }).then((res) => {
            setLoaded(true)
            setData(res.result)
        })
    }, [route])
    return (
        <div style={styles.container}>
            {data?.list && data.list.length > 0 ? (
                <>
                    <span style={merge([styles.desc, {paddingBottom: Space.padding}])}>
                        {'在理财魔方购买的所有基金都可以在基金官网查询哦，您购买的基金查询方式如下'}
                    </span>
                    {data.list.map((item, index) => {
                        return (
                            <div style={styles.cardContainer} key={index}>
                                <div style={styles.cardTitle}>
                                    <span style={styles.title}>{item.name}</span>
                                </div>
                                <div style={merge([Style.flexRow, styles.contentItem])}>
                                    <span style={styles.contentKey}>{'查询网址'}</span>
                                    <a style={merge([styles.desc, styles.site])} href={`https:${item.site}`}>
                                        {item.site}
                                    </a>
                                </div>
                                <div style={merge([Style.flexRow, styles.contentItem])}>
                                    <span style={styles.contentKey}>{'查询流程'}</span>
                                    <span style={styles.procedure}>{item.process}</span>
                                </div>
                            </div>
                        )
                    })}
                </>
            ) : (
                loaded && <EmptyTip style={{paddingTop: 40, paddingBottom: 40}} text={'暂无数据'} />
            )}
        </div>
    )
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: Colors.bgColor,
        paddingLeft: Space.padding,
        paddingRight: Space.padding,
        paddingTop: Space.padding,
    },
    desc: {
        fontSize: 13,
        lineHeight: '18px',
        color: Colors.descColor,
    },
    cardContainer: {
        paddingLeft: Space.padding,
        paddingRight: Space.padding,
        marginBottom: 12,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    cardTitle: {
        paddingTop: 12,
        paddingBottom: 12,
        marginBottom: 12,
        borderBottomWidth: Space.borderWidth,
        borderColor: Colors.borderColor,
        fontWeight: 'bold',
    },
    contentItem: {
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    contentKey: {
        fontSize: Font.textH3,
        lineHeight: '17px',
        color: Colors.darkGrayColor,
        marginRight: 4,
    },
    site: {
        color: Colors.brandColor,
    },
    procedure: {
        fontSize: Font.textH3,
        lineHeight: '20px',
        color: Colors.descColor,
        flex: 1,
        transform: [{translateY: '-2px'}],
        textAlign: 'start',
    },
}

export default FundSearching
