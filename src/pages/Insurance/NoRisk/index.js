import React, {useState, useEffect} from 'react'
import './index.css'
import qs from 'qs'
import {storage} from '../../../utils'
import {sendPoint} from '../utils/sendPoint'
import AppointmentBtn from '../components/AppointmentBtn'

const pageid = 'Riskfreepublicity'
let ts_in = 0
const NoRisk = ({history}) => {
    const btnUrl = 'https://static.licaimofang.com/wp-content/uploads/2022/07/educational-button.png'
    const imgTop = 'https://static.licaimofang.com/wp-content/uploads/2022/09/no-risk-1.png'
    const imgUrls = [
        'https://static.licaimofang.com/wp-content/uploads/2022/09/no-risk-2.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/09/no-risk-3.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/09/no-risk-4.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/09/no-risk-5.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/09/no-risk-6.png',
    ]

    const [showIcon, setShowIcon] = useState(false)
    // const [saleId, setSaleId] = useState('')

    // const getData = () => {
    //   ts_in = Date.now()
    //   sendPoint({
    //     pageid: pageid,
    //     ts: ts_in,
    //     chn: 'evolution-h5', // 渠道
    //     event: 'load'
    //   })
    //   http
    //     .get(
    //       'https://marketapi-saas.licaimofang.com/insurance_planner/20220720/get_userinfo_by_token',
    //       {}
    //     )
    //     .then((res) => {
    //       if (res.code === 20000) {
    //         // result: insurance_planner>sale_id
    //         setSaleId(`ins_${res.result.insurance_planner.sale_id}`)
    //       } else {
    //         Toast.fail(res.message)
    //       }
    //     })
    //     .catch((err) => {
    //       console.log(err)
    //     })
    // }

    const toDetails = () => {
        sendPoint({
            chn: 'evolution-h5', // 渠道
            pageid: pageid,
            ts: Date.now(),
            event: 'click_consult',
        })
        window.location.href = `/noRiskDetails`
    }

    useEffect(() => {
        let timer
        if (window.ReactNativeWebView) {
            const {timeStamp} = qs.parse(window.location.href.split('?')[1]) || {}
            timer = setInterval(() => {
                if (storage.getItem('loginStatus')?.timeStamp === timeStamp) {
                    clearInterval(timer)
                    // getData()
                    setShowIcon(true)
                }
            }, 10)
        } else {
            // getData()
            setShowIcon(true)
        }
        return () => {
            timer && clearInterval(timer)
        }
    }, [])

    useEffect(() => {
        document.title = '无风险账户'
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
                className="NoRisk"
                style={{
                    height: '100vh',
                    width: '100%',
                    background: '#FCE4C7',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                    }}
                >
                    <img
                        src={imgTop}
                        alt=""
                        style={{
                            width: '100%',
                            marginBottom: '10px',
                        }}
                    />
                    <div>
                        {imgUrls.map((item, index) => {
                            return (
                                <img
                                    key={index}
                                    src={item}
                                    alt=""
                                    style={{
                                        width: '100%',
                                        marginBottom: '24px',
                                    }}
                                />
                            )
                        })}
                    </div>
                </div>
                <div
                    style={{
                        padding: '12px 12px',
                    }}
                >
                    <img
                        src={btnUrl}
                        alt=""
                        style={{
                            width: '100%',
                        }}
                        onClick={toDetails}
                    />
                </div>

                {/* {saleId ? <AppointmentBtn saleId={saleId} pageid={pageid} /> : null} */}
                {showIcon ? <AppointmentBtn pageid={pageid} /> : null}
            </div>
        </>
    )
}

export default NoRisk
