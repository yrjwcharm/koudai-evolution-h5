/*
 * @Date: 2021-01-29 18:52:23
 * @Author: yhc
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-28 11:08:51
 * @Description: 数据空的时候提示组件
 */
import React from 'react'
import {Colors, Font} from '../../common/commonStyle'
import {px} from '../../utils'
import image from '../../image/empty-icon.png'
const EmptyTip = (props) => {
    const {
        children,
        text = '暂无数据',
        paddingTop = px(80),
        img = image,
        style,
        textStyle,
        imageStyle,
        type = 'page',
        desc = '',
    } = props
    return (
        <div style={{...styles.con, style, paddingTop}}>
            <img style={{...styles.image, height: type === 'page' ? px(96) : 0, ...imageStyle}} src={img} alt={''} />
            <span style={{...styles.text, ...(type === 'page' ? styles.title : {}), textStyle}}> {text} </span>
            {desc ? <span style={styles.desc}>{desc}</span> : null}
            {children}
        </div>
    )
}
const styles = {
    con: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    image: {
        height: px(64),
        width: px(120),
    },
    text: {
        fontSize: Font.textH3,
        lineHeight: px(17),
        marginTop: px(8),
        fontWeight: '500',
        color: Colors.descColor,
    },
    title: {
        marginTop: px(30),
        fontSize: px(13),
        lineHeight: px(22),
        color: Colors.defaultColor,
        fontWeight: '700',
        textAlign: 'center',
    },
    desc: {
        marginTop: px(2),
        fontSize: px(11),
        color: Colors.descColor,
    },
}

export default EmptyTip
