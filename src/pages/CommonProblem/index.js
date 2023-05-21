/*
 * @Description:
 * @Autor: wxp
 * @Date: 2022-12-14 10:21:49
 */
import React, {useEffect, useState} from 'react'
import qs from 'querystring'
import http from '~/service'
import {Collapse, Image} from 'antd-mobile'
import styles from './index.module.scss'
import questionIcon from '~/image/icon/questionIcon.png'

const CommonProblem = () => {
    const params = qs.parse(window.location.search.split('?')[1])
    const [data, setData] = useState({})

    useEffect(() => {
        document.title = '常见问题'
        http.get('/portfolio/qa/20210101', {
            upid: params?.upid,
            poid: params?.poid,
        }).then((res) => {
            if (res.code === '000000') {
                setData(res.result)
            }
        })
    }, [])

    return (
        Object.keys(data || {}).length > 0 && (
            <div className={styles.container}>
                <Collapse style={{'--adm-color-background': 'transparent'}} defaultActiveKey={['0']}>
                    {data.rows?.map((section, index) => (
                        <Collapse.Panel
                            key={index}
                            title={
                                <div style={{flex: 1, maxWidth: '90%', display: 'flex', alignItems: 'flex-start'}}>
                                    <Image src={questionIcon} className={styles.icon_ques} />
                                    <div className={styles.headerText}>{section.question}</div>
                                </div>
                            }
                        >
                            <div className={styles.content}>
                                <div className={styles.content_text}> {section.answer}</div>
                            </div>
                        </Collapse.Panel>
                    ))}
                </Collapse>
            </div>
        )
    )
}

export default CommonProblem
