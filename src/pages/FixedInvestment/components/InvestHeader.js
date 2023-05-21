/*
 * @Date: 2022/10/11 13:58
 * @Author: yanruifeng
 * @Description: 定投header
 */

import React from 'react'
import {isEmpty, px} from '../../../utils/appUtil'
import {Colors, Font} from '../../../common/commonStyle'
import asc from '../assets/asc.png'
import desc from '../assets/desc.png'
import sort from '../assets/sort.png'
import {sendPoint} from '../../Insurance/utils/sendPoint'
const InvestHeader = React.memo(({headList, handleSort, style}) => {
    const [left, center, right] = headList
    const icon1 = isEmpty(center?.sort_type) ? sort : center?.sort_type == 'desc' ? desc : asc
    const icon2 = isEmpty(right?.sort_type) ? sort : right?.sort_type == 'desc' ? desc : asc

    return (
        <div style={{...style, marginLeft: px(32), marginRight: px(32)}}>
            <div style={styles.sortChoiceView}>
                <div style={styles.sortChoiceWrap}>
                    <span style={styles.sortText}>{left?.text}</span>
                    <div
                        onClick={() => {
                            sendPoint({
                                pageid: 'investment_periods_order',
                                ts: Date.now(),
                                chn: 'evolution-h5', // 渠道
                                event: 'click',
                            })
                            handleSort(center)
                        }}
                    >
                        <div style={styles.investIssue}>
                            <span style={styles.sortText}>{center?.text}</span>

                            <img src={icon1} width={px(12)} />
                        </div>
                    </div>
                    <div
                        onClick={() => {
                            global.LogTool('click', 'accumlated_investment_order')
                            handleSort(right)
                        }}
                    >
                        <div style={styles.totalSort}>
                            <span style={styles.sortText}>{right?.text}</span>
                            <img src={icon2} width={px(12)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})
export default InvestHeader
const styles = {
    sortText: {
        fontSize: px(22),
        marginRight: px(4),
        fontFamily: Font.pingFangRegular,
        fontWeight: 'normal',
        color: Colors.lightGrayColor,
    },
    totalSort: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    sortChoiceView: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        paddingLeft: px(24),
        paddingRight: px(24),
        borderRadius: px(12),
        height: px(64),
        justifyContent: 'center',
        boxShadow: `0px 8px 20px 0px rgba(170,170,170,0.102)`,
    },
    investIssue: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    sortChoiceWrap: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
}
