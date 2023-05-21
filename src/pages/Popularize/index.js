/*
 * @Description:
 * @Autor: wxp
 * @Date: 2022-11-30 15:07:28
 */
import React, {useRef, useState} from 'react'
import QueryString from 'qs'
import {useEffect} from 'react'
import {inApp, jump, px, storage} from '../../utils'
import styles from './index.module.scss'
import http from '~/service'
import {Toast} from 'antd-mobile'
import quotes from '~/image/icon/quotes.png'
import {share} from '~/utils/share'
import {getConfig} from '~/utils/getConfig'

const Popularize = () => {
    const params = QueryString.parse(window.location.href.split('?')[1]) || {}
    const [data, setData] = useState(null)

    const getData = () => {
        http.get('/product/theme/info/20221130', params).then((res) => {
            if (res.code === '000000') {
                setData(res.result)
            } else {
                Toast.show(res.message)
            }
        })
    }

    const init = () => {
        let timer
        if (inApp) {
            const {timeStamp} = QueryString.parse(window.location.href.split('?')[1]) || {}
            timer = setInterval(() => {
                if (storage.getItem('loginStatus')?.timeStamp === timeStamp) {
                    clearInterval(timer)
                    getData()
                }
            }, 10)
        } else {
            getData()
            getConfig(configShare)
        }
        return () => {
            timer && clearInterval(timer)
        }
    }

    const configShare = () => {
        http.get(
            '/share/common/info/20210101',
            {
                name: 'Popularize',
                params: JSON.stringify({
                    link: window.location.origin + window.location.pathname,
                    params,
                }),
            },
            false,
        ).then((res) => {
            if (res.code === '000000') {
                share({
                    title: res.result.share_info.title,
                    content: res.result.share_info.content,
                    url: res.result.share_info.link,
                    img: res.result.share_info.avatar,
                })
            }
        })
    }

    useEffect(() => {
        init()
        window.document.addEventListener('reload', getData)
        return () => {
            window.document.removeEventListener('reload', getData)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return data ? (
        <div className={styles.container}>
            <div className={styles.wrap}>
                <img alt="" src={data.bg_img} className={styles.topBg} />
                <div
                    className={styles.cardsWrap}
                    onClick={() => {
                        jump(data.product_info?.top_button?.url)
                    }}
                >
                    <div className={styles.cardWrap}>
                        <div className={styles.cardHeader}>
                            {data.product_info?.top_button ? (
                                <div
                                    className={styles.detailBtnWrap}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        jump(data.product_info?.top_button.url)
                                    }}
                                >
                                    <span className={styles.detailBtnText}>{data.product_info?.top_button.text}</span>
                                    <img
                                        alt=""
                                        src="https://static.licaimofang.com/wp-content/uploads/2022/11/right-icon.png"
                                        className={styles.detailBtnIcon}
                                    />
                                </div>
                            ) : null}
                        </div>
                        <div className={styles.cardTitle}>{data.product_info?.product_name}</div>
                        {data.product_info?.tags ? (
                            <div className={styles.tagsWrap}>
                                {data.product_info?.tags?.map((tag, idx) => (
                                    <div className={styles.tagWrap} style={{marginLeft: idx > 0 ? px(6) : 0}} key={idx}>
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        ) : null}
                        {data.product_info?.yield_info ? (
                            <div className={styles.rateWrap}>
                                {data.product_info?.yield_info?.map((item, idx) => (
                                    <div
                                        className={styles.rateItem}
                                        key={idx}
                                        style={{marginLeft: idx > 0 ? px(87) : 0}}
                                    >
                                        <div className={styles.rateNum} style={{color: item.color}}>
                                            {item.ratio}
                                        </div>
                                        <div className={styles.rateLabel}>{item.title}</div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                        {data.product_info?.product_desc ? (
                            <div className={styles.contentWrap}>
                                <img src={quotes} alt="" className={styles.contentIcon} />
                                <div className={styles.contentText}>{data.product_info?.product_desc}</div>
                            </div>
                        ) : null}
                        {data.product_info?.button ? (
                            <div
                                className={styles.btnWrap}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    jump(data.product_info?.button?.url)
                                }}
                            >
                                {data.product_info?.button.text}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    ) : null
}
export default Popularize
