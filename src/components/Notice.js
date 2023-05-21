/*
 * @Date: 2021-01-25 11:42:26
 * @Description:小黄条
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-21 21:08:46
 */
import React from 'react'
import {Space, Style} from '../common/commonStyle'
import {jump, px} from '../utils'
import {sendPoint} from '../pages/Insurance/utils/sendPoint'
export default function Notice(props) {
    return (
        <div style={styles.yellow_wrap_sty}>
            {props.content && Array.isArray(props.content) ? (
                props.content?.map((item, index, arr) => {
                    return (
                        <div
                            key={index}
                            style={{
                                ...Style.flexBetween,
                                paddingTop: px(8),
                                paddingBottom: px(8),
                                ...props.style,
                                borderBottomWidth: arr.length > 1 && index != arr.length - 1 ? px(0.5) : 0,
                                borderBottomColor:
                                    arr.length > 1 && index != arr.length - 1 ? '#F7CFB2' : 'transparent',
                            }}
                            onClick={() => {
                                props.onClick && props.onClick(index)
                                // item?.log_id && global.LogTool(item?.log_id)
                                sendPoint({
                                    pageid: item?.log_id,
                                    ts: Date.now(),
                                    chn: 'evolution-h5', // 渠道
                                    event: 'click',
                                })
                                jump(item?.button?.url)
                            }}
                        >
                            <div style={{flex: 1}}>
                                <span style={styles.yellow_sty} numberOfLines={arr.length > 1 ? 2 : 100}>
                                    {item?.desc}
                                </span>
                            </div>
                            {item?.button?.text ? (
                                <div style={styles.btn}>
                                    <span style={styles.btn_text}>{item?.button?.text}</span>
                                </div>
                            ) : null}
                        </div>
                    )
                })
            ) : props.content?.content ? (
                <div
                    style={{
                        ...Style.flexBetween,
                        paddingTop: px(8),
                        paddingBottom: px(8),
                        ...props.style,
                    }}
                    onClick={() => {
                        props.onClick && props.onClick()
                        props.content?.log_id && global.LogTool(props.content?.log_id)
                        jump(props.content?.url)
                    }}
                >
                    <span style={styles.yellow_sty} dangerouslySetInnerHTML={props.content.content} />
                    {props.content?.button ? (
                        <div style={styles.btn}>
                            <span style={styles.btn_text}>{props.content?.button?.text}</span>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    )
}

const styles = {
    yellow_wrap_sty: {
        backgroundColor: '#FFF5E5',
        paddingLeft: px(16),
        paddingRight: px(16),
    },
    yellow_sty: {
        color: '#EB7121',
        paddingTop: px(5),
        paddingBottom: px(5),
        lineHeight: px(18),
        fontSize: px(13),
        flex: 1,
    },
    btn: {
        borderRadius: px(14),
        paddingTop: px(4),
        paddingBottom: px(4),
        // paddingHorizontal: px(10),
        paddingLeft: px(10),
        paddingRight: px(10),
        backgroundColor: '#FF7D41',
        marginLeft: px(12),
    },
    btn_text: {
        fontWeight: '600',
        color: '#fff',
        fontSize: px(12),
        lineHeight: px(17),
    },
}

Notice.defaultProps = {
    content: {},
    isClose: false,
}
