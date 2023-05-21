/*
 * @Date: 2021-06-07 13:43:22
 * @Author: yhc
 * @LastEditors: dx
 * @LastEditTime: 2021-07-30 14:35:28
 * @Description: 文章卡片
 */
import React from 'react'
import styles from './index.module.css'
import {useHistory} from 'react-router-dom'
import zan_img from '../../image/icon/zan.png'
export default function ArticleCard({data, style}) {
    const history = useHistory()
    return (
        <div
            className={[styles.card]}
            onClick={() => {
                history.push(`/article/${data.id}`)
            }}
        >
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div className={styles.article_detial}>{data.title}</div>
                {data?.cover ? <img src={data.cover} className={styles.article_cover} alt="" /> : null}
            </div>
            <div
                className={styles.article_title}
                style={{
                    color: '#9AA1B2',
                    display: 'flex',
                    justifyContent: 'space-between',
                    height: 'auto',
                    marginTop: '6px',
                }}
            >
                <span> {data.view_num}人已阅读</span>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <img className={styles.zan_img} src={zan_img} alt="" />
                    <span style={{color: '#545968'}}>{data?.favor_num}</span>
                </div>
            </div>
        </div>
    )
}
