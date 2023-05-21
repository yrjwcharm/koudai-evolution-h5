/*
 * @Date: 2022-12-14 11:32:40
 * @Description: 交易筒子
 */
import {RightOutline} from 'antd-mobile-icons'
import React from 'react'
import {jump} from '~/utils'

function TradeNotice({data, style, textStyle, iconColor}) {
    return (
        <div
            onClick={(e) => {
                e.stopPropagation()
                global.LogTool('click', 'tradeMsg')
                jump(data.url)
            }}
            style={{marginTop: '12px', padding: '9px 12px', borderRadius: 4, fontSize: '12px', ...style, ...textStyle}}
        >
            {data?.desc} <RightOutline color={iconColor || '#fff'} />
        </div>
    )
}

export default TradeNotice
