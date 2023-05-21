import React from 'react'
import {Colors, Font} from '~/common/commonStyle'
import image from '~/image/empty-icon.png'
const EmptyTip = (props) => {
    const {
        children,
        text = '暂无数据',
        paddingTop = 80,
        imgUrl = image,
        style,
        textStyle,
        imageStyle,
        type = 'page',
        desc = '',
    } = props
    return (
        <div style={merge([styles.con, style, {paddingTop}])}>
            <img style={merge([styles.image, type === 'page' ? {height: 96} : {}, imageStyle])} src={imgUrl} alt={''} />
            <span style={merge([styles.text, type === 'page' ? styles.title : {}, textStyle])}> {text} </span>
            {desc ? <span style={styles.desc}>{desc}</span> : null}
            {children}
        </div>
    )
}
const merge = (list) => Object.assign({}, ...list)
const styles = {
    con: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    image: {
        height: '64px',
        // width: '120px',
    },
    text: {
        fontSize: Font.textH3,
        lineHeight: '17px',
        marginTop: 8,
        fontWeight: '500',
        color: Colors.descColor,
    },
    title: {
        marginTop: 30,
        fontSize: 13,
        lineHeight: '22px',
        color: Colors.defaultColor,
        fontWeight: '700',
        textAlign: 'center',
    },
    desc: {
        marginTop: 2,
        fontSize: 11,
        color: Colors.descColor,
    },
}

export default EmptyTip
