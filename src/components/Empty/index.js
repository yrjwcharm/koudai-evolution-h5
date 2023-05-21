/*
 * @Description:
 * @Autor: wxp
 * @Date: 2022-10-11 14:59:27
 */
import React from 'react'
import emptyIcon from '~/image/empty-icon.png'
import styles from './index.module.scss'
const Empty = ({text, children, wrapStyle = {}}) => {
    return (
        <div className={styles.emptyWrap} style={wrapStyle}>
            <img src={emptyIcon} alt="空" className={styles.emptyIcon} />
            {children ? children : <div className={styles.emptyText}>{text}</div>}
        </div>
    )
}
export default Empty
