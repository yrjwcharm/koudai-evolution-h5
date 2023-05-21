/*
 * @Date: 2021-11-29 11:18:44
 * @Description: 投顾服务费
 */
import React, {useEffect, useState} from 'react'

import Icon from 'react-native-vector-icons/dist/AntDesign'
import {Font, Colors, Style} from '../../common/commonStyle'
import BottomDesc from '../../components/BottomDesc'
import Html from './components/RenderHTML'
import {jump} from '~/utils'
import {DotLoading} from 'antd-mobile'
import http from '~/service'
import QueryString from 'qs'
import {BottomModal} from '../../components/Modal'
import styles from './AdviserFee.module.scss'

export default function AdviserFee({navigation, route}) {
    const params = QueryString.parse(window.location.href.split('?')[1]) || {}
    const [data, setData] = useState({})
    const bottomModal = React.useRef(null)
    useEffect(() => {
        window.document.title = '投顾服务费'
    }, [])

    useEffect(() => {
        http.get('/adviser/fee/20211101', params || {}).then((res) => {
            if (res.code === '000000') {
                window.document.title = res.result.title || '投顾服务费'
                setData(res.result || {})
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            {Object.keys(data).length > 0 ? (
                <div className={styles.container}>
                    <div className={styles.topPart}>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <span className={styles.label}>{data.fee[0]?.text}</span>
                            {data?.tips ? (
                                <div
                                    onClick={() => {
                                        bottomModal.current.show()
                                    }}
                                    className={styles.radio_sty}
                                    style={{marginLeft: 6}}
                                >
                                    <img
                                        style={{width: 15, height: 15}}
                                        src={require('~/image/icon/tip.png').default}
                                        alt={''}
                                    />
                                </div>
                            ) : null}
                        </div>
                        <span className={styles.bigFee}>{data.fee[0]?.value}</span>
                        <div style={{...Style.flexRow, marginTop: 24, width: '100%'}}>
                            <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                                <span className={styles.label}>{data.fee[1]?.text}</span>
                                <span className={styles.smallFee}>{data.fee[1]?.value}</span>
                            </div>
                            <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                                <span className={styles.label}>{data.fee[2]?.text}</span>
                                <span className={styles.smallFee}>{data.fee[2]?.value}</span>
                            </div>
                        </div>
                    </div>
                    {data?.fee_list
                        ? data?.fee_list?.map((item, index) => (
                              <div
                                  key={index}
                                  onClick={() => jump(item?.url)}
                                  style={Style.flexBetween}
                                  className={styles.card}
                              >
                                  <div>
                                      <div style={{...Style.flexRow, marginBottom: 6}}>
                                          <span>{item.title}</span>
                                          <span className={styles.tag}>{item.tag}</span>
                                      </div>
                                      <span
                                          style={{
                                              color: Colors.darkGrayColor,
                                              fontFamily: Font.numRegular,
                                              fontSize: 12,
                                          }}
                                      >
                                          {item.date}
                                      </span>
                                  </div>
                                  <div style={{display: 'flex', flexDirection: 'column'}}>
                                      <span style={{fontFamily: Font.numFontFamily, marginBottom: 6}}>
                                          {item.amount}
                                      </span>
                                      <span style={{color: Colors.lightBlackColor, fontSize: 12}}>
                                          {item.amount_desc}
                                      </span>
                                  </div>
                              </div>
                          ))
                        : null}
                    {data.fee_intro ? (
                        <div
                            onClick={() => jump(data.fee_intro.url)}
                            className={styles.feeIntro}
                            style={Style.flexBetween}
                        >
                            <span className={styles.feeIntroText}>{data.fee_intro.title}</span>
                            <Icon color={Colors.descColor} name="right" size={12} />
                        </div>
                    ) : null}
                    <BottomDesc fix_img={data.advisor_footer_imgs} className={styles.bottomDesc} />
                    <BottomModal ref={bottomModal} title={data?.tips?.title}>
                        <div style={{padding: 16}}>
                            {data?.tips?.content?.map?.((item, index) => {
                                return (
                                    <div key={item + index} style={{marginTop: index === 0 ? 0 : 16}}>
                                        <span className={styles.tipTitle}>{item.key}:</span>
                                        <Html style={{lineHeight: '18px', fontSize: 13}} html={item.val} />
                                    </div>
                                )
                            })}
                        </div>
                    </BottomModal>
                </div>
            ) : (
                <DotLoading />
            )}
        </>
    )
}
