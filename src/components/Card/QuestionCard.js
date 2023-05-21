/*
 * @Date: 2021-06-07 13:43:04
 * @Author: yhc
 * @LastEditors: yhc
 * @LastEditTime: 2021-06-07 19:33:37
 * @Description:
 */
import React from 'react'
import styles from './index.module.css'
import ques_img from '../../image/icon/question.png'
import {useHistory} from 'react-router-dom'
import questionBg from '../../image/bg/questionBg.png'
export default function QuestionCard({data}) {
    const history = useHistory()
    return (
        <div
            className={styles.card}
            style={{position: 'relative'}}
            onClick={() => {
                history.push(`/article/${data.id}`)
            }}
        >
            <img src={questionBg} alt="" className={styles.questionBg} />
            <div className={styles.ques_cate}>
                {data.phase}：<span className={styles.ques_name}>{data.nickname}</span>
            </div>
            <div style={{display: 'flex'}}>
                <img src={ques_img} className={styles.ques_img} alt="" />
                <div className={styles.ques_title}>{data.title}</div>
            </div>
            <div className={styles.ques_bottom}>
                <span style={{color: '#121D3A', fontWeight: '700'}}>
                    魔方回答：
                    <span style={{color: '#545968', fontWeight: '400'}}>{data.content}</span>
                </span>
            </div>
        </div>
    )
}
