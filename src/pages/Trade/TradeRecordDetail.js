/*
 * @Date: 2021-02-02 12:27:26
 * @Description:交易记录详情
 */
import React, {Fragment, useCallback, useState, useEffect, useRef} from 'react'
import QueryString from 'qs'
import {Toast, Dialog} from 'antd-mobile'
import {Colors} from '~/common/commonStyle'
import http from '~/service'
import {jump} from '~/utils'
import {tagColor, getTradeColor} from '../../utils/appUtil.js'
import HTML from './components/RenderHTML'
import {BankCardModal} from '../../components/Modal'
import {CheckCircleFill, ClockCircleFill} from 'antd-mobile-icons'
import styles from './TradeRecordDetail.module.scss'
import PasswordModal from '~/components/Modal/PasswordModal.js'
import Icon from 'react-native-vector-icons/dist/Entypo'
import FontAwesome from 'react-native-vector-icons/dist/FontAwesome'
import EvilIcons from 'react-native-vector-icons/dist/EvilIcons'
import classNames from 'classnames'

// 交易类型 type.val      3: 购买（红色） 4:赎回（绿色）6:调仓（蓝色） 7:分红（红色）
// 交易状态 status.val    -1 交易失败（红色）1:确认中（橙色）6:交易成功(绿色) 7:撤单中(橙色) 9:已撤单（灰色）
export default function TradeRecordDetail() {
    const params = QueryString.parse(window.location.href.split('?')[1]) || {}
    const {txn_id, type, sub_type, poid, transfer_id} = params
    const [heightArr, setHeightArr] = useState([])
    const [showMore, setShowMore] = useState([])
    const [errorInfo, setErrorInfo] = useState(null)
    const [data, setData] = useState()
    const [hideMsg, setHideMsg] = useState(false)
    const bankCardRef = useRef()
    const passwordModal = useRef()
    const cardRefs = useRef([])

    useEffect(() => {
        document.title = '交易订单详情'
    }, [])

    useEffect(() => {
        const arr = [...heightArr]
        cardRefs.current.forEach((el, index) => {
            arr[index] = el.clientHeight
        })
        setHeightArr(arr)
    }, [showMore])

    const getData = useCallback(() => {
        http.get('/order/detail/20210101', {
            txn_id,
            type,
            sub_type,
            poid,
            transfer_id,
        })
            .then((res) => {
                setErrorInfo(res.result?.part1?.err_info)
                setData(res.result)

                document.title = res.result.title || '交易订单详情'

                const expand = (res.result.part2 || []).map((item) => {
                    return item.expanded
                })
                setShowMore(expand)
            })
            .finally(() => {
                // props.setLoading(false);
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [txn_id, type, sub_type, poid])
    useEffect(() => {
        getData()
    }, [getData])
    // 撤单
    const cancleTxn = (password) => {
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            content: '正在撤单...',
        })
        http.post('/trade/order/cancel/20210101', {
            password,
            txn_id,
        }).then((res) => {
            Toast.clear()
            if (res.code == '000000') {
                Toast.show('撤单成功！')
                getData()
            } else {
                Toast.show(res.message)
            }
        })
    }
    const handleCancel = (text) => {
        Dialog.confirm({
            title: '确认撤单',
            content: text,
            onConfirm: () => {
                passwordModal.current?.show?.()
            },
        })
    }
    const buyReplace = (password, info) => {
        http.post('/trade/batch/replace/do/20211101', {
            type: info?.type,
            sub_txn_ids: errorInfo?.sub_txn_ids,
            txn_id,
            password,
            batch_id: errorInfo?.batch_id,
        }).then((res) => {
            if (res.code === '000000') {
                setErrorInfo(null)
            }
            Toast.show(res.message)
        })
    }

    const showBank = () => bankCardRef.current?.show()
    const handleClick = (info) => {
        let {title, content} = info
        Dialog.confirm({
            title,
            content,
            onConfirm: () => {
                passwordModal.current?.show?.(info)
            },
        })
    }

    const handleMore = (index) => {
        let more = [...showMore]
        more[index] = !showMore[index]
        setShowMore(more)
    }
    // 隐藏系统消息
    const hideSystemMsg = () => {
        global.LogTool('click', 'hideSystemMsg')
        setHideMsg(true)
    }

    const handlerCardContent = (item, index) => {
        if (!(item?.children && showMore[index])) return null
        switch (item.type) {
            case 'adjust_compare':
                return (
                    <div className={styles.buy_table} style={{borderTopWidth: item?.children?.head ? 0.5 : 0}}>
                        {item?.children?.head ? (
                            <div className="flexBetween" style={{height: 30}}>
                                {item?.children?.head.map((text, key) => (
                                    <span
                                        key={key}
                                        className={styles.light_text}
                                        style={{width: key == 0 ? 163 : 'auto'}}
                                    >
                                        {text}
                                    </span>
                                ))}
                            </div>
                        ) : null}

                        {item?.children
                            ? item?.children?.body.map((child, key) => (
                                  <div key={key} className={`flexBetween ${styles.fund_item}`}>
                                      <span className={styles.fund_name}>{child?.name}</span>
                                      <span className={styles.fund_amount}>{child?.src}</span>
                                      <div className="flexRow">
                                          <span
                                              className={styles.fund_amount}
                                              style={{
                                                  color: child?.type
                                                      ? child?.type == 'down'
                                                          ? Colors.green
                                                          : Colors.red
                                                      : Colors.lightBlackColor,
                                              }}
                                          >
                                              {child?.dst}
                                          </span>
                                          {child.type ? (
                                              <Icon
                                                  name={`arrow-long-${child?.type}`}
                                                  color={child?.type == 'down' ? Colors.green : Colors.red}
                                              />
                                          ) : null}
                                      </div>
                                  </div>
                              ))
                            : null}
                    </div>
                )
            case 'upgrade_compare':
                return (
                    <div className={styles.buy_table} style={{borderTopWidth: item?.children?.head ? 0.5 : 0}}>
                        {item?.children?.head && (
                            <div className="flexBetween" style={{height: 30}}>
                                {item?.children?.head.map((text, key) => (
                                    <span
                                        key={key}
                                        className={styles.light_text}
                                        style={{textAlign: 'left', width: 113}}
                                    >
                                        {text}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div
                            style={[
                                {
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingBottom: 14,
                                },
                            ]}
                        >
                            {item?.children.src && (
                                <div>
                                    {item?.children.src.map((itm, idx) => (
                                        <span
                                            key={idx}
                                            classNam={styles.compareText}
                                            style={{marginTop: idx > 0 ? 4 : 0}}
                                        >
                                            {itm}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <img
                                src="https://static.licaimofang.com/wp-content/uploads/2022/08/trade-record-detail-arrow-1.png"
                                style={{width: 21, height: 12}}
                                alt={''}
                            />
                            {item?.children.dst && (
                                <div>
                                    {item?.children.dst.map((itm, idx) => (
                                        <span
                                            key={idx}
                                            className={styles.compareText}
                                            style={{marginTop: idx > 0 ? 4 : 0}}
                                        >
                                            {itm}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )
            default:
                return (
                    <div className={styles.buy_table} style={{borderTopWidth: item?.children?.head ? 0.5 : 0}}>
                        {item?.children?.head && (
                            <div className="flexBetween" style={{height: 30}}>
                                {item?.children?.head.map((text, key) => (
                                    <span key={key} className={styles.light_text}>
                                        {text}
                                    </span>
                                ))}
                            </div>
                        )}
                        {item?.children?.body?.map((child, key) => (
                            <div className={styles.fund_item} key={key}>
                                <div onClick={() => jump(child.url)} className="flexBetween" style={{marginBottom: 4}}>
                                    <span className={styles.fund_name}>{child?.k}</span>
                                    <span className={styles.fund_amount}>{child?.v}</span>
                                </div>
                                {child?.ds ? (
                                    child?.ds?.map(
                                        (_ds, _key) =>
                                            _ds?.k ? (
                                                <HTML html={_ds?.k} style={{fontSize: 12, lineHeight: '17px'}} />
                                            ) : null,
                                        // <span
                                        //     key={_key}
                                        //     style={[styles.light_text, {color: Colors.green}]}>
                                        //     {_ds?.k}
                                        // </span>
                                    )
                                ) : child?.d ? (
                                    child?.d ? (
                                        <HTML html={child?.d} style={{fontSize: 12, lineHeight: '17px'}} />
                                    ) : null
                                ) : // <span style={[styles.light_text, {color: Colors.green}]}>
                                //     {child?.d}
                                // </span>
                                null}
                            </div>
                        ))}
                    </div>
                )
        }
    }
    const {notice} = data || {}
    return (
        <div className={styles.page}>
            {/* 小黄条 */}
            {!hideMsg && notice?.system ? (
                <div
                    onClick={() => {
                        notice?.system?.log_id && global.LogTool(notice?.system?.log_id)
                        jump(notice?.system?.url)
                    }}
                >
                    <div
                        className={classNames(styles.systemMsgContainer, 'flexBetween')}
                        style={{paddingRight: notice?.system?.button ? 16 : 28}}
                    >
                        <span className={styles.systemMsgText}>{notice?.system?.desc}</span>

                        {notice?.system?.button ? (
                            <div className={styles.btn}>
                                <span className={styles.btn_text}>{notice?.system?.button?.text}</span>
                            </div>
                        ) : (
                            <div className={styles.closeSystemMsg} onClick={hideSystemMsg}>
                                <EvilIcons name={'close'} size={22} color={Colors.yellow} />
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
            <div className={styles.header}>
                <PasswordModal
                    _ref={passwordModal}
                    onDone={(password, info) => {
                        if (info) {
                            buyReplace(password, info)
                        } else {
                            cancleTxn(password)
                        }
                    }}
                />
                {/* 记录标题 */}
                <div className={styles.titleWrap}>
                    <div
                        className={styles.tagWrap}
                        style={{backgroundColor: tagColor(data?.part1?.type?.val).bg_color}}
                    >
                        <span className={styles.tag} style={{color: tagColor(data?.part1?.type?.val).text_color}}>
                            {data?.part1?.type?.text}
                        </span>
                    </div>
                    {data?.part1?.transfer_name ? (
                        <div style={{display: 'flex'}}>
                            <div>
                                <span className={styles.transferName}>{data.part1.transfer_name.from_name}</span>
                                <span className={styles.transferGateway}>{data.part1.transfer_name.from_gateway}</span>
                            </div>
                            <img src={data.part1.transfer_name.icon} className={styles.transferIcon} alt={''} />
                            <div>
                                <span className={styles.transferName}>{data.part1.transfer_name.to_name}</span>
                                <span className={styles.transferGateway}>{data.part1.transfer_name.to_gateway}</span>
                            </div>
                        </div>
                    ) : (
                        <span style={{color: Colors.defaultColor, fontSize: 16, maxWidth: 300}}>
                            {data?.part1?.name}
                        </span>
                    )}
                </div>
                {/* 订单金额/比例 */}
                {data?.part1?.table ? (
                    <div className={styles.tableWrap}>
                        {data?.part1.table.map?.((item, index) => {
                            return (
                                <div key={`${item.k || item.v}${index}`} className={styles.flexRow} style={{flex: 1}}>
                                    {item.k ? <span className={styles.header_text}>{item.k}</span> : null}
                                    {item.v ? <span className={styles.bold_text}>{item.v}</span> : null}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <>
                        {/* 调仓比例 */}
                        {data?.part1?.percent ? (
                            <div className={styles.flexRow} style={{alignItems: 'flex-end'}}>
                                <span className={styles.header_text} style={{marginRight: 6}}>
                                    比例
                                </span>
                                <span className={styles.bold_text}>{data?.part1?.percent}</span>
                            </div>
                        ) : null}
                        {/* 金额展示 */}
                        {data?.part1?.amount ? (
                            <div className={styles.flexRow} style={{alignItems: 'flex-end'}}>
                                <span className={styles.header_text} style={{marginRight: 4, marginBottom: 4}}>
                                    {data?.part1?.extra_text}
                                </span>
                                <span className={styles.bold_text}>{data?.part1?.amount}</span>
                                <span className={styles.header_text} style={{marginBottom: 4, marginLeft: 4}}>
                                    {data?.part1?.unit}
                                </span>
                            </div>
                        ) : null}
                    </>
                )}

                {/* 付款提款项（银行卡，支付方式等） */}
                {data?.part1?.items?.map((_item, key) => (
                    <div className={styles.flexRow} key={_item.k + key}>
                        <span className={styles.header_text}>{_item.k}</span>
                        <div>
                            {Array.isArray(_item?.v) ? (
                                <div onClick={showBank} className={styles.flexRow}>
                                    <span className={styles.header_text} style={{marginLeft: 6, color: '#0051CC'}}>
                                        {_item?.v?.length}张银行卡
                                    </span>
                                    {/* TODO: */}
                                    <BankCardModal
                                        clickable={false}
                                        data={_item?.v || []}
                                        type="hidden"
                                        title="回款银行卡"
                                        _ref={bankCardRef}
                                    />

                                    <FontAwesome
                                        name={'angle-right'}
                                        size={18}
                                        color={Colors.btnColor}
                                        style={{marginLeft: 6}}
                                    />
                                </div>
                            ) : (
                                <span className={styles.header_text} style={{marginLeft: 6}}>
                                    {_item.v}
                                </span>
                            )}
                        </div>
                    </div>
                ))}

                {/* 交易状态 */}
                <div className={styles.flexRow} style={{marginTop: 16}}>
                    {data?.part1?.status?.val == 6 ? (
                        <CheckCircleFill
                            style={{color: getTradeColor(data?.part1?.status?.val), fontSize: 16, marginRight: 8}}
                        />
                    ) : (
                        <ClockCircleFill
                            style={{color: getTradeColor(data?.part1?.status?.val), fontSize: 16, marginRight: 8}}
                        />
                    )}
                    <span style={{color: getTradeColor(data?.part1?.status?.val), fontSize: 14}}>
                        {data?.part1?.status?.text}
                    </span>
                </div>
                {/* 订单tip */}
                {data?.part1?.tip ? (
                    <div className={styles.tip}>
                        <span style={{color: '#545968', fontSize: 12, lineHeight: '17px'}}>{data?.part1?.tip}</span>
                    </div>
                ) : null}

                {errorInfo ? (
                    <div className={styles.tip_card}>
                        <span style={{color: Colors.red, fontSize: 12, lineHeight: '17px', marginBottom: 8}}>
                            {errorInfo?.content}
                        </span>
                        <div className={styles.flexRow}>
                            {errorInfo?.button_list[0]?.avail == 1 ? (
                                <div
                                    className={styles.button}
                                    style={{background: '#fff', color: '#545968'}}
                                    onClick={() => {
                                        handleClick(errorInfo?.button_list[0])
                                    }}
                                >
                                    {errorInfo?.button_list[0]?.text}
                                </div>
                            ) : null}
                            {errorInfo?.button_list[1]?.avail == 1 ? (
                                <div
                                    className={styles.button}
                                    color={Colors.red}
                                    style={{
                                        flex: 1,
                                        background: '#E74949',
                                        color: '#545968',
                                        marginLeft: errorInfo?.button_list?.length > 1 ? 20 : 0,
                                    }}
                                    onClick={() => {
                                        handleClick(errorInfo?.button_list[1])
                                    }}
                                >
                                    {errorInfo?.button_list[1]?.text}
                                </div>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </div>
            {data?.part2?.length > 0 ? (
                <div className={styles.content}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        {data?.desc ? (
                            <span className={styles.card_title} style={{fontWeight: '700', marginBottom: 16}}>
                                {data?.desc}
                            </span>
                        ) : null}
                        {data?.button?.text ? (
                            <div
                                onClick={() => {
                                    handleCancel(data?.button?.popup?.content)
                                }}
                            >
                                <span className={styles.header_right} style={{color: Colors.red}}>
                                    {data?.button?.text}
                                </span>
                            </div>
                        ) : null}
                    </div>
                    {data?.part2?.map((item, index) => {
                        const {children, extra_step, k, k1, v} = item
                        return (
                            <div
                                key={`${v}${index}`}
                                style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start'}}
                                ref={(el) => (cardRefs.current[index] = el)}
                            >
                                <div style={{display: 'flex', position: 'relative'}}>
                                    <div className={styles.circle} />
                                    <div
                                        className={styles.line}
                                        style={{height: index == data?.part2?.length - 1 ? 0 : heightArr[index]}}
                                    />
                                </div>
                                <div className={styles.card}>
                                    <div
                                        className={`flexBetween`}
                                        style={{height: 42}}
                                        onClick={() => {
                                            handleMore(index)
                                        }}
                                    >
                                        <div className={styles.trangle} />
                                        <div style={{marginRight: 8, flexShrink: 1}}>
                                            <HTML
                                                ellipsizeMode="middle"
                                                numberOfLines={1}
                                                className={styles.name}
                                                html={k}
                                            />
                                        </div>
                                        <div className={styles.flexRow} style={{height: '100%'}}>
                                            <span className={styles.date}>{v}</span>
                                            {children || extra_step ? (
                                                <FontAwesome
                                                    name={!showMore[index] ? 'angle-down' : 'angle-up'}
                                                    size={18}
                                                    style={{paddingLeft: 11}}
                                                    color={Colors.lightGrayColor}
                                                />
                                            ) : null}
                                        </div>
                                    </div>

                                    {handlerCardContent(item, index)}
                                    {k1 ? (
                                        <div style={{marginTop: -4, paddingBottom: 8}}>
                                            <HTML html={k1} className={styles.name} />
                                        </div>
                                    ) : null}
                                    {showMore[index]
                                        ? extra_step?.map?.((step, i) => {
                                              const {children: extraChildren, k: key, v: value} = step
                                              return (
                                                  <Fragment key={key + i}>
                                                      <div className="flexBetween" style={{height: 42}}>
                                                          <HTML html={key} className={styles.name} />
                                                          <span className={styles.date}>{value}</span>
                                                      </div>
                                                      {extraChildren?.length > 0 && handlerCardContent(step, i)}
                                                  </Fragment>
                                              )
                                          })
                                        : null}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : null}
        </div>
    )
}
