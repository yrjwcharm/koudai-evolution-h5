import React, {useState, useEffect} from 'react'
import './index.css'
import qs from 'qs'
import {storage} from '../../../utils'
import {sendPoint} from '../utils/sendPoint'
import AppointmentBtn from '../components/AppointmentBtn'

const pageid = 'Pensionpublicity'
let ts_in = 0

const OldAgePension = ({history}) => {
    const btnUrl = 'https://static.licaimofang.com/wp-content/uploads/2022/07/educational-button.png'
    const imgUrls = [
        'https://static.licaimofang.com/wp-content/uploads/2022/09/old-age-1.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/09/old-age-2.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/09/old-age-3.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/09/old-age-4.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/09/old-age-5.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/09/old-age-6.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/09/old-age-7.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/09/old-age-8.png',
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
        window.location.href = `/oldAgePensionDetails`
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
        document.title = '养老金计划'
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
                className="OldAgePension"
                style={{
                    height: '100vh',
                    width: '100%',
                    background: '#FEC16F',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        fontSize: 0,
                    }}
                >
                    {imgUrls.map((item, index) => {
                        return (
                            <img
                                key={index}
                                src={item}
                                alt=""
                                style={{
                                    width: '100%',
                                    marginBottom: '0',
                                }}
                            />
                        )
                    })}
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

export default OldAgePension
