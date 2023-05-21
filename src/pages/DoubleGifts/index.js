import React, {useEffect, useState} from 'react'
import qs from 'qs'
import './index.css'
import {getConfig, share} from '../../utils/WXUtils'
import http from '../../service'

const DoubleGifts = () => {
    const params = qs.parse(window.location.search.split('?')[1] || '')
    const [data, setData] = useState({})

    const getData = () => {
        http.get('/activity/info/20220124', params).then((res) => {
            setData(res.result)
        })
    }

    useEffect(() => {
        if (typeof params.title === 'string') document.title = decodeURIComponent(params.title)

        console.log(document.title)
        if (params.uid) {
            getData()
            getConfig(() => {
                http.get('/share/common/info/20210101', {scene: 'doubleGifts', uid: params.uid}, false).then((res) => {
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
        <div className="double-gifts">
            {data?.images?.map?.((imgUrl, idx) => {
                return (
                    <div className="bgImgWrap" key={idx}>
                        <img alt="" src={imgUrl} className="bgImg" />
                    </div>
                )
            })}
        </div>
    )
}

export default DoubleGifts
