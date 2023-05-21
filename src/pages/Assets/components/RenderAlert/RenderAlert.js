/*
 * @Date: 2022-12-14 11:01:27
 * @Description:
 */
import React from 'react'
import {getAlertColor} from '../util'

export const RenderAlert = ({alert}) => {
    const {bgColor, buttonColor} = getAlertColor(alert.alert_style)
    return <div style={{padding: '8px', backgroundColor: bgColor, marginTop: 8, borderRadius: 4}}>RenderAlert</div>
}
