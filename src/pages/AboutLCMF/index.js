/*
 * @Date: 2021-03-19 15:53:01
 * @Author: dx
 * @LastEditors: yhc
 * @LastEditTime: 2021-08-26 11:05:24
 * @Description: 关于理财魔方
 */
import React, {useCallback, useEffect, useRef, useState} from 'react'
import './index.css'
import http from '../../service'
import {Toast} from 'antd-mobile-v2'
import mediaReport from '../../image/bg/mediaReport.png'
import LoadingBg from '../../image/bg/loadingBg.png'
import {getConfig, share} from '../../utils/WXUtils'
let log = false

const AboutLCMF = ({history, match}) => {
    const [data, setData] = useState({})
    const [loading, setLoading] = useState(false)
    const [offsetHeight, setOffsetHeight] = useState({})
    const [showTopBar, setShowTopBar] = useState(false)
    const [current, setCurrent] = useState(0)
    const [topBar] = useState(['关于魔方', '团队介绍', '企业实力', '媒体报道'])
    const containerRef = useRef(null)
    const offsetTopRef = useRef({})

    const onLoad = (event, index) => {
        // console.log(event.target.offsetTop);
        setOffsetHeight((prev) => ({...prev, [index]: event.target.offsetHeight}))
    }
    const onScroll = useCallback(
        (event) => {
            let scrollTop = event.target.scrollTop
            if (scrollTop > offsetHeight[0] * 0.25) {
                setShowTopBar(true)
            } else {
                setShowTopBar(false)
            }
            if (Object.keys(offsetHeight).length === data.item_list?.length) {
                if (scrollTop >= offsetTopRef.current[3] && scrollTop < offsetTopRef.current[5]) {
                    setCurrent(1)
                } else if (
                    scrollTop >= offsetTopRef.current[5] &&
                    scrollTop < offsetTopRef.current[7] + offsetHeight[7]
                ) {
                    setCurrent(2)
                } else if (scrollTop >= offsetTopRef.current[7] + offsetHeight[7]) {
                    setCurrent(3)
                } else {
                    setCurrent(0)
                }
            }
            const {clientHeight, scrollHeight} = event.target
            if (scrollTop + clientHeight + 50 > scrollHeight && !log) {
                log = true
                window.LogTool('LCMFabout_lcmf')
            }
        },
        [data, offsetHeight],
    )
    const onClickBar = useCallback(
        (index) => {
            if (index === 0) {
                containerRef.current.scrollTo({left: 0, top: offsetHeight[0] * 0.25 + 1, behavior: 'auto'})
            } else if (index === 1) {
                containerRef.current.scrollTo({left: 0, top: offsetTopRef.current[3] + 1, behavior: 'auto'})
            } else if (index === 2) {
                containerRef.current.scrollTo({left: 0, top: offsetTopRef.current[6] + 1, behavior: 'auto'})
            } else {
                containerRef.current.scrollTo({
                    left: 0,
                    top: offsetTopRef.current[7] + offsetHeight[7] + 1,
                    behavior: 'auto',
                })
            }
        },
        [offsetHeight],
    )
    const clickArticle = (item) => {
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(item.url))
        } else {
            history.push(`/article/${item.url?.params?.article_id}`)
        }
    }
    const configShare = () => {
        http.get('/share/common/info/20210101', {scene: 'about_lcmf'}, false).then((res) => {
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
        setLoading(true)
        http.get('/home/about/info/20210101', {}, false)
            .then((res) => {
                if (res.code === '000000') {
                    setData(res.result)
                    setLoading(false)
                } else {
                    Toast.fail(res.message)
                    setLoading(false)
                }
            })
            .catch(() => {
                setLoading(false)
            })
        if (!window.ReactNativeWebView) {
            getConfig(configShare)
        }
    }, [])
    // useEffect(() => {
    //   document.body.addEventListener('scroll', onScroll, false);
    //   return () => {
    //     document.body.removeEventListener('scroll', onScroll, false);
    //   };
    // }, [onScroll]);
    useEffect(() => {
        if (Object.keys(data).length > 0) {
            if (Object.keys(offsetHeight).length === data.item_list?.length) {
                // console.log('load complate', Object.values(offsetHeight));
                Object.values(offsetHeight).forEach((item, index, arr) => {
                    arr.slice(0, index).forEach((_item) => {
                        offsetTopRef.current[index] =
                            offsetTopRef.current[index] !== undefined ? offsetTopRef.current[index] + _item : 0 + _item
                    })
                })
                // console.log(offsetTopRef.current);
                if (match.params?.pos === '0') {
                    onClickBar(1)
                } else if (match.params?.pos === '1') {
                    onClickBar(3)
                } else if (match.params?.pos === '2') {
                    containerRef.current.scrollTo({left: 0, top: offsetTopRef.current[1], behavior: 'auto'})
                }
            }
        }
    }, [data, match.params, onClickBar, offsetHeight])

    return (
        <div
            className="aboutLCMFContainer"
            ref={containerRef}
            onScroll={onScroll}
            style={{paddingTop: showTopBar ? '0.88rem' : 0}}
        >
            <div className="defaultFlex topBarBox" style={{display: showTopBar ? 'flex' : 'none'}}>
                {topBar.map((item, index) => {
                    return (
                        <div
                            className={`flexColumn${current === index ? ' active' : ''}`}
                            onClick={() => onClickBar(index)}
                            style={{flex: 1, height: '100%'}}
                            key={item + index}
                        >
                            {item}
                            {current === index && <div className="bar" />}
                        </div>
                    )
                })}
            </div>
            {loading ? (
                <img className="loadingBg" src={LoadingBg} alt="" />
            ) : (
                <>
                    {data?.item_list?.map((item, index) => {
                        return item.url ? (
                            <a key={item + index} href={item.url}>
                                <img onLoad={(e) => onLoad(e, index)} key={item + index} src={item.src} alt="" />
                            </a>
                        ) : (
                            <img onLoad={(e) => onLoad(e, index)} key={item + index} src={item.src} alt="" />
                        )
                    })}
                    <img className="titleImg" src={mediaReport} alt="" />
                    <div style={{padding: '0 0.32rem', backgroundColor: '#F5F6F8'}}>
                        {data?.article_list?.map((item, index) => {
                            return (
                                <div
                                    className="defaultFlex mediaReportBox"
                                    key={item + index}
                                    onClick={() => clickArticle(item)}
                                >
                                    <div style={{flex: 1}}>
                                        <div className="reportTitle">{item.title}</div>
                                        <div className="reportDate">
                                            {item.cate_name} {item.time}
                                        </div>
                                    </div>
                                    <img className="reportCover" src={item.cover} alt="" />
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

export default AboutLCMF
