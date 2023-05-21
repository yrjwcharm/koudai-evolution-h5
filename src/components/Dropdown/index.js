/*
 * @Date: 2022-08-08 14:46:21
 * @Description: 下拉菜单
 */
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import {DownOutline, UpOutline} from 'antd-mobile-icons'
import styles from './index.module.scss'

const el = document.createElement('div')
const Overlay = ({
    actions,
    activeKey,
    getContainer,
    hide,
    onAction,
    overlayClassName,
    overlayRef,
    overlayStyle,
    visible,
}) => {
    useEffect(() => {
        if (getContainer?.()) {
            return () => {}
        }
        document.body.appendChild(el)
        return () => {
            document.body.removeChild(el)
        }
    }, [getContainer])

    return createPortal(
        <>
            <div
                className={styles.mask}
                onClick={hide}
                onTouchStart={hide}
                style={{display: visible ? 'block' : 'none'}}
            />
            <div className={`${styles.overlayContainer} ${overlayClassName}`} ref={overlayRef} style={overlayStyle}>
                {actions?.map?.((item, index) => {
                    const {key, text} = item
                    return (
                        <div
                            className={`hairline hairline--top ${styles.menuItem} ${
                                activeKey === key ? styles.active : ''
                            }`}
                            key={key}
                            onClick={() => {
                                onAction?.(key)
                                hide?.()
                            }}
                        >
                            {text}
                        </div>
                    )
                })}
            </div>
        </>,
        getContainer?.() || el,
    )
}

const Index = forwardRef(
    (
        {
            actions = [],
            activeKey,
            children,
            defaultVisible = false,
            getContainer,
            onAction,
            overlayClassName = '',
            overlayStyle = {},
        },
        ref,
    ) => {
        const [visible, setVisible] = useState(defaultVisible)
        const container = useRef()
        const overlay = useRef()

        const show = () => {
            overlay.current.style.display = 'block'
            setVisible(true)
        }

        const hide = () => {
            overlay.current.style.display = 'none'
            setVisible(false)
        }

        const getElementPos = () => {
            // let actualTop = container.current.offsetTop;
            // let actualLeft = container.current.offsetLeft;
            // let current = container.current.offsetParent;

            // while (current) {
            //   actualTop += current.offsetTop;
            //   actualLeft += current.offsetLeft;
            //   current = current.offsetParent;
            // }
            // console.log(actualTop, actualLeft);
            const {x, y} = container.current.getBoundingClientRect()
            show()
            const deltaWidth = container.current.clientWidth - overlay.current.clientWidth
            overlay.current.style.top = `${y + container.current.clientHeight + 4}px`
            overlay.current.style.left = `${x + deltaWidth / 2}px`
        }

        useImperativeHandle(ref, () => ({
            show,
            hide,
        }))

        return (
            <>
                <div
                    className="defaultFlex"
                    onClick={() => {
                        getElementPos()
                    }}
                    ref={container}
                >
                    {children}
                    {actions?.length > 0 && (
                        <>
                            {visible ? (
                                <UpOutline color="#121D3A" fontSize={8} style={{marginLeft: '.08rem'}} />
                            ) : (
                                <DownOutline color="#121D3A" fontSize={8} style={{marginLeft: '.08rem'}} />
                            )}
                        </>
                    )}
                </div>
                {actions?.length > 0 && (
                    <Overlay
                        actions={actions}
                        activeKey={activeKey}
                        getContainer={getContainer}
                        hide={hide}
                        onAction={onAction}
                        overlayClassName={overlayClassName}
                        overlayRef={overlay}
                        overlayStyle={overlayStyle}
                        visible={visible}
                    />
                )}
            </>
        )
    },
)

export default Index
