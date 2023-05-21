import React from 'react'
import styles from './Notice.module.scss'

export default function Notice(content) {
    return (
        <div className={styles.notice}>
            <span className={styles.notice_text}>{content}</span>
        </div>
    )
}
