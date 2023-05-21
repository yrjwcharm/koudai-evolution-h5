/*
 * @Date: 2021-09-15 19:19:56
 * @Author: yhc
 * @LastEditors: dx
 * @LastEditTime: 2022-01-12 12:02:35
 * @Description:协议
 */
import React, {useState, useEffect} from 'react'
import http from '../../service'
import {isIOS} from '../../utils'
import './index.css'
function NewAgreement({match}) {
    const [data, setData] = useState()
    useEffect(() => {
        http.get('/protocol/view/detail/20220106', {id: match.params?.id || 1}).then((res) => {
            setData(res.result)
            document.title = res.result.title
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <div className={`userInfoDeleteCon${isIOS() ? ' ios' : ''}`}>
            <div dangerouslySetInnerHTML={{__html: data?.content}} />
        </div>
    )
}

export default NewAgreement
