/*
 * @Author: dx
 * @Date: 2021-01-18 15:10:15
 * @LastEditTime: 2022-12-22 16:12:17
 * @LastEditors: lzf
 * @Description: 底部背书
 * @FilePath: /koudai_evolution_app/src/components/BottomDesc.js
 */
import React, {useCallback, useEffect, useRef, useState} from 'react'
import PropTypes from 'prop-types'
import {useRouteMatch} from 'react-router'
import classNames from 'classnames'
import {Image} from 'antd-mobile'
import {jump, px} from '~/utils'
import bottomDescLeft from '~/image/icon/bottomDescLeft.png'
import bottomDescRight from '~/image/icon/bottomDescRight.png'
import styles from './index.module.scss'
import http from '~/service'
import qs from 'querystring'

const BottomDesc = (props) => {
    const isUnmounted = useRef(false)
    const route = useRouteMatch()
    const [data, setData] = useState(null)
    const {style} = props

    useEffect(() => {
        const name = route.path.split('/')[1]
        const params = qs.parse(window.location.search.split('?')[1] || '')
        http.get('/mapi/app/footer/20220518', {
            name,
            params: JSON.stringify({...route.params, ...params}),
        }).then((res) => {
            if (res.code === '000000') {
                if (!isUnmounted.current) {
                    setData(res.result)
                }
            }
        })
    }, [route])
    /**
     * 已封装hooks utils/useIsMounted.js
     * 使用此方案解决控制台  Warning: Can't perform a React state update on an unmounted component.
     * This is a no-op, butit indicates a memory leak in your application.
     * To fix, cancel all subscriptions and asynchronous tasks
     */
    useEffect(() => {
        return () => {
            isUnmounted.current = true
        }
    }, [])
    return (
        <div
            className={classNames([
                styles.con,
                ...(Object.prototype.toString.call(style) === '[object Object]' ? [style] : style),
            ])}
        >
            <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'}}>
                {props?.fix_img ? (
                    Array.isArray(props.fix_img) ? (
                        props.fix_img.map((item, idx) => (
                            <Image
                                key={idx}
                                src={item}
                                style={{
                                    height: px(30),
                                    // minWidth: '50%',
                                    maxWidth: '50%',
                                    marginBottom: px(8),
                                    objectFit: 'contain',
                                }}
                            />
                        ))
                    ) : (
                        <Image
                            src={props.fix_img}
                            style={{
                                height: px(30),
                                minWidth: '50%',
                                maxWidth: '100%',
                                marginBottom: px(8),
                                objectFit: 'contain',
                            }}
                        />
                    )
                ) : null}
            </div>
            {data?.img && (
                <div className={styles.item}>
                    <Image src={data?.img} className={styles.img} />
                </div>
            )}
            {data?.img_list?.map?.((img, i, arr) => (
                <div key={img + i} className={styles.item}>
                    <Image
                        src={img}
                        className={styles.img}
                        style={{marginBottom: i === arr.length - 1 ? px(12) : px(8), objectFit: 'contain'}}
                    />
                </div>
            ))}
            {data?.sale_service ? (
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative'}}>
                    <Image
                        src={bottomDescLeft}
                        style={{
                            position: 'absolute',
                            left: px(10),
                            height: px(10),
                            width: px(70),
                            top: px(4),
                            objectFit: 'contain',
                        }}
                    />
                    <div className={styles.text} style={{textAlign: 'center', position: 'relative'}}>
                        {data?.sale_service}
                    </div>
                    <Image
                        src={bottomDescRight}
                        style={{position: 'absolute', right: px(10), height: px(10), width: px(70), top: px(4)}}
                    />
                </div>
            ) : null}
            <div className={styles.item}>
                <div className={styles.text}>{data?.sale_credential?.text}</div>
                {data?.sale_credential?.url ? (
                    <div
                        className={styles.button}
                        onClick={() => {
                            jump(data?.sale_credential?.url)
                        }}
                    >
                        {data?.sale_credential?.tip}
                    </div>
                ) : null}
            </div>
            <div className={styles.item}>
                <div className={styles.text} style={{color: '#B8C1D3', marginTop: px(8)}}>
                    {data?.reminder}
                </div>
            </div>
        </div>
    )
}

BottomDesc.propTypes = {
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),
}
BottomDesc.defaultProps = {
    style: {},
}

export default BottomDesc
