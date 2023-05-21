/*
 * @Date: 2022/10/22 19:38
 * @Author: yanruifeng
 * @Description:
 */
import {px} from '../../../utils/appUtil'
import image from '../../../image/empty-icon.png'
import React from 'react'
import {Colors, Font, Style} from '../../../common/commonStyle'
const EmptyData = ({left = px(16), width = window.innerWidth - px(32), height = px(211)}) => {
    return (
        <div style={{marginTop: px(24), marginLeft: px(32), marginRight: px(32)}}>
            <div style={styles.emptyView}>
                <img src={image} style={styles.emptyImg} />
                <span style={styles.emptyText}>暂无数据</span>
            </div>
        </div>
    )
}
const styles = {
    emptyView: {
        ...Style.flexCenter,
        flexDirection: 'column',
        height: px(422),
        borderRadius: px(12),
        background: `linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 100%)`,
        boxShadow: `0px 8px 20px 0px rgba(170,170,170,0.102)`,
    },
    emptyImg: {
        // height: px(96),
        width: px(180),
    },
    emptyText: {
        marginTop: px(30),
        fontSize: px(26),
        fontFamily: Font.pingFangRegular,
        fontWeight: 'normal',
        color: Colors.lightGrayColor,
    },
}
export default EmptyData
