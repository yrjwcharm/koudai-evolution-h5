/*
 * @Description:
 * @Autor: wxp
 * @Date: 2022-12-14 11:34:45
 */

import {Collapse, Image, Popup} from 'antd-mobile'
import classNames from 'classnames'
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {Colors, Font} from '~/common/commonStyle'
import BottomDesc from '~/components/BottomDesc'
import NumText from '~/components/NumText'
import http from '~/service'
import {px, jump} from '~/utils'
import styles from './index.module.scss'
import tip from '~/image/icon/tip.png'
import mfbArrow from '~/image/icon/mfbArrow.png'
import {CloseOutline, RightOutline} from 'antd-mobile-icons'
import Empty from '~/components/Empty'
import CapsuleTabbar from '~/components/CapsuleTabbar'

const MfbHome = () => {
    const [data, setData] = useState({})
    const {auto_charge, buttons, holding, intro, records} = data

    const init = () => {
        http.get('/wallet/v7/dashboard/20220708', {}).then((res) => {
            if (res.code === '000000') {
                const {title} = res.result
                document.title = title || '魔方宝'
                setData(res.result)
            }
        })
    }

    useEffect(() => {
        init()
    }, [])

    return (
        <div className={styles.container}>
            {Object.keys(data).length > 0 && (
                <div style={{position: 'absolute', paddingBottom: px(80)}}>
                    <div
                        colors={['#1E5AE7', '#F5F6F8']}
                        start={{x: 0, y: 0.33}}
                        end={{x: 0, y: 1}}
                        className={styles.topBg}
                    ></div>
                    <div style={{padding: px(16)}}>
                        {holding ? <HoldingInfo data={{holding, intro}} /> : null}
                        {auto_charge ? <AutoCharge data={auto_charge} /> : null}
                        {records ? <TradeRecords data={records} top_button={data.top_button} /> : null}
                    </div>
                    <BottomDesc />
                    {buttons?.length > 0 && (
                        <div className={classNames([styles.flexRow, styles.btnContainer])}>
                            {renderBtns({buttons, jump, style: {borderRadius: px(6)}})}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const HoldingInfo = ({data = {}}) => {
    const {
        holding: {
            amount: holdingAmount,
            date: holdingDate,
            profit: holdingProfit,
            profit_acc: holdingProfitAcc,
            profit_label: holdingProfitLable = '日收益',
        } = {},
        intro = [],
    } = data

    return (
        <div className={styles.holdingInfo}>
            <div style={{paddingLeft: px(16), paddingRight: px(16)}}>
                <div style={{paddingTop: px(20), paddingBottom: px(20)}}>
                    <div className={styles.flexBetween}>
                        <div className={styles.desc}>{`总金额(元) ${holdingDate}`}</div>
                        {holdingProfit ? (
                            <div className={styles.flexRow}>
                                <div className={styles.desc} style={{marginRight: px(8)}}>
                                    {holdingProfitLable}
                                </div>
                                <NumText style={styles.smNumber} text={holdingProfit} />
                            </div>
                        ) : null}
                    </div>
                    <div className={styles.flexBetween} style={{marginTop: px(6)}}>
                        <div className={styles.bigNumber}>{holdingAmount}</div>
                        {holdingProfitAcc ? (
                            <div className={styles.flexRow}>
                                <div className={styles.desc} style={{marginRight: px(8)}}>
                                    {'累计收益'}
                                </div>
                                <NumText style={styles.smNumber} text={holdingProfitAcc} />
                            </div>
                        ) : null}
                    </div>
                </div>
                {intro?.length > 0 && (
                    <>
                        <div className={styles.divider} />
                        <Collapse>
                            <Collapse.Panel
                                key={1}
                                title={
                                    <div className={styles.desc} style={{color: Colors.defaultColor}}>
                                        {intro[0]?.title}
                                    </div>
                                }
                            >
                                <div className={styles.introContentBox} style={{marginTop: 0}}>
                                    <div
                                        className={styles.introContent}
                                        dangerouslySetInnerHTML={{__html: intro[0]?.content}}
                                    ></div>
                                </div>
                                <div style={{paddingTop: px(16), paddingBottom: px(16)}}>
                                    <div className={styles.desc} style={{color: Colors.defaultColor}}>
                                        {intro[1]?.title}
                                    </div>
                                    <div className={styles.introContentBox}>
                                        <div
                                            className={styles.introContent}
                                            dangerouslySetInnerHTML={{__html: intro[1]?.content}}
                                        ></div>
                                    </div>
                                </div>
                            </Collapse.Panel>
                        </Collapse>
                    </>
                )}
            </div>
        </div>
    )
}

const AutoCharge = ({data = {}}) => {
    const {charge_prompt, close_card, empty_button, empty_tip, open_card, open_items, title, title_tip} = data
    const {
        amount_text,
        buttons,
        desc,
        icon,
        items,
        pay_amount_text,
        pay_date,
        pay_date_text,
        pay_percent,
        title: subTitle,
    } = charge_prompt || open_items || {}
    const [barLength, setBarLength] = useState(0)
    const [tips, setTips] = useState()
    const [tipsVisible, setTipsVisible] = useState(false)
    const amountBox = useRef()

    return (
        <div style={{paddingTop: px(16)}}>
            <div className={styles.flexRow}>
                <div className={styles.bigTitle} style={{marginRight: px(4)}}>
                    {title}
                </div>
                {title_tip ? (
                    <div
                        onClick={() => {
                            setTips(title_tip)
                            setTipsVisible(true)
                        }}
                    >
                        <Image src={tip} className={styles.aboutAutoCharge} />
                    </div>
                ) : null}
            </div>
            <div className={styles.autoChargeBox}>
                {/* 自动充值提醒 */}
                {charge_prompt ? (
                    <div style={{paddingTop: px(16), paddingBottom: px(20)}}>
                        <div className={styles.flexRow}>
                            <Image src={icon} className={styles.subTitleIcon} />
                            <div className={styles.subTitle} dangerouslySetInnerHTML={{__html: subTitle}}></div>
                        </div>
                        <div className={styles.desc} style={{marginTop: px(6)}}>
                            {desc}
                        </div>
                        <div style={{marginTop: px(12)}}>
                            <div className={styles.flexRow}>
                                <div
                                    onLoad={(e) => {
                                        const width = e.currentTarget.getBoundingClientRect()?.width
                                        const left = (barLength * pay_percent) / 100 - width / 2
                                        const maxLeft = px(4) + barLength - width
                                        amountBox.current?.setNativeProps({
                                            style: [
                                                styles.amountBox,
                                                {left: left < -px(4) ? -px(4) : left > maxLeft ? maxLeft : left},
                                            ],
                                        })
                                    }}
                                    ref={amountBox}
                                    className={styles.amountBox}
                                >
                                    <img
                                        alt=""
                                        src="https://static.licaimofang.com/wp-content/uploads/2022/10/question.png"
                                        style={{width: 0, height: 0, opacity: 0, zIndex: -1}}
                                    />
                                    <div className={styles.amountText}>{amount_text}</div>
                                </div>
                            </div>
                            <Image
                                src={mfbArrow}
                                className={styles.mfbArrow}
                                style={{
                                    marginLeft: (barLength * pay_percent) / 100 - (pay_percent > 50 ? px(4) : px(3)),
                                }}
                            />
                            <div
                                onLoad={(e) => setBarLength(e.currentTarget.getBoundingClientRect()?.width)}
                                className={styles.percentBar}
                            >
                                <img
                                    alt=""
                                    src="https://static.licaimofang.com/wp-content/uploads/2022/10/question.png"
                                    style={{width: 0, height: 0, opacity: 0, zIndex: -1}}
                                />
                                <div className={styles.activeBar} style={{width: `${pay_percent}%`}} />
                            </div>
                            <div className={styles.flexBetween} style={{marginTop: px(6)}}>
                                <div className={styles.smallText}>
                                    {pay_date_text}
                                    <div style={{color: Colors.defaultColor}}>{pay_date}</div>
                                </div>
                                <div className={styles.smallText} style={{color: Colors.defaultColor}}>
                                    {pay_amount_text}
                                </div>
                            </div>
                        </div>
                        {buttons?.length > 0 && (
                            <div className={styles.flexRow} style={{marginTop: px(16)}}>
                                {renderBtns({buttons, jump})}
                            </div>
                        )}
                    </div>
                ) : null}
                {/* 未开启计划 */}
                {empty_tip ? (
                    <div style={{paddingTop: px(44), paddingBottom: px(44)}} className={styles.flexRowCenter}>
                        <div className={styles.bigTitle}>{empty_tip}</div>
                        {empty_button?.text ? (
                            <div
                                onClick={() => jump(empty_button.url)}
                                className={styles.flexRow}
                                style={{marginLeft: px(8)}}
                            >
                                <div className={styles.subTitle} style={{color: Colors.brandColor}}>
                                    {empty_button.text}
                                </div>
                                <RightOutline color={Colors.brandColor} size={16} />
                            </div>
                        ) : null}
                    </div>
                ) : null}
                {/* 计划列表 */}
                {open_items ? (
                    <div>
                        <div style={{paddingTop: px(16), paddingBottom: px(16)}}>
                            <div className={styles.flexRow}>
                                <Image src={icon} className={styles.subTitleIcon} />
                                <div className={styles.subTitle}>{subTitle}</div>
                            </div>
                            <div style={{marginTop: px(4)}} className={styles.desc}>
                                {desc}
                            </div>
                        </div>
                        {items?.map((item, index) => {
                            const {button, name} = item
                            const disabled = button?.avail === 0
                            return (
                                <div
                                    key={name + index}
                                    className={classNames([styles.flexBetween, styles.toolItem])}
                                    style={{marginTop: index === 0 ? px(-4) : 0}}
                                >
                                    <div className={styles.subTitle}>{name}</div>
                                    {button?.text ? (
                                        <div
                                            onClick={() => !disabled && jump(button.url)}
                                            className={styles.openToolBtn}
                                            style={disabled ? {backgroundColor: '#E9EAEF'} : {}}
                                        >
                                            <div style={{color: disabled ? '#BDC2CC' : '#fff'}} className={styles.desc}>
                                                {button.text}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )
                        })}
                    </div>
                ) : null}
            </div>
            <div className={styles.flexBetween}>
                {open_card?.text ? (
                    <div
                        onClick={() => jump(open_card.url)}
                        className={classNames([styles.flexBetween, styles.autoChargeBox, styles.openCard])}
                    >
                        <div className={styles.subTitle}>{open_card.text}</div>
                        <RightOutline color={Colors.descColor} size={16} />
                    </div>
                ) : null}
                {close_card?.text ? (
                    <div
                        onClick={() => jump(close_card.url)}
                        className={classNames([styles.flexBetween, styles.autoChargeBox, styles.openCard])}
                    >
                        <div className={styles.subTitle}>{close_card.text}</div>
                        <RightOutline color={Colors.descColor} size={16} />
                    </div>
                ) : null}
            </div>
            <Popup
                visible={tipsVisible}
                getContainer={null}
                bodyStyle={{borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}}
                onMaskClick={() => {
                    setTipsVisible(false)
                }}
            >
                <div className={styles.popHeader}>
                    <div
                        className={styles.popClose}
                        onClick={() => {
                            setTipsVisible(false)
                        }}
                    >
                        <CloseOutline fontSize={18} color="#545968" />
                    </div>
                    <div className={styles.poptitle}>{tips?.modalTitle}</div>
                </div>
                <div
                    style={{
                        padding: px(16),
                        maxHeight: '60vh',
                        overflowY: 'auto',
                    }}
                >
                    {tips?.img ? <Image src={tips?.img} style={{width: '100%', height: px(140)}} /> : null}
                    {tips?.content?.map((item, index) => {
                        const {key: _key, val} = item
                        return (
                            <div key={val + index} style={{marginTop: index === 0 ? 0 : px(16)}}>
                                {_key ? (
                                    <div className={styles.title} dangerouslySetInnerHTML={{__html: `${_key}:`}}></div>
                                ) : null}
                                {val ? (
                                    <div style={{marginTop: px(4)}}>
                                        <div className={styles.tipsVal} dangerouslySetInnerHTML={{__html: val}}></div>
                                    </div>
                                ) : null}
                            </div>
                        )
                    })}
                </div>
            </Popup>
        </div>
    )
}

const TradeRecords = ({data = {}, top_button}) => {
    const {title, types} = data
    const pageRef = useRef(0)
    const [currentTab, setCurrentTab] = useState(0)

    const tab = useMemo(() => {
        return types[currentTab] || {}
    }, [types, currentTab])

    const {has_more, key, val, list} = tab

    const tagColor = (type) => {
        if (type == 4) {
            return {
                text_color: '#4BA471',
                bg_color: '#EDF7EC',
            }
        } else if (type == 6 || type == 10) {
            return {
                text_color: '#0051CC',
                bg_color: '#EFF5FF',
            }
        } else if (type == 100) {
            return {
                text_color: '#FF7D41',
                bg_color: '#FFF5E5',
            }
        } else {
            return {
                text_color: '#E74949',
                bg_color: '#FFF2F2',
            }
        }
    }

    /** @name 交易记录tag颜色 */
    const tradeStuatusColor = (status) => {
        if (status < 0) {
            return Colors.red
        } else if (status == 0 || status == 1) {
            return Colors.orange
        } else if (status == 5 || status == 6) {
            return Colors.green
        } else {
            return Colors.defaultColor
        }
    }

    /** @name 名称过长省略处理 */
    const handlerName = (val = '') => {
        if (val.length > 9) {
            val = val.slice(0, 5) + '...' + val.slice(-4)
        }
        return val
    }

    return (
        <div style={{paddingTop: px(32)}}>
            <div className={styles.tradeRecordsHeader}>
                <div className={styles.bigTitle}>{title}</div>
                {top_button?.text && (
                    <div onClick={() => jump(top_button.url)} style={{}}>
                        <div className={styles.topBtnText}>{top_button.text}</div>
                    </div>
                )}
            </div>
            <CapsuleTabbar
                boxStyle={styles.tabsContainer}
                activeTab={currentTab}
                goToPage={setCurrentTab}
                tabs={types.map((tab) => tab.val)}
            />
            <div key={key + val}>
                {list?.length > 0 ? (
                    list.map((item, index) => {
                        const {error_msg, items, name, notice, time, type, url} = item
                        return (
                            <div key={time + index} onClick={() => url && jump(url)} className={styles.card}>
                                <div style={{paddingLeft: px(16), paddingRight: px(16)}}>
                                    <div className={styles.flexBetween}>
                                        <div className={styles.flexRow}>
                                            <div
                                                className={styles.tag}
                                                style={{
                                                    marginRight: px(8),
                                                    backgroundColor: tagColor(type?.val).bg_color,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: px(11),
                                                        color: tagColor(type?.val).text_color,
                                                    }}
                                                >
                                                    {type?.text}
                                                </div>
                                            </div>
                                            <div className={styles.title}>{handlerName(name)}</div>
                                        </div>
                                        <div className={styles.date}>{time}</div>
                                    </div>
                                    <div className={styles.flexRow} style={{paddingTop: px(13), paddingBottom: px(13)}}>
                                        {items.map((_item, _index, arr) => (
                                            <div
                                                key={_index}
                                                style={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems:
                                                        _index === 0
                                                            ? 'flex-start'
                                                            : _index === arr.length - 1
                                                            ? 'flex-end'
                                                            : 'center',
                                                }}
                                            >
                                                <div className={styles.light_text}>{_item.k}</div>
                                                <div
                                                    className={styles.num_text}
                                                    style={{
                                                        fontFamily: _index !== arr.length - 1 ? Font.numMedium : null,
                                                        color:
                                                            _index === arr.length - 1
                                                                ? tradeStuatusColor(_item.v.val)
                                                                : Colors.defaultColor,
                                                    }}
                                                >
                                                    {_item.v?.text || _item.v}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {notice ? (
                                        <div className={styles.notice}>
                                            <div className={styles.notice_text}>{notice}</div>
                                        </div>
                                    ) : null}
                                </div>
                                {error_msg ? (
                                    <div className={styles.errorMsgBox}>
                                        <div className={styles.errorMsg}>
                                            {error_msg}&nbsp;
                                            <RightOutline color={Colors.red} size={16} />
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        )
                    })
                ) : (
                    <Empty text={'暂无数据'} />
                )}
                {has_more === 1 ? (
                    <div
                        onClick={() =>
                            jump({
                                path: 'TradeRecord',
                                params: {fr: 'mfb', tabActive: pageRef.current},
                                type: 1,
                            })
                        }
                        className={styles.flexRowCenter}
                        style={{paddingTop: px(16), paddingBottom: px(16)}}
                    >
                        <div className={styles.desc} style={{color: Colors.brandColor}}>
                            {'查看更多'}
                        </div>
                        <RightOutline color={Colors.brandColor} size={16} />
                    </div>
                ) : null}
            </div>
        </div>
    )
}

const renderBtns = ({buttons, jump, style = {}}) => {
    return buttons?.map((btn, i, arr) => {
        const {avail, text, url} = btn
        return (
            <button
                disabled={avail === 0}
                key={text + i}
                onClick={() => jump(url)}
                className={classNames([styles.flexCenter, styles.button, style])}
                style={
                    i === 0
                        ? {
                              borderColor: avail === 0 ? '#ddd' : Colors.descColor,
                              marginRight: px(12),
                          }
                        : i === arr.length - 1
                        ? {backgroundColor: avail === 0 ? '#ddd' : Colors.brandColor}
                        : {}
                }
            >
                <div
                    className={styles.buttonText}
                    style={
                        i === 0
                            ? {color: avail === 0 ? '#ddd' : Colors.descColor}
                            : i === arr.length - 1
                            ? {color: '#fff'}
                            : {}
                    }
                >
                    {text}
                </div>
            </button>
        )
    })
}

export default MfbHome
