import React, {useEffect, useState, useRef} from 'react'
import './index.css'
import http from '../../service'
import {Toast} from 'antd-mobile-v2'
import LoadingBg from '../../image/bg/loadingBg.png'
import {debounce} from '../../utils'
// import LogTool from '../../utils/LogTool';
import {getConfig, share} from '../../utils/WXUtils'
// import { storage } from '../../utils';
// import qs from 'qs';
let log = false

const KnowLCMF = () => {
    const [data, setData] = useState({})
    const [loading, setLoading] = useState(false)
    const srcollRef = useRef(null)

    const configShare = () => {
        http.get('/share/common/info/20210101', {scene: 'know_lcmf'}, false).then((res) => {
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
        http.get('/home/company/detail/20210101').then((res) => {
            setLoading(false)
            if (res.code === '000000') {
                setData(res.result)
            } else {
                Toast.fail(res.message)
            }
        })
        if (!window.ReactNativeWebView) {
            getConfig(configShare)
        }
    }, [])

    useEffect(() => {
        srcollRef.current.addEventListener(
            'scroll',
            debounce((e) => {
                const {clientHeight, scrollHeight, scrollTop} = e.target
                if (scrollTop + clientHeight + 50 > scrollHeight && !log) {
                    log = true
                    window.LogTool('LCMFknow_lcmf')
                }
            }, 10),
        )
    }, [])

    return (
        <div className="knowLCMFContainer" ref={srcollRef}>
            {loading ? (
                <img className="loadingBg" src={LoadingBg} alt="" />
            ) : (
                <>
                    {data?.image_list?.map((item, index) => {
                        return <img key={item + index} src={item} alt="" />
                    })}
                    {window.ReactNativeWebView &&
                        data?.account_list?.map((item, index) => {
                            return (
                                <img
                                    key={item + index}
                                    src={item.image}
                                    onClick={() => window.ReactNativeWebView.postMessage(JSON.stringify(item.url))}
                                    alt=""
                                />
                            )
                        })}
                </>
            )}
        </div>
    )
}

export default KnowLCMF
