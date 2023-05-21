/*
 * @Date: 2021-01-14 17:08:04
 * @Author: dx
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-20 15:22:38
 * @Description: 密码管理输入框
 */
import {Input as AntdInput} from 'antd-mobile'
import classNames from 'classnames'
import React from 'react'
import {Colors} from '~/common/commonStyle'
import {px} from '~/utils'
import styles from './index.module.scss'

const Input = (props) => {
    const {children} = props
    const leftProps = {...props}
    delete leftProps.children
    delete leftProps.onClick
    const onClick = () => {
        props.onClick && props.onClick()
    }
    return (
        <div onClick={onClick} className={classNames([styles.flexRow, styles.login_input_tel, props.style])}>
            <div className={classNames([styles.flexBetween, styles.textContainer])}>
                <div className={styles.inputLeftText}>{props.title}</div>
                <div style={{color: Colors.lightGrayColor}}>|</div>
            </div>
            {props.editable === false ? (
                <div onClick={onClick} className={classNames([styles.flexRow, styles.selectBox])}>
                    <div className={styles.inputText} style={{color: props.value ? Colors.defaultColor : '#bbb'}}>
                        {props.value || props.placeholder}
                    </div>
                </div>
            ) : (
                <AntdInput
                    {...leftProps}
                    className={styles.input}
                    style={{'--placeholder-color': '#bdc2cc', '--font-size': props.placeholderTextSize || px(14)}}
                />
            )}
            {children}
        </div>
    )
}

export default Input
