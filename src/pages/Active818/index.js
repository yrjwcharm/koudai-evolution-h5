import React, {useEffect, useState, useMemo} from 'react'
import http from '../../service'
import {storage, countdownTool, resolveTimeStemp, inApp} from '../../utils'
import qs from 'qs'
import {DotLoading} from 'antd-mobile'
import styles from './index.module.scss'
import {Toast} from 'antd-mobile'

const Active818 = () => {
    const [data, setData] = useState(null)
    const [countdown, setCountdown] = useState([])
    const [imgsLoaded, updateImgsLoaded] = useState([
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
    ])
    const [[list1, list2], setCommentList] = useState([[], []])

    const inCountdown = useMemo(() => +countdown[0] || +countdown[1] || +countdown[2] || +countdown[3], [countdown])

    const getInitReady = useMemo(() => {
        return !!data && imgsLoaded.every((item) => item)
    }, [data, imgsLoaded])

    const getData = () => {
        http.get('/activities/feediscount/getconf/20220513?PR=PR-951')
            .then((res) => {
                if (res.code === '000000') {
                    setData(res.result)
                    // document.title = res.result.name
                    http.get('/community/article/comment/list/20210101', {article_id: res.result?.article_id}).then(
                        (res) => {
                            if (res.code === '000000') {
                                let arr = res.result.list || []
                                let half = Math.round(arr.length / 2)
                                setCommentList([arr.slice(0, half), arr.slice(half)])
                            }
                        },
                    )
                } else {
                    Toast.show(res.message)
                }
            })
            .catch((err) => {
                Toast.show('网络繁忙')
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
        window.ReactNativeWebView?.postMessage(`logParams=${JSON.stringify(['818page'])}`)
        return () => {
            timer && clearInterval(timer)
        }
    }, [])

    // 总倒计时
    useEffect(() => {
        let cancel = () => {}
        if (data?.count_down?.is_show && data?.count_down?.remaining_time) {
            cancel = countdownTool({
                timeStemp: +data.count_down.remaining_time,
                immediate: true,
                callback: (resetTime) => {
                    let c = resolveTimeStemp(+resetTime)
                    setCountdown(c)
                },
            })
        }
        return cancel
    }, [data?.count_down?.is_show, data?.count_down?.remaining_time])

    const handlerButtonClick = () => {
        window.ReactNativeWebView?.postMessage(`logParams=${JSON.stringify(['818_button'])}`)
        window.ReactNativeWebView?.postMessage('url=' + JSON.stringify(data?.btn))
    }

    const swiperStyle = useMemo(() => {
        let allWidth = list1.reduce((memo, cur) => {
            let len =
                (cur.content?.length || 0) * 14 +
                (cur.created_at?.length || 0) * 6 +
                (cur.user_info?.nickname?.length || 0) * 12 +
                17
            memo += len
            return memo
        }, 343)
        return {
            animationDuration: Math.round(allWidth / 80) + 's',
        }
    }, [list1])

    const swiper2Style = useMemo(() => {
        let allWidth = list2.reduce((memo, cur) => {
            let len =
                (cur.content?.length || 0) * 14 +
                (cur.created_at?.length || 0) * 6 +
                (cur.user_info?.nickname?.length || 0) * 12 +
                17
            memo += len
            return memo
        }, 343)
        return {
            animationDuration: Math.round(allWidth / 100) + 's',
        }
    }, [list2])

    return (
        <>
            {data ? (
                <div className={styles.container}>
                    <div className={styles.content}>
                        <img
                            className={styles.imgStyle}
                            src={data?.img_list?.[0]}
                            alt=""
                            onLoad={() => {
                                updateImgsLoaded((val) => {
                                    let arr = [...val]
                                    arr[0] = true
                                    return arr
                                })
                            }}
                        />
                        <div className={styles.cardsWrap}>
                            {data?.count_down?.is_show && data.count_down.remaining_time && inCountdown ? (
                                <div className={styles.countdownBox}>
                                    {data.text_tips && <div className={styles.countdownBoxTitle}>{data.text_tips}</div>}
                                    <div className={styles.activitiesCountdown}>
                                        <div className={styles.text}>{data.count_down.desc}</div>
                                        {countdown[0] && (
                                            <>
                                                <div className={styles.time}>{countdown[0]}</div>天
                                            </>
                                        )}
                                        <div className={styles.time}>{countdown[1]}</div>时
                                        <div className={styles.time}>{countdown[2]}</div>分
                                        <div className={styles.time}>{countdown[3]}</div>秒
                                    </div>
                                </div>
                            ) : null}
                            <img
                                className={styles.imgStyle}
                                src={data?.img_list?.[1]}
                                alt=""
                                onLoad={() => {
                                    updateImgsLoaded((val) => {
                                        let arr = [...val]
                                        arr[1] = true
                                        return arr
                                    })
                                }}
                            />
                            <img
                                className={styles.imgStyle}
                                src={data?.img_list?.[2]}
                                alt=""
                                onLoad={() => {
                                    updateImgsLoaded((val) => {
                                        let arr = [...val]
                                        arr[2] = true
                                        return arr
                                    })
                                }}
                            />
                            <img
                                className={styles.imgStyle}
                                src={data?.img_list?.[3]}
                                alt=""
                                onLoad={() => {
                                    updateImgsLoaded((val) => {
                                        let arr = [...val]
                                        arr[3] = true
                                        return arr
                                    })
                                }}
                            />
                            <img
                                className={styles.imgStyle}
                                src={data?.img_list?.[4]}
                                alt=""
                                onLoad={() => {
                                    updateImgsLoaded((val) => {
                                        let arr = [...val]
                                        arr[4] = true
                                        return arr
                                    })
                                }}
                            />
                            <img
                                className={styles.imgStyle}
                                src={data?.img_list?.[5]}
                                alt=""
                                onLoad={() => {
                                    updateImgsLoaded((val) => {
                                        let arr = [...val]
                                        arr[5] = true
                                        return arr
                                    })
                                }}
                            />
                            <img
                                className={styles.imgStyle}
                                src={data?.img_list?.[6]}
                                alt=""
                                onLoad={() => {
                                    updateImgsLoaded((val) => {
                                        let arr = [...val]
                                        arr[6] = true
                                        return arr
                                    })
                                }}
                            />
                            <img
                                className={styles.imgStyle}
                                src={data?.img_list?.[7]}
                                alt=""
                                onLoad={() => {
                                    updateImgsLoaded((val) => {
                                        let arr = [...val]
                                        arr[7] = true
                                        return arr
                                    })
                                }}
                            />
                            <img
                                className={styles.imgStyle}
                                src={data?.img_list?.[8]}
                                alt=""
                                onLoad={() => {
                                    updateImgsLoaded((val) => {
                                        let arr = [...val]
                                        arr[8] = true
                                        return arr
                                    })
                                }}
                            />
                            <div className={styles.lastImgWrap}>
                                <img
                                    className={styles.imgStyle}
                                    src={data?.img_list?.[9]}
                                    alt=""
                                    onLoad={() => {
                                        updateImgsLoaded((val) => {
                                            let arr = [...val]
                                            arr[9] = true
                                            return arr
                                        })
                                    }}
                                />
                                {data.btn_comment && (
                                    <div
                                        className={styles.lastImgBtn}
                                        onClick={(_) => {
                                            window.ReactNativeWebView?.postMessage(
                                                `logParams=${JSON.stringify(['818_messagebutton'])}`,
                                            )
                                            window.ReactNativeWebView?.postMessage(
                                                'url=' + JSON.stringify(data?.btn_comment?.url),
                                            )
                                        }}
                                    >
                                        {data.btn_comment.text}
                                    </div>
                                )}
                                {list1 && (
                                    <div className={styles.swiperWrap} style={{bottom: '2rem'}}>
                                        <div className={styles.swiper} style={swiperStyle}>
                                            <div style={{width: '7.5rem', display: 'inline-block'}}></div>
                                            {list1.map((item, idx) => (
                                                <div className={styles.swiperItem} key={idx}>
                                                    <span className={styles.name}>{item.user_info?.nickname}：</span>
                                                    <span className={styles.content}>{item.content}</span>
                                                    <span className={styles.time}>{item.created_at}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {list2 && (
                                    <div className={styles.swiperWrap} style={{bottom: '0.7rem'}}>
                                        <div className={styles.swiper} style={swiper2Style}>
                                            <div style={{width: '7.5rem', display: 'inline-block'}}></div>
                                            {list2.map((item, idx) => (
                                                <div className={styles.swiperItem} key={idx}>
                                                    <span className={styles.name}>{item.user_info?.nickname}：</span>
                                                    <span className={styles.content}>{item.content}</span>
                                                    <span className={styles.time}>{item.created_at}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className={styles.tipWrap}>{data.footer_text}</div>
                        </div>
                    </div>
                    {data.btn && (
                        <div className={styles.btnWrap}>
                            <div className={styles.btn} onClick={handlerButtonClick}>
                                立即购买
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

export default Active818
