/*
 * @Date: 2022/10/2 23:16
 * @Author: yanruifeng
 * @Description: 日历
 */

import React from 'react'
import {Font, Style} from '../../../common/commonStyle'
import {isEmpty, px} from '../../../utils/appUtil'
import Prev from '../assets/prev.png'
import Next from '../assets/next.png'
const ChartHeader = React.memo(
    ({
        selCalendarType,
        selBarChartType,
        isCalendar,
        isBarChart,
        subMonth,
        addMonth,
        date,
        minDate,
        maxDate,
        filterDate,
    }) => {
        return (
            <>
                <div style={Style.flexBetween}>
                    <div style={styles.chartLeft}>
                        {/*    <TouchableOpacity onPress={selCalendarType}>*/}
                        {/*        <div*/}
                        {/*            style={[*/}
                        {/*                Style.flexCenter,*/}
                        {/*                styles.selChartType,*/}
                        {/*                isCalendar && {*/}
                        {/*                    backgroundColor: Colors.white,*/}
                        {/*                    width: px(60),*/}
                        {/*                },*/}
                        {/*            ]}>*/}
                        {/*            <span*/}
                        {/*                style={{*/}
                        {/*                    color: isCalendar ? Colors.defaultColor : Colors.lightBlackColor,*/}
                        {/*                    fontSize: px(12),*/}
                        {/*                    fontFamily: Font.pingFangRegular,*/}
                        {/*                }}>*/}
                        {/*                日历图*/}
                        {/*            </span>*/}
                        {/*        </div>*/}
                        {/*    </TouchableOpacity>*/}
                        {/*    <TouchableOpacity onPress={selBarChartType}>*/}
                        {/*        <div*/}
                        {/*            style={[*/}
                        {/*                Style.flexCenter,*/}
                        {/*                styles.selChartType,*/}
                        {/*                isBarChart && {*/}
                        {/*                    backgroundColor: Colors.white,*/}
                        {/*                    width: px(60),*/}
                        {/*                },*/}
                        {/*            ]}>*/}
                        {/*            <span*/}
                        {/*                style={{*/}
                        {/*                    color: isBarChart ? Colors.defaultColor : Colors.lightBlackColor,*/}
                        {/*                    fontSize: px(12),*/}
                        {/*                    fontFamily: Font.pingFangRegular,*/}
                        {/*                }}>*/}
                        {/*                柱状图*/}
                        {/*            </span>*/}
                        {/*        </div>*/}
                        {/*    </TouchableOpacity>*/}
                    </div>
                    <div style={styles.selMonth}>
                        {!isEmpty(minDate) && filterDate.format('YYYY-MM') !== minDate && (
                            <div onClick={subMonth}>
                                <img style={{width: px(26)}} src={Prev} alt="" />
                            </div>
                        )}
                        <span style={styles.MMText}>{date}</span>
                        {!isEmpty(maxDate) && filterDate.format('YYYY-MM') !== maxDate && (
                            <div onClick={addMonth}>
                                <img style={{width: px(26)}} src={Next} alt="" />
                            </div>
                        )}
                    </div>
                </div>
            </>
        )
    },
)

export default ChartHeader
const styles = {
    selMonth: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    MMText: {
        fontSize: px(30),
        fontFamily: Font.numFontFamily,
        color: '#3D3D3D',
        marginLeft: px(20),
        marginRight: px(16),
    },
    prevIcon: {
        resizeMode: 'cover',
    },
    nextIcon: {
        resizeMode: 'cover',
    },
    chartLeft: {
        width: px(126),
        height: px(27),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        backgroundColor: '#F4F4F4',
        borderRadius: px(6),
        opacity: 0,
    },
    selChartType: {
        borderRadius: px(4),
        height: px(21),
        width: px(60),
        fontFamily: Font.numRegular,
    },
}
