import React, {useEffect, useState, useMemo} from 'react'
import http from '../../service'
import {storage, inApp, isIOS} from '../../utils'
import qs from 'qs'
import {DotLoading} from 'antd-mobile'
import styles from './index.module.scss'
import {Toast} from 'antd-mobile'

const inWeChat = () => {
    const ua = window.navigator.userAgent.toLowerCase()
    // eslint-disable-next-line eqeqeq
    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
        return true
    } else {
        return false
    }
}

const PortfolioIntroduce = () => {
    const [data, setData] = useState(null)
    const [imgsLoaded, updateImgsLoaded] = useState(false)
    const params = qs.parse(window.location.search.split('?')[1] || '') || {}

    const getInitReady = useMemo(() => {
        return !!data && imgsLoaded
    }, [data, imgsLoaded])

    const getData = () => {
        http.get('/portfolio/intro/20220812', {plan_id: params.plan_id})
            .then((res) => {
                if (res.code === '000000') {
                    setData(res.result)
                } else {
                    Toast.show(res.message)
                }
            })
            .catch((err) => {
                Toast.show('网络繁忙')
                console.log(err)
            })
    }

    useEffect(() => {
        let timer
        if (inApp) {
            const {timeStamp} = qs.parse(window.location.href.split('?')[1]) || {}
            timer = setInterval(() => {
                if (storage.getItem('loginStatus')?.timeStamp === timeStamp) {
                    clearInterval(timer)
                    getData()
                }
            }, 10)
        } else {
            getData()
        }
        return () => {
            timer && clearInterval(timer)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handlerButtonClick = () => {
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView?.postMessage('url=' + JSON.stringify(data?.button_in_app?.url))
        } else {
            if (inWeChat()) {
                window.document.getElementById(styles.wxDownloadMask).style.display = 'block'
            } else {
                window.location.href = isIOS()
                    ? 'https://itunes.apple.com/cn/app/li-cai-mo-fang/id975987023'
                    : 'market://details?id=com.licaimofang.app'
            }
        }
    }

    return (
        <>
            {data ? (
                <div className={styles.container}>
                    <div className={styles.content}>
                        <img
                            className={styles.imgStyle}
                            src={data?.detail_pic}
                            alt=""
                            onLoad={() => {
                                updateImgsLoaded(true)
                            }}
                        />
                    </div>
                    {!!(data.button_in_app || data.button_in_web) && (
                        <div className={styles.btnWrap}>
                            <div
                                className={styles.btn}
                                style={{backgroundColor: data?.button_in_app ? '#D63A3C' : '#a9363f'}}
                                onClick={handlerButtonClick}
                            >
                                {window.ReactNativeWebView ? data?.button_in_app?.text : data?.button_in_web?.text}
                            </div>
                            <div id={styles.wxDownloadMask}>
                                <div className={styles.wxDownloadGuide} />
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
            {!getInitReady && (
                <div className={styles.beforeMask}>
                    <DotLoading />
                </div>
            )}
        </>
    )
}

export default PortfolioIntroduce
