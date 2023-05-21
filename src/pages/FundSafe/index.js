/*
 * @Date: 2021-03-19 15:53:01
 * @Description: 资金安全
 */
import React, {useEffect, useState, useRef} from 'react'
import './index.css'
import http from '../../service'
import {Toast} from 'antd-mobile-v2'
import {debounce} from '../../utils'
let log = false
const FundSafe = () => {
    const [data, setData] = useState({})
    const srcollRef = useRef(null)
    useEffect(() => {
        http.get('/portfolio/asset_safe/20210101').then((res) => {
            if (res.code === '000000') {
                setData(res.result)
            } else {
                Toast.fail(res.message)
            }
        })
    }, [])
    useEffect(() => {
        srcollRef.current.addEventListener(
            'scroll',
            debounce((e) => {
                const {clientHeight, scrollHeight, scrollTop} = e.target
                if (scrollTop + clientHeight + 50 > scrollHeight && !log) {
                    log = true
                    window.LogTool('LCMFfund_safe')
                }
            }, 10),
        )
    }, [])
    return (
        <div className="fundSafeContainer" ref={srcollRef}>
            {data?.image_list?.map((item, index) => {
                return (
                    <a href={item.url || ''} key={index} style={item.url ? {} : {pointerEvents: 'none'}}>
                        <img src={item.src || item} alt="" />
                    </a>
                )
            })}
        </div>
    )
}

export default FundSafe
