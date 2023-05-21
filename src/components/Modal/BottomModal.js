/*
 * @Date: 2022-12-12 11:31:40
 * @Description: 底部弹窗
 */
import React, {forwardRef, useImperativeHandle, useState} from 'react'
import {Popup, SafeArea} from 'antd-mobile'
import {CloseOutline} from 'antd-mobile-icons'
import styles from './index.module.scss'

const BottomModal = forwardRef((props, ref) => {
    const {
        bodyClassName,
        children = '',
        confirmText = '',
        header,
        headerClassName = '',
        onDone,
        showClose = true,
        beforeHide = () => {},
        subTitle = '',
        title = '提示',
        ...restProps
    } = props
    const [visible, setVisible] = useState()

    const show = () => setVisible(true)

    const hide = () => {
        beforeHide()
        setVisible(false)
    }

    useImperativeHandle(ref, () => ({
        show,
        hide,
    }))

    return (
        <Popup
            bodyClassName={`${styles.container} ${bodyClassName}`}
            onMaskClick={hide}
            {...restProps}
            getContainer={null}
            stopPropagation={['click', 'scroll']}
            visible={visible}
        >
            {header || (
                <div className={`flexCenter hairline hairline--bottom ${styles.header} ${headerClassName}`}>
                    {showClose && (
                        <div className={`flexCenter ${styles.close}`} onClick={hide}>
                            <CloseOutline color="#545968" fontSize={18} />
                        </div>
                    )}
                    <div className={styles.title}>
                        {title}
                        {subTitle ? <div className={styles.subTitle}>{subTitle}</div> : null}
                    </div>
                    {confirmText ? (
                        <div
                            className={styles.confirm}
                            onClick={() => {
                                hide()
                                onDone?.()
                            }}
                        >
                            {confirmText}
                        </div>
                    ) : null}
                </div>
            )}
            {children}
            <SafeArea position="bottom" />
        </Popup>
    )
})

export default BottomModal
