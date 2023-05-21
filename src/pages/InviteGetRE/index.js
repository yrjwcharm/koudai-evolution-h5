import React, {useEffect, useState} from 'react'
import qs from 'qs'
import './index.css'
import {getConfig, share} from '../../utils/WXUtils'
import http from '../../service'

const InviteGetRe = () => {
    const params = qs.parse(window.location.search.split('?')[1] || '')
    const [data, setData] = useState({})

    const getData = () => {
        http.get('/activity/info/20220124?channel=gfhb_2022').then((res) => {
            setData(res.result)
        })
    }

    const handlerInvite = () => {
        window.LogTool(data.stat_info.curl_name, data.stat_info.curl_id)
        window.ReactNativeWebView.postMessage(`shareLink=${JSON.stringify(data.share_info)}`)
    }

    useEffect(() => {
        if (typeof params.title === 'string') document.title = decodeURIComponent(params.title)
        if (params.uid) {
            getData()
            getConfig(() => {
                http.get('/share/common/info/20210101', {scene: 'inviteGetRe', uid: params.uid}, false).then((res) => {
                    if (res.code === '000000') {
                        share({
                            title: res.result.share_info.title,
                            content: res.result.share_info.content,
                            url: res.result.share_info.link,
                            img: res.result.share_info.avatar,
                        })
                    }
                })
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="invite-get-re">
            {data?.images?.slice(0, 3).map((imgUrl, idx) => {
                return (
                    <div className="bgImgWrap" key={idx}>
                        <img alt="" src={imgUrl} className="bgImg" />
                        {window.ReactNativeWebView && idx === 0 && (
                            <img alt="" src={data?.images?.[3]} className="btnImg" onClick={handlerInvite} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default InviteGetRe
