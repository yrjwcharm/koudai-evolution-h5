/*
 * @Date: 2021-01-14 17:23:13
 * @Author: yhc
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-16 11:45:56
 * @Description: 协议
 */
import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {jump, px} from '~/utils'
import {Image} from 'antd-mobile'
import checked1 from '~/image/icon/checked.png'
import {Colors, Font} from '~/common/commonStyle'
import classNames from 'classnames'
import styles from './index.module.scss'

function Agreements(props) {
    const {
        data = [],
        check = true,
        onChange = () => {},
        title = '我已阅读并同意',
        style = {},
        isHide = false,
        emitJump, //通知父组建跳转
        suffix = '',
        checkIcon = checked1,
        text1 = '',
        otherAgreement,
        // otherParam,
    } = props
    const jumpPage = (item) => {
        if (item.url && Object.prototype.toString.call(item.url) === '[object Object]') {
            const {id} = item.url.params
            jump({
                path: 'Agreement/' + id,
            })
            return jump(item.url)
        }
        if (item.id == 32) {
            //隐私权协议
            jump({
                path: 'privacy',
            })
        } else {
            jump({
                path: 'Agreement/' + item.id,
            })
        }
    }
    const [checked, setChecked] = useState(check)
    const toggle = () => {
        setChecked(!checked)
        onChange && onChange(!checked)
    }
    // let source = 'checkbox-blank-circle-outline';
    // if (checked) {
    //     source = 'checkbox-marked-circle';
    // }
    // let container = <Icon name={source} size={px(18)} color="#0052CD" />;
    const imgStyle = {width: px(15), height: px(15), marginTop: px(1.5)}
    const container = checked ? (
        <Image src={checkIcon} style={imgStyle} />
    ) : (
        <div
            style={{
                ...imgStyle,
                borderColor: Colors.darkGrayColor,
                borderWidth: '1px',
                borderRadius: px(15),
                borderStyle: 'solid',
            }}
        />
    )
    return (
        <div className={classNames([style])} style={{display: 'flex'}}>
            {!isHide && (
                <div onClick={toggle} style={{width: px(20), minHeight: px(20)}}>
                    {container}
                </div>
            )}
            <div className={styles.agreement_text}>
                <div className={styles.text}>{title}</div>
                {data && data.length > 0
                    ? data.map((item, index) => {
                          return (
                              <div
                                  onClick={() => {
                                      emitJump && emitJump()
                                      jumpPage(item)
                                  }}
                                  style={{fontSize: Font.textSm, color: '#0051CC'}}
                                  key={index}
                              >
                                  {item.title || item.name}
                              </div>
                          )
                      })
                    : null}
                {text1 ? <div style={{...styles.text, color: Colors.descColor}}>{text1}</div> : null}
                {otherAgreement ? (
                    <>
                        <div
                            style={{color: Colors.btnColor}}
                            onClick={() => {
                                // jump({
                                //   path: 'TradeAgreements',
                                //   params: otherParam
                                // })
                            }}
                        >
                            《产品概要》
                        </div>
                        {otherAgreement?.map((_item, index, arr) => (
                            <div
                                key={index}
                                style={{color: Colors.btnColor}}
                                onClick={() => {
                                    jumpPage(_item)
                                }}
                            >
                                《{_item?.title}》
                            </div>
                        ))}
                    </>
                ) : null}
                {suffix ? <div style={{...styles.text, color: Colors.descColor}}>{suffix}</div> : null}
            </div>
        </div>
    )
}

Agreements.propTypes = {
    data: PropTypes.array,
    check: PropTypes.bool,
    onChange: PropTypes.func,
    title: PropTypes.string,
}
export default Agreements
