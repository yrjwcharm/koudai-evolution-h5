/*
 * @Description:
 * @Autor: wxp
 * @Date: 2022-12-15 11:34:56
 */
import React, {useCallback, useState} from 'react'
import Icon from 'react-native-vector-icons/dist/FontAwesome'
import {jump} from '~/utils/index.js'
import {Dialog} from 'antd-mobile'
import {Colors} from '~/common/commonStyle.js'
import styles from './index.module.scss'
import classNames from 'classnames'
import {useSelector} from 'react-redux'

const TradePwdManagement = () => {
    const userInfo = useSelector((store) => store.userinfo)
    const [data] = useState([
        [
            {
                title: '修改密码',
                type: 'link',
                jump_to: 'ModifyTradePwd',
            },
            {
                title: '找回密码',
                type: 'link',
                jump_to: 'ForgotTradePwd',
            },
        ],
    ])

    const onClick = useCallback(
        (item) => {
            if (userInfo.has_account) {
                if (item.jump_to === 'ModifyTradePwd') {
                    if (userInfo.has_trade_pwd) {
                        jump({path: item.jump_to})
                    } else {
                        Dialog.confirm({
                            title: '您还未设置交易密码',
                            content: `为了交易安全，您必须先设置<font style="color: ${Colors.red};">数字交易密码</font>`,
                            confirmText: '设置交易密码',
                            onConfirm: () => {
                                jump({path: 'SetTradePassword', params: {action: 'firstSet'}})
                            },
                        })
                    }
                } else if (item.jump_to === 'ForgotTradePwd') {
                    jump({path: item.jump_to})
                }
            } else {
                Dialog.confirm({
                    title: '您还未开户',
                    content: `在您操作之前，需要先进行开户`,
                    confirmText: '开户',
                    onConfirm: () => {
                        jump({path: 'CreateAccount', params: {fr: 'TradePwdManagement'}})
                    },
                })
            }
        },
        [userInfo],
    )

    return (
        <div className={styles.container}>
            {data.map((part, i) => {
                return (
                    <div key={i} className={styles.box}>
                        {part.map((item, index) => {
                            if (item.type === 'link') {
                                return (
                                    <div
                                        key={`item${index}`}
                                        style={{
                                            borderTopWidth: index === 0 ? 0 : '1px',
                                            borderColor: Colors.borderColor,
                                        }}
                                    >
                                        <div
                                            onClick={() => onClick(item)}
                                            className={classNames([styles.flexBetween, styles.item])}
                                            style={{borderTopWidth: 0}}
                                        >
                                            <div className={styles.title}>{item.title}</div>
                                            <Icon name={'angle-right'} size={20} color={Colors.lightGrayColor} />
                                        </div>
                                    </div>
                                )
                            }
                            return null
                        })}
                    </div>
                )
            })}
        </div>
    )
}

export default TradePwdManagement
