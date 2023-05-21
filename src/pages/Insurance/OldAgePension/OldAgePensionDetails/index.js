import React, {useState, useEffect} from 'react'
import {Loading} from 'antd-mobile'
import './index.css'
import {sendPoint} from '../../utils/sendPoint'

import AppointmentBtn from '../../components/AppointmentBtn'

const pageid = 'Pensiondetails'
let ts_in = 0
const OldAgePensionDetails = ({match}) => {
    const [loading, setLoading] = useState(true)
    // const [saleId] = useState(match.params.sale_id || '')

    useEffect(() => {
        document.title = '养多多2号养老年金险'
        ts_in = Date.now()
        sendPoint({
            pageid: pageid,
            ts: ts_in,
            chn: 'evolution-h5', // 渠道
            event: 'load',
        })
        return () => {
            sendPoint({
                chn: 'evolution-h5', // 渠道
                pageid: pageid,
                ts: Date.now(),
                staytime: Date.now() - ts_in,
                event: 'load',
            })
        }
    }, [])

    return (
        <>
            <div
                className="OldAgePensionDetails"
                style={{
                    height: '100vh',
                    width: '100%',
                    background: '#FFE4D6',
                    overflow: 'hidden',
                }}
            >
                <iframe
                    title="insurance"
                    style={{
                        border: 0,
                        width: '100%',
                        height: '100%',
                        overflowY: 'auto',
                    }}
                    src="https://www.baodan100.com/insurance/fin?id=173958&chn=cps_160154391&subagent=17421&vscene=1#/"
                    onLoad={() => {
                        setLoading(false)
                    }}
                ></iframe>
                {/* {loading || !saleId ? null : (
          <AppointmentBtn saleId={saleId} pageid={pageid} />
        )} */}
                {loading ? null : <AppointmentBtn pageid={pageid} />}

                {loading ? (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            zIndex: 4,
                            background: 'rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        <Loading color={'white'} style={{fontSize: 24}} />
                    </div>
                ) : null}
            </div>
        </>
    )
}

export default OldAgePensionDetails
