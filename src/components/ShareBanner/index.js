/*
 * @Date: 2022-11-24 17:29:06
 * @LastEditors: lizhengfeng lizhengfeng@licaimofang.com
 * @LastEditTime: 2022-11-24 17:58:57
 * @FilePath: /koudai_evolution_h5/src/components/ShareBanner/index.js
 * @Description: 分享页面中顶部的banner 高度 1.28rem
 */
import React from 'react'
import {jump} from '../../utils'
import styles from './index.module.scss'

export default function ShareBanner(props) {
    const {img, button} = props.data || {}
    const handleClick = () => {
        jump(button?.url)
    }
    return (
        <div className={styles.topFixedBox}>
            <div className={styles.wrap}>
                <img src={img} alt="" />
                <button className={styles.downloadBtn} onClick={handleClick}>
                    {button?.text}
                </button>
            </div>
        </div>
    )
}
