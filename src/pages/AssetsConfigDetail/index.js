/*
 * @Description:
 * @Autor: wxp
 * @Date: 2022-12-13 10:16:22
 */
import {Collapse} from 'antd-mobile'
import {DownOutline, UpOutline} from 'antd-mobile-icons'
import classNames from 'classnames'
import React, {useEffect, useRef, useState} from 'react'
import http from '~/service'
import {jump, px} from '~/utils'
import styles from './index.module.scss'
import qs from 'querystring'
import BottomDesc from '~/components/BottomDesc'

const RatioColor = [
    '#E1645C',
    '#6694F3',
    '#F8A840',
    '#CC8FDD',
    '#5DC162',
    '#C7AC6B',
    '#62C4C7',
    '#E97FAD',
    '#C2E07F',
    '#B1B4C5',
    '#E78B61',
    '#8683C9',
    '#EBDD69',
]

const AssetsConfigDetail = () => {
    const params = qs.parse(window.location.search.split('?')[1] || '')
    const [data, setData] = useState({})
    const [amount, setAmount] = useState(params?.amount || '2000')
    const [activeSections, setActiveSections] = useState([])

    const {invest_form, deploy_title, deploy_content, deploy_detail, btns} = data

    const inputRef = useRef()

    const init = (_amount) => {
        const {poid, upid, scene, fr, risk_level} = params || {}

        http.get(scene === 'adviser' ? '/adviser/asset_deploy/20210923' : '/portfolio/asset_deploy/20210101', {
            amount: _amount || amount,
            poid,
            upid,
            fr,
            risk_level,
        }).then((res) => {
            if (res.code === '000000') {
                setData(res.result)
                if (params.scene === 'adviser') {
                    document.title = '组合资产配置'
                } else {
                    document.title = res.result.title || '资产配置详情'
                }
            }
        })
    }

    useEffect(() => {
        init()
    }, [])

    // 输入投资金额回调
    const onChange = (e) => {
        let val = e.target.value
        val = val.replace(/\D/g, '')
        val = val * 1 > 10000000 ? '10000000' : val
        setAmount(val)
        val >= 2000 && init(val)
    }

    return (
        Object.keys(data).length > 0 && (
            <div className={styles.container}>
                {params.scene !== 'adviser' && (
                    <div className={styles.topPart}>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <div className={styles.labelTitle}>{invest_form.title}</div>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                {invest_form.label.map((item, index) => {
                                    return (
                                        <div
                                            key={item.title}
                                            className={styles.lable}
                                            onClick={() => {
                                                let a = `${item.val}`
                                                setAmount(a)
                                                init(a)
                                            }}
                                        >
                                            <div className={styles.lableText}>{item.title}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div style={{position: 'relative'}}>
                            <input
                                value={amount}
                                onChange={onChange}
                                ref={(ref) => (inputRef.current = ref)}
                                className={styles.input}
                            />
                            {`${amount}`.length === 0 && (
                                <div
                                    style={{position: 'absolute', left: px(18), top: px(28)}}
                                    onClick={() => inputRef.current.focus()}
                                >
                                    <div className={styles.placeholder}>{invest_form.placeholder}</div>
                                </div>
                            )}
                        </div>
                        <div className={styles.percent_bar}>
                            {deploy_detail.map((item, index) => (
                                <div
                                    key={item.type}
                                    className={styles.barPart}
                                    style={{
                                        backgroundColor: item.color || RatioColor[index],
                                        width: `${(item.ratio * 100).toFixed(2)}%`,
                                    }}
                                />
                            ))}
                        </div>
                        {deploy_title && deploy_content ? (
                            <div className={styles.deploy_text}>
                                <div className={styles.deploy_title}>{deploy_title}</div>
                                <div className={styles.deploy_content}>{deploy_content}</div>
                            </div>
                        ) : null}
                    </div>
                )}
                <div className={styles.deploy_detail}>
                    <Collapse
                        onChange={(a) => {
                            setActiveSections(a)
                        }}
                    >
                        {deploy_detail.map((section, index) => (
                            <Collapse.Panel
                                key={index}
                                title={
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <div
                                            className={styles.circle}
                                            style={{backgroundColor: section.color || RatioColor[index]}}
                                        ></div>
                                        <div className={styles.assets_l1_name}>{section.name}</div>
                                    </div>
                                }
                                arrow={(active) => (
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        {section.amount && (
                                            <div
                                                className={styles.assets_l1_amount}
                                                style={{
                                                    fontSize: px(14),
                                                    lineHeight: px(16),
                                                    color: '#545968',
                                                    fontFamily: 'DIN-Medium',
                                                }}
                                            >
                                                {section.amount.toFixed(2)}
                                            </div>
                                        )}
                                        <div
                                            className={styles.assets_l1_ratio}
                                            style={{
                                                fontSize: px(14),
                                                lineHeight: px(16),
                                                color: '#545968',
                                                fontFamily: 'DIN-Medium',
                                            }}
                                        >{`${(section.ratio * 100).toFixed(2)}%`}</div>

                                        {active ? (
                                            <UpOutline fontSize={14} color={'#545968'} />
                                        ) : (
                                            <DownOutline fontSize={14} color={'#545968'} />
                                        )}
                                    </div>
                                )}
                            >
                                {section.items
                                    ? section.items.map((item, index) => {
                                          return (
                                              <div
                                                  key={item.code}
                                                  onClick={() => jump({path: 'FundDetail', params: {code: item.code}})}
                                                  className={styles.assets_l2}
                                                  style={index > 0 ? {borderTop: '1px solid #E9EAEF'} : {}}
                                              >
                                                  <div>
                                                      <div className={styles.assets_l2_name}>{item.name}</div>
                                                      <div className={styles.assets_l2_code}>{item.code}</div>
                                                  </div>
                                                  <div className={styles.assets_l2_right}>
                                                      {item.amount ? (
                                                          <div
                                                              className={styles.assets_l2_amount}
                                                              style={{
                                                                  fontSize: px(12),
                                                                  lineHeight: px(16),
                                                                  color: '#545968',
                                                                  fontWeight: '500',
                                                                  fontFamily: 'DINAlternate-Bold',
                                                                  display: 'flex',
                                                              }}
                                                          >
                                                              {item.amount.toFixed(2)}
                                                          </div>
                                                      ) : null}
                                                      <div
                                                          className={classNames([
                                                              styles.assets_l2_ratio,
                                                              styles.assets_l2_right,
                                                          ])}
                                                      >{`${(item.ratio * 100).toFixed(2)}%`}</div>
                                                  </div>
                                              </div>
                                          )
                                      })
                                    : null}
                            </Collapse.Panel>
                        ))}
                    </Collapse>
                </div>
                <BottomDesc />
                {btns && (
                    <div className={styles.bottomBtnWrap}>
                        <div
                            className={styles.bottomBtn}
                            onClick={() => {
                                jump(btns.simple_btns?.[0].url)
                            }}
                        >
                            {btns.simple_btns?.[0].title}
                        </div>
                    </div>
                )}
            </div>
        )
    )
}

export default AssetsConfigDetail
