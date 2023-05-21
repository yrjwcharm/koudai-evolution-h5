/*
 * @Date: 2022/10/20 00:17
 * @Author: yanruifeng
 * @Description:
 */

// import {Image, Text, StyleSheet, View} from 'react-native';
import {px} from '../../../utils/appUtil'
// import {BoxShadow} from 'react-native-shadow';
import React from 'react'
import {Colors, Style} from '../../../common/commonStyle'
import Empty from '../../../image/icon/noProfit.png'
const EmptyData = () => {
    return (
        <div style={styles.emptyView}>
            <img src={Empty} style={styles.emptyImg} alt="" />
            <span style={styles.emptyText}>暂无数据</span>
        </div>
    )
}
export default EmptyData
const styles = {
    emptyView: {
        flexDirection: 'column',
        backgroundColor: Colors.white,
        ...Style.flexCenter,
        height: px(422),
        background: `linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 100%)`,
        boxShadow: `0px 8px 20px 0px rgba(170,170,170,0.102)`,
        borderBottomLeftRadius: px(12),
        borderBottomRightRadius: px(12),
    },
    emptyImg: {
        height: px(64),
        width: px(120),
    },
    emptyText: {
        marginTop: px(30),
        fontWeight: '500',
        fontSize: px(24),
        color: Colors.descColor,
    },
}
