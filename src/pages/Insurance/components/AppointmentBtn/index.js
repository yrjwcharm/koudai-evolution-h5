import React from 'react'
import './index.css'

import appoimg from '../../../../image/insurance/appointment.png'

import {distribution} from '../../utils/distribution'

const AppointmentBtn = ({saleId, pageid}) => {
    return (
        <div
            className="appointmentBtn"
            onClick={() => {
                // sendPoint({
                //   chn: 'evolution-h5', // 渠道
                //   pageid: pageid,
                //   ts: Date.now(),
                //   event: 'click_appointment'
                // })
                // const _params = JSON.stringify({
                //   path: `pages/workWeixin/index?params=${saleId}`,
                //   type: 5,
                //   id: 34,
                //   params: { app_id: 'gh_26accfa89791' }
                // })
                // if (window.ReactNativeWebView) {
                //   window.ReactNativeWebView.postMessage(`url=${_params}`)
                // }‘
                distribution(pageid)
            }}
        >
            <img
                src={appoimg}
                alt=""
                style={{
                    width: '100%',
                }}
            />
        </div>
    )
}

export default AppointmentBtn
