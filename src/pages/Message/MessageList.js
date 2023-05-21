/*
 * @Author: xjh
 * @Date: 2021-02-20 11:43:41
 * @Description:交易通知和活动通知
 * @LastEditors: yhc
 * @LastEditTime: 2021-11-26 19:12:42
 */
import React, {useEffect, useState, useCallback, useRef, useMemo} from 'react'
import QueryString from 'qs'
import _ from 'lodash'
import {Colors, Font, Space, Style} from '../../common/commonStyle'
import http from '~/service'
import {RightOutline} from 'antd-mobile-icons'
import HTML from '~/pages/Trade/components/RenderHTML'
import {jump} from '~/utils'
import styles from './MessageList.module.scss'
import FlatList from '~/pages/Trade/components/FlatList'
import PageDataLoader from '~/pages/Trade/components/PageDataLoader.js'
import {on} from 'hammerjs'

const requestData = (params, {signal, next}) => {
    return http
        .get('/mapi/message/list/20210101', params, null, 'kapi', signal)
        .then((res) => {
            if (res.code === '000000') {
                const {has_more, messages, title} = res.result

                next(null, {data: messages, hasMore: has_more, result: res.result})
            } else {
                next(res)
            }
        })
        .catch((err) => {
            next(err)
        })
}

export default function MessageNotice({navigation, route}) {
    const params = QueryString.parse(window.location.href.split('?')[1]) || {}
    const {type: qType} = params
    const [type, setType] = useState(qType)
    const viewedItems = useRef([])

    const loader = useMemo(() => {
        return new PageDataLoader({
            name: 'messageListLoader',
            initParams: {type, page: 1},
            fetcher: requestData,
        })
    }, [type])

    useEffect(() => {
        const onData = ({result}) => {
            console.log('onData:', result)
            const {title} = result
            window.document.title = title || '消息提醒'
        }
        loader.addListener('data', onData)
        return () => loader.removeListener('data', onData)
    }, [])

    // 已读接口
    const readInterface = useCallback(
        (id, _type, url, read, index) => {
            // is_read==0没读

            if (read) {
                jump(url)
                return
            }
            let _params
            if (_type) {
                _params = {type}
            } else {
                _params = {id}
            }
            http.get('/message/read/20210101', _params).then((res) => {
                if (res.code === '000000') {
                    if (_type == 'all') {
                        loader.changeData((prev) => {
                            const _listAll = _.cloneDeep(prev)
                            _listAll.forEach((item) => {
                                item.is_read = 1
                            })
                            return _listAll
                        })
                    } else {
                        loader.changeData((prev) => {
                            const _list = _.cloneDeep(prev)
                            _list[index].is_read = 1
                            return _list
                        })
                        setTimeout(() => {
                            jump(url)
                        })
                    }
                }
            })
        },
        [jump, type],
    )
    // 渲染列表项
    const renderItem = ({item, index}) => {
        return (
            <div>
                {/* 最多六行文字 */}
                {item?.content_type == 0 && (
                    <div
                        className={styles.card_sty}
                        onClick={() => {
                            global.LogTool('noticeStart', item.log_id)
                            readInterface(item.id, '', item.jump_url, item?.is_read, index)
                        }}
                    >
                        <div style={Style.flexBetween}>
                            <span
                                className={styles.title_sty}
                                style={item?.is_read == 1 ? {color: Colors.darkGrayColor} : {}}
                                numberOfLines={2}
                            >
                                {item.title}
                            </span>
                            <span
                                className={styles.time_Sty}
                                style={
                                    item?.is_read == 1
                                        ? {color: Colors.darkGrayColor, alignSelf: 'flex-start'}
                                        : {alignSelf: 'flex-start'}
                                }
                            >
                                {item.post_time}
                            </span>
                        </div>
                        <div style={{...Style.flexBetween, marginTop: 12}}>
                            <span
                                className={styles.content_sty}
                                style={item?.is_read == 1 ? {color: Colors.darkGrayColor} : {}}
                            >
                                {item.content}
                            </span>
                            {item.jump_url ? <RightOutline fontSize={12} color={'#8F95A7'} /> : null}
                        </div>
                    </div>
                )}
                {/* 图文 */}
                {item?.content_type == 1 && (
                    <div
                        className={styles.card_sty}
                        style={{padding: 0}}
                        onClick={() => {
                            global.LogTool('noticeStart', item.log_id)
                            readInterface(item.id, '', item.jump_url, item?.is_read, index)
                        }}
                    >
                        <div
                            style={{
                                borderTopLeftRadius: 10,
                                borderTopRightRadius: 10,
                                overflow: 'hidden',
                            }}
                        >
                            <img src={item.img_url} className={styles.cover_img} />
                        </div>
                        <div className={styles.content_wrap_sty}>
                            <div style={{flex: 1}}>
                                <span
                                    numberOfLines={2}
                                    className={styles.card_title}
                                    style={{color: item?.is_read == 1 ? Colors.darkGrayColor : Colors.defaultColor}}
                                >
                                    {item.title}
                                </span>
                                <span
                                    style={{
                                        fontSize: Font.textH3,
                                        color: item?.is_read == 1 ? Colors.darkGrayColor : Colors.darkGrayColor,
                                    }}
                                >
                                    {item.post_time}
                                </span>
                            </div>
                            {item.jump_url ? <RightOutline fontSize={12} color={'#8F95A7'} /> : null}
                        </div>
                    </div>
                )}
                {/* 不限制几行文字 内容支持html */}
                {item?.content_type == 2 && (
                    <div
                        className={styles.card_sty}
                        onClick={() => {
                            global.LogTool('noticeStart', item.log_id)
                            readInterface(item.id, '', item.jump_url, item?.is_read, index)
                        }}
                    >
                        <div style={Style.flexBetween}>
                            <span
                                className={styles.title_sty}
                                style={item?.is_read == 1 ? {color: Colors.darkGrayColor} : {}}
                                numberOfLines={2}
                            >
                                {item.title}
                            </span>
                            <span
                                className={styles.time_Sty}
                                style={
                                    item?.is_read == 1
                                        ? {color: Colors.darkGrayColor, alignSelf: 'flex-start'}
                                        : {alignSelf: 'flex-start'}
                                }
                            >
                                {item.post_time}
                            </span>
                        </div>
                        <div style={{...Style.flexBetween, marginTop: 12}}>
                            <div style={{marginRight: Space.marginAlign, flexShrink: 1}}>
                                <HTML
                                    html={
                                        item?.is_read == 1
                                            ? `<span style="color: #9aA1B2;">${item.read_content}</span>`
                                            : item.content
                                    }
                                    className={styles.content_sty}
                                />
                            </div>
                            {item.jump_url ? <RightOutline fontSize={12} color={'#8F95A7'} /> : null}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const onViewableItemsChanged = useCallback(({viewableItems}) => {
        // console.log(viewableItems);
        viewableItems.forEach((val) => {
            const hasItem = viewedItems.current.some((item) => item.id === val.item.id)
            if (!hasItem) {
                global.LogTool('messageNoticepointStart', val.item.id)
                viewedItems.current.push(val.item)
            }
        })
    }, [])

    return (
        <FlatList
            style={{backgroundColor: Colors.bgColor}}
            className={styles.container}
            loader={loader}
            renderItem={renderItem}
        />
    )
}
