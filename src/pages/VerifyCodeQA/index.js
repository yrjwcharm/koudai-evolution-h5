/*
 * @Date: 2022-12-20 20:25:51
 * @Description: 收不到验证码
 */
import React, {useEffect, useState} from 'react'
import {Toast} from 'antd-mobile'
import http from '~/service'
import styles from './index.module.scss'
import Loading from '~/components/Loading'

const VerifyCodeQA = () => {
    const [data, setData] = useState({})
    const {contents, title} = data

    useEffect(() => {
        http.get('/auth/user/verify_code/help/20220412').then((res) => {
            if (res.code === '000000') {
                document.title = res.result.title
                setData(res.result)
            } else {
                Toast.show(res.message || '网络繁忙')
            }
        })
    }, [])

    return (
        <div className={styles.container}>
            {Object.keys(data).length > 0 ? (
                <>
                    <div className={styles.title}>{title}</div>
                    <div className={styles.list}>
                        {contents?.map?.((item, index) => {
                            const {content, icon} = item
                            return (
                                <div className={styles.item} key={content + index}>
                                    <img className={styles.icon} src={icon} alt="" />
                                    <div className={styles.content} dangerouslySetInnerHTML={{__html: content}} />
                                </div>
                            )
                        })}
                    </div>
                </>
            ) : (
                <Loading />
            )}
        </div>
    )
}

export default VerifyCodeQA
