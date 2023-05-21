/*
 * @Date: 2021-09-02 10:15:06
 * @Author: dx
 * @LastEditors: yhc
 * @LastEditTime: 2021-09-15 15:25:04
 * @Description: 功能介绍
 */
import {useEffect, useState} from 'react'
import {useHistory} from 'react-router'
import {Icon} from 'antd-mobile-v2'
import './index.css'
import http from '../../service'

const Features = () => {
    document.title = '功能介绍'
    const history = useHistory()
    const [list, setList] = useState([])
    useEffect(() => {
        http.get('/mapi/func/intro/20210906').then((res) => {
            if (res.code === '000000') {
                document.title = res.result.title
                setList(res.result.list)
            }
        })
    }, [])

    return (
        <div className="featuresContainer">
            {list?.map?.((item, index) => {
                return (
                    <div
                        className="flexBetween featureBox"
                        key={item + index}
                        onClick={() => {
                            if (!item?.id) return
                            if (window.ReactNativeWebView) {
                                const url = {
                                    type: 1,
                                    path: 'ArticleDetail',
                                    params: {article_id: item.id},
                                }
                                window.ReactNativeWebView.postMessage(`url=${JSON.stringify(url)}`)
                            } else {
                                history.push(`/article/${item.id}`)
                            }
                        }}
                    >
                        <div>
                            <div className="version">{item.title}</div>
                            <div className="content">{item.desc}</div>
                            <div className="date">{item.date}</div>
                        </div>
                        {item.id !== undefined && <Icon color="#9aA1B2" size="sm" type="right" className="arrow" />}
                    </div>
                )
            })}
        </div>
    )
}

export default Features
