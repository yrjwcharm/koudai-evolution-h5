/*
 * @Date: 2022/9/30 13:28
 * @Author: yanruifeng
 * @Description:
 */
import React, {useCallback, useState} from 'react'
// import {ScrollView, StyleSheet, View} from 'react-native';
import {isIphoneX, px} from '../../utils/appUtil'
// import {Colors, Font, Space} from '~/common/commonStyle'
import RenderList from './components/RenderList'
import AccEarningsCom from './components/AccEarningsCom'
const TotalProfit = React.memo(({poid, fund_code, type, unit_type}) => {
    const [period, setPeriod] = useState('all')
    const changePeriod = useCallback((period) => {
        setPeriod(period)
    }, [])
    return (
        <div style={styles.container}>
            {/*<ScrollView showsVerticalScrollIndicator={false}>*/}
            <AccEarningsCom type={type} changePeriod={changePeriod} fund_code={fund_code} poid={poid} />
            <div
                style={{
                    // paddingHorizontal: px(12),
                    paddingLeft: px(24),
                    paddingRight: px(24),
                }}
            >
                <RenderList curDate={period} fund_code={fund_code} poid={poid} type={type} unitType={unit_type} />
            </div>
            {/*</ScrollView>*/}
        </div>
    )
})

TotalProfit.propTypes = {}

export default TotalProfit

const styles = {
    container: {
        minHeight: px(500),
        backgroundColor: '#fff',
        paddingBottom: px(44),
        borderBottomLeftRadius: px(10),
        borderBottomRightRadius: px(10),
        marginBottom: isIphoneX() ? px(58) : px(24),
    },
}
