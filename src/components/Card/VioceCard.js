/*
 * @Date: 2021-06-07 13:43:46
 * @Author: yhc
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-30 11:45:54
 * @Description:
 */
import React from 'react'
import styles from './index.module.css'
import zan_img from '../../image/icon/zan.png'
import playIcon from '../../image/icon/playIcon.png'
import {useHistory} from 'react-router-dom'
export default function VioceCard({data}) {
    const history = useHistory()
    return (
        <div
            className={styles.card}
            onClick={() => {
                history.push(`/article/${data.id}`)
            }}
        >
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div style={{flex: 1}}>
                    <div className={styles.ques_cate}>{data.album_name}</div>
                    <div className={styles.article_title}>{data.title}</div>
                    {data.author && (
                        <div className={styles.avatar_con}>
                            <img className={styles.avatar} src={data.author?.avatar} alt="" />
                            <span className={styles.light_black}>{data.author?.nickname}</span>
                            {data.author?.icon ? <img className={styles.vip} src={data.author?.icon} alt="" /> : null}
                        </div>
                    )}
                </div>
                {data.cover ? (
                    <div style={{position: 'relative'}}>
                        <div className={styles.media_cover}>
                            <img src={playIcon} alt="" className={styles.playIcon} />
                            {data.media_duration}
                        </div>
                        <img className={styles.vision_cover} src={data.cover} alt="" />
                    </div>
                ) : null}
            </div>
            <div
                className={styles.article_title}
                style={{
                    color: '#9AA1B2',
                    display: 'flex',
                    justifyContent: 'space-between',
                    height: 'auto',
                    marginTop: '8px',
                }}
            >
                <span> {data.view_num}人已收听</span>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <img className={styles.zan_img} src={zan_img} alt="" />
                    <span style={{color: '#545968'}}>{data.favor_num}</span>
                </div>
            </div>
        </div>
    )
}
