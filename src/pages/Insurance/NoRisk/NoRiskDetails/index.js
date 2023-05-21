import React, {useState, useEffect} from 'react'
import {Loading} from 'antd-mobile'
import './index.css'
import {sendPoint} from '../../utils/sendPoint'

import AppointmentBtn from '../../components/AppointmentBtn'

const pageid = 'Riskfreedetails'
let ts_in = 0
const NoRiskDetails = ({match}) => {
    const [loading, setLoading] = useState(true)
    // const [saleId] = useState(match.params.sale_id || '')

    useEffect(() => {
        document.title = '昆仑健康乐享年年'
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
                className="NoRiskDetails"
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
                    src="https://sky.baoyun18.com/m/short2020/trial?wareId=23666&accountId=10000747235&aSign=a0893c987c4e29c6c87feb6180353963&partner=67000&partnerTag="
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

export default NoRiskDetails
