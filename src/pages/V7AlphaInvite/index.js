import React, {useEffect, useState, useMemo, useCallback} from 'react'
import http from '../../service'
import {storage, inApp} from '../../utils'
import qs from 'qs'
import {DotLoading} from 'antd-mobile'
import styles from './index.module.scss'
import {Toast} from 'antd-mobile'
import MyModal from './Modal'

const V7AlphaInvite = () => {
    const {timeStamp, type} = qs.parse(window.location.href.split('?')[1]) || {}
    const [data, setData] = useState(null)
    const [modalData, setModalData] = useState({})
    const [imgsLoaded, updateImgsLoaded] = useState(false)
    const [modalVisible, updateModalVisible] = useState(false)

    const getInitReady = useMemo(() => {
        return !!data && imgsLoaded
    }, [data, imgsLoaded])

    const getData = () => {
        type == '1' && window.ReactNativeWebView?.postMessage(`logParams=${JSON.stringify(['BIT-letterpage'])}`)
        http.get(type == '1' ? '/activity/beta_test/open_letter/20220819' : '/activity/beta_test/invitation/20220819')
            .then((res) => {
                if (res.code === '000000') {
                    setData(res.result)
                    // document.title = res.result.name
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
            timer = setInterval(() => {
                if (storage.getItem('loginStatus')?.timeStamp === timeStamp) {
                    clearInterval(timer)
                    getData()
                }
            }, 10)
        } else {
            getData()
        }
        // window.ReactNativeWebView?.postMessage(`logParams=${JSON.stringify(['818page'])}`)
        return () => {
            timer && clearInterval(timer)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handlerClick1 = useCallback(() => {
        let toast = null
        if (getInitReady) {
            toast = Toast.show({
                icon: 'loading',
                content: '加载中',
                maskClickable: false,
            })
        }
        window.ReactNativeWebView?.postMessage(`logParams=${JSON.stringify(['BIT-enrollbutton'])}`)
        http.post('/activity/beta_test/signup/20220819').then((res) => {
            toast?.close()
            if (res.code === '000000') {
                setModalData(res.result)
                updateModalVisible(true)
            }
        })
    }, [getInitReady])

    const handlerClick2 = useCallback(() => {
        let toast = null
        if (getInitReady) {
            toast = Toast.show({
                icon: 'loading',
                content: '加载中',
                maskClickable: false,
            })
        }
        window.ReactNativeWebView?.postMessage(`logParams=${JSON.stringify(['sevenyearsbutton'])}`)
        http.post('/activity/beta_test/receive/20220819').then((res) => {
            toast?.close()
            if (res.code === '000000') {
                setModalData(res.result)
                updateModalVisible(true)
            }
        })
    }, [getInitReady])

    const handlerClick3 = useCallback(() => {
        window.ReactNativeWebView?.postMessage(`logParams=${JSON.stringify(['BIT-invitebutton'])}`)
        window.ReactNativeWebView?.postMessage('url=' + JSON.stringify(data?.button?.url))
    }, [data])

    return (
        <>
            {data ? (
                <div className={styles.container}>
                    {type == '1' ? (
                        <div style={{position: 'relative'}}>
                            <img
                                src={data?.letter_pic}
                                alt=""
                                className={styles.imgStyle}
                                onLoad={() => {
                                    updateImgsLoaded(true)
                                }}
                            />
                            {data?.sign_up_btn && (
                                <Button
                                    bottom={'7rem'}
                                    disabled={data?.sign_up_btn.avail === 0}
                                    title={data?.sign_up_btn?.text}
                                    onClick={handlerClick1}
                                />
                            )}
                            {data?.gift_btn && (
                                <Button
                                    bottom={'1.9rem'}
                                    disabled={data?.gift_btn.avail === 0}
                                    title={data?.gift_btn?.text}
                                    onClick={handlerClick2}
                                />
                            )}
                        </div>
                    ) : (
                        <div style={{position: 'relative'}}>
                            <img
                                src={data?.background}
                                alt=""
                                className={styles.imgStyle}
                                onLoad={() => {
                                    updateImgsLoaded(true)
                                }}
                            />
                            {data?.button && (
                                <Button
                                    bottom={'2.2rem'}
                                    disabled={data?.button.avail === 0}
                                    title={data?.button?.text}
                                    onClick={handlerClick3}
                                />
                            )}
                        </div>
                    )}
                </div>
            ) : null}
            {!getInitReady && (
                <div className={styles.beforeMask}>
                    <DotLoading />
                </div>
            )}
            <MyModal
                visible={modalVisible}
                onClose={() => {
                    updateModalVisible(false)
                }}
            >
                <div className={styles.modalContent}>
                    <div style={{height: !!modalData?.icon ? '1rem' : '0.2rem'}}></div>
                    {!!modalData?.icon && <img src={modalData?.icon} className={styles.modalIcon} alt="" />}
                    {!!modalData?.title && <div className={styles.modalTitle}>{modalData?.title}</div>}
                    {!!modalData?.content && <div className={styles.modalDesc}>{modalData?.content}</div>}
                    {modalData?.button && (
                        <Button
                            disabled={modalData?.button.avail === 0}
                            title={modalData?.button.text}
                            bottom="0.6rem"
                            onClick={() => {
                                updateModalVisible(false)
                                getData()
                            }}
                        />
                    )}
                    <div style={{height: modalData?.button ? '1.8rem' : '0.8rem'}}></div>
                </div>
            </MyModal>
        </>
    )
}

export default V7AlphaInvite

const Button = ({bottom = '', title = '', disabled = false, onClick = () => {}}) => {
    return title ? (
        <div
            className={styles.buttonWrap}
            style={{bottom, opacity: disabled ? 0.3 : 1}}
            onClick={disabled ? () => {} : onClick}
        >
            {title}
        </div>
    ) : null
}
