/*
 * @Author: xjh
 * @Date: 2021-02-20 10:33:13
 * @Description:消息中心
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-28 14:30:37
 */
import React, {useEffect, useState, useCallback} from 'react'
import classNames from 'classnames'

import {RightOutline} from 'antd-mobile-icons'
import {Colors, Font, Space, Style} from '../../common/commonStyle'
import http from '~/service'
import {jump} from '~/utils'
import styles from './RemindMessage.module.scss'

export default function RemindMessage({navigation}) {
    const [data, setData] = useState({})

    const init = useCallback(() => {
        http.get('/mapi/message/index/20210101').then((res) => {
            res.result.message_list.forEach((it) => {
                if (it.url.path === 'MessageNotice') {
                    it.url.path = 'MessageList'
                }
            })
            window.document.title = res.result.title || '消息提醒'
            setData(res.result)
        })
    }, [])
    useEffect(() => {
        init()
    }, [])

    return (
        <div className={styles.con}>
            {Object.keys(data).length > 0 && (
                <>
                    <div style={{width: '100%', padding: 16}}>
                        <div className={styles.listWrap}>
                            {data?.message_list?.map((_item, _index) => {
                                return (
                                    <div
                                        className={styles.list_card_sty}
                                        style={{
                                            borderBottom:
                                                _index < data?.message_list?.length - 1
                                                    ? '0.5px solid #E9EAEF'
                                                    : 'none',
                                        }}
                                        key={_index + '_item'}
                                        onClick={() => {
                                            global.LogTool(_item.type)
                                            jump(_item.url)
                                        }}
                                    >
                                        <div style={{position: 'relative'}}>
                                            <img src={_item?.icon} style={{width: 40, height: 40}} />
                                            {_item?.unread ? (
                                                <div className={classNames('flexCenter', styles.point_sty)}>
                                                    <span
                                                        style={{
                                                            color: '#fff',
                                                            fontSize: Font.textSm,
                                                            lineHeight: '12px',
                                                            fontFamily: Font.numFontFamily,
                                                            transform: [
                                                                {
                                                                    translateY: 0,
                                                                },
                                                            ],
                                                        }}
                                                    >
                                                        {_item?.unread > 99 ? '99+' : _item?.unread}
                                                    </span>
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className={styles.titleWrap}>
                                            <span className={styles.title_sty}>{_item?.title}</span>
                                            {_item?.content ? (
                                                <span className={styles.desc_sty}>{_item?.content}</span>
                                            ) : null}
                                        </div>

                                        <RightOutline fontSize={12} color={Colors.lightGrayColor} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
