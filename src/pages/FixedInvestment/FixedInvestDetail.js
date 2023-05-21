/*
 * @Date: 2022/10/11 14:16
 * @Author: yanruifeng
 * @Description: 定投详情新页面
 */

import React, {useEffect, useRef, useState} from 'react'
import {Colors, Font, Space, Style} from '../../common/commonStyle'
import {isEmpty, px} from '../../utils/appUtil'
import {callFixedInvestDetailApi, executeStopFixedInvestApi} from './services'
import Http from '../../service'
import {ActionSheet, Dialog, Mask, Modal, Toast} from 'antd-mobile'
import {useHistory} from 'react-router-dom'
import Loading from '../../components/Loading'
import more from './assets/more.png'
import FixedButton from '../../components/Button/FixedButton'
import {jump} from '../../utils'
import {PasswordModal} from '../../components/Modal'
import {sendPoint} from '../Insurance/utils/sendPoint'
const FixedInvestDetail = ({match}) => {
    const history = useHistory()
    const {invest_plan_id: plan_id = '', fund_code = '', poid = '', avail} = match?.params
    const [modalVisible, setModalVisible] = useState(false)
    const passwordModal = useRef(null)
    const [state, setState] = useState({
        loading: true,
        btn_list: [],
        pay_info: {},
        records: {},
    })
    const [type, setType] = useState('')
    const [visible, setVisible] = useState(false)
    const [selectData, setSelectData] = useState([])
    const handleClick = () => {
        setModalVisible(false)
        passwordModal?.current?.show()
        sendPoint({
            pageid: 'accumlated_investment_end',
            ts: Date.now(),
            chn: 'evolution-h5', // 渠道
            event: 'click',
        })
    }
    const init = async () => {
        const res = await callFixedInvestDetailApi({plan_id, fund_code, poid})
        if (res.code === '000000') {
            const {
                title = '',
                header,
                pay_info,
                records,
                manage_list: {btn_list = [], text},
            } = res.result || {}
            let selectArr = btn_list.map((el, index) => {
                return {text: el.text, key: index, ...el, disabled: el.avail == 0 ? true : false}
            })
            setSelectData(selectArr.slice(0, -1))
            setState({
                header,
                pay_info,
                btn_list,
                records,
                loading: false,
            })
        }
    }
    useEffect(() => {
        init()
    }, [])
    const submit = async (password) => {
        Toast.show({
            icon: 'loading',
            content: '加载中…',
            duration: 3500,
        })
        if (type == 20 || type == 30) {
            const res = await executeStopFixedInvestApi({
                plan_id,
                password,
                type,
            })
            Toast.clear()
            let timer = setTimeout(() => {
                Toast.show({
                    content: res.message,
                })
                timer && clearTimeout(timer)
            }, 500)
        } else {
            Http.get('/trade/stop/invest_plan/20210101', {
                invest_id: plan_id,
                password,
            }).then((res) => {
                Toast.show({
                    content: res.message,
                })
                if (res.code == '000000') {
                    history.goBack()
                }
                Toast.clear()
            })
        }
        init()
    }
    const handleModal = () => {
        setModalVisible(true)
    }
    const ListFooterComponent = () => {
        return (
            <div style={{...Style.flexRowCenter, paddingTop: px(12)}}>
                <span style={{color: Colors.darkGrayColor}}>我们是有底线的...</span>
            </div>
        )
    }
    return (
        <>
            {state.loading ? (
                <Loading color={Colors.btnColor} />
            ) : (
                <div style={styles.container} className="container">
                    {/*定投*/}
                    <div style={styles.investHeader}>
                        <div style={styles.headerTop}>
                            <div style={styles.headerTopWrap}>
                                <div style={Style.flexBetween}>
                                    <span style={styles.fundName}>{state.header?.name}</span>
                                    <div
                                        onClick={() => {
                                            jump(state.header?.url?.url)
                                        }}
                                    >
                                        <span style={styles.detail}>{state.header?.url?.text}</span>
                                    </div>
                                </div>
                                {!isEmpty(state.header?.code) && (
                                    <span style={styles.fundCode}>{state.header?.code}</span>
                                )}
                            </div>
                        </div>
                        <div style={styles.headerBottom}>
                            <div style={styles.headerBottomWrap}>
                                <div style={styles.headerBottomWrapItem}>
                                    <span style={styles.itemValue}>{state.header?.head_list[0]?.value}</span>
                                    <span style={styles.itemLabel}>{state.header?.head_list[0]?.text}</span>
                                </div>
                                <div style={styles.headerBottomWrapItem}>
                                    <span style={styles.itemValue}>{state.header?.head_list[1]?.value}</span>
                                    <span style={styles.itemLabel}>{state.header?.head_list[1]?.text}</span>
                                </div>
                                <div style={styles.headerBottomWrapItem}>
                                    <span style={styles.itemValue}>{state.header?.head_list[2]?.value}</span>
                                    <span style={styles.itemLabel}>{state.header?.head_list[2]?.text}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{marginTop: px(24)}}>
                        <div style={{...styles.section}}>
                            <div
                                style={{
                                    ...styles.status,
                                    backgroundColor:
                                        state.pay_info?.btn_type == 20
                                            ? '#EDF7EC'
                                            : state.pay_info?.btn_type == 30
                                            ? '#FDEFE4'
                                            : '#E9EAEF',
                                }}
                            >
                                <span
                                    style={{
                                        ...styles.statusText,
                                        color:
                                            state.pay_info?.btn_type == 20
                                                ? Colors.green
                                                : state.pay_info?.btn_type == 30
                                                ? '#FF7D41'
                                                : Colors.lightGrayColor,
                                    }}
                                >
                                    {state.pay_info?.status}
                                </span>
                            </div>
                            <span style={styles.title}>{state.pay_info?.title}</span>
                            <div style={styles.bankcard}>
                                <img style={{width: px(50), height: px(50)}} src={state.pay_info?.bank_icon} />
                                <div style={{marginLeft: px(16), display: 'flex', flexDirection: 'column'}}>
                                    <span style={styles.card}>{state.pay_info?.bank_name}</span>
                                    {!isEmpty(state.pay_info?.limit_desc) && (
                                        <span style={{...styles.transfer, marginTop: px(4)}}>
                                            {state.pay_info?.limit_desc}
                                        </span>
                                    )}
                                    <span style={{...styles.schedule, marginTop: px(24)}}>{state.pay_info?.text}</span>
                                </div>
                            </div>
                            {!isEmpty(state.pay_info?.remind) && (
                                <div style={styles.payInfo}>
                                    <div style={{...Style.flexRow, flexWrap: 'wrap'}}>
                                        <div
                                            style={{fontSize: px(26)}}
                                            dangerouslySetInnerHTML={{__html: state.pay_info?.remind}}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {state.records?.data_list?.length > 0 && (
                        <div style={styles.footer}>
                            <div>
                                <span style={styles.listRowTitle}>{state.records?.title}</span>
                            </div>
                            <div style={{...Style.flexBetween, marginTop: px(24)}}>
                                <span style={styles.rowTitle}>日期</span>
                                <span style={styles.rowTitle}>金额(元)</span>
                                <span style={styles.rowTitle}>交易状态</span>
                            </div>
                            {state.records?.data_list?.map((item, index) => {
                                return (
                                    <div
                                        key={item + '' + index}
                                        onClick={() => {
                                            global.LogTool('click', 'accumlated_investment_record')
                                            jump(item?.url)
                                        }}
                                    >
                                        <div style={{...Style.flexRow, marginTop: px(24)}}>
                                            <div style={{width: '38.5%'}}>
                                                <span style={styles.date}>{item.date}</span>
                                            </div>
                                            <div style={{width: '38.5%'}}>
                                                <span style={styles.money}>{item.value}</span>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    width: '23%',
                                                    flexDirection: 'row',
                                                    justifyContent: 'flex-end',
                                                }}
                                            >
                                                <div style={Style.flexRow}>
                                                    <div>
                                                        {(item.status == '定投成功' || item.status == '确认中') && (
                                                            <span style={styles.investStatus}>{item.status}</span>
                                                        )}
                                                        {item.status == '定投失败' && (
                                                            <span style={{...styles.investFail, textAlign: 'right'}}>
                                                                {item.status}
                                                            </span>
                                                        )}
                                                        {!isEmpty(item.reason) && (
                                                            <span style={styles.failReason}>{item.reason}</span>
                                                        )}
                                                    </div>
                                                    <img src={more} style={{width: px(8), marginLeft: px(8)}} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            {state.records?.data_list?.length > 0 && <ListFooterComponent />}
                        </div>
                    )}
                    <PasswordModal _ref={passwordModal} onDone={submit} />
                    <Mask visible={modalVisible} color="rgba(30,31,32,0.7)">
                        <div style={styles.modal_mask}>
                            <div style={styles.centeredView}>
                                <span style={styles.terminatedConfirm}>{state.btn_list[2]?.popup?.title ?? ''}</span>
                                <span style={styles.content}>{state.btn_list[2]?.popup?.content ?? ''}</span>
                                <div style={styles.bottomWrap}>
                                    <div onClick={handleClick}>
                                        <span style={styles.confirmTerminated}>
                                            {state.btn_list[2]?.popup?.confirm.text ?? ''}
                                        </span>
                                    </div>
                                    <div onClick={() => setModalVisible(false)}>
                                        <div style={styles.keepOnView}>
                                            <span style={styles.keepOnText}>
                                                {state.btn_list[2]?.popup?.cancel.text ?? ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Mask>
                    <ActionSheet
                        closeOnAction={true}
                        safeArea={true}
                        closeOnMaskClick={false}
                        cancelText="取消"
                        onAction={({key: index}) => {
                            if (index === 0) {
                                sendPoint({
                                    pageid: 'accumlated_investment_modify',
                                    ts: Date.now(),
                                    chn: 'evolution-h5', // 渠道
                                    event: 'click',
                                })
                                const {
                                    params: {plan_id},
                                } = state.btn_list[index]?.url
                                history.push(`/ModifyFixedInvest/${plan_id}`)
                                jump(state.btn_list[index]?.url)
                            } else if (index === 1) {
                                global.LogTool('click', 'accumlated_investment_pause')
                                setType(state.pay_info?.btn_type)
                                handleClick()
                            } else if (index === 2) {
                                handleModal()
                            }
                        }}
                        visible={visible}
                        actions={selectData}
                        onClose={() => setVisible(false)}
                    />
                </div>
            )}
            <FixedButton
                title="管理"
                onClick={() => {
                    setVisible(true)
                }}
            />
        </>
    )
}

export default FixedInvestDetail
const styles = {
    bottomWrap: {
        display: 'flex',
        marginTop: px(48),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modal_mask: {
        display: 'flex',
        flex: 1,
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmTerminated: {
        fontSize: px(30),
        fontFamily: Font.pingFangRegular,
        fontWeight: 'normal',
        color: Colors.lightBlackColor,
    },
    keepOnView: {
        width: px(344),
        height: px(84),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.brandColor,
        borderRadius: px(16),
    },
    keepOnText: {
        fontSize: px(30),
        fontFamily: Font.pingFangMedium,
        fontWeight: 'normal',
        color: Colors.white,
    },
    failReason: {
        fontSize: px(22),
        fontFamily: Font.pingFangRegular,
        color: Colors.lightGrayColor,
    },
    terminatedConfirm: {
        fontSize: px(36),
        textAlign: 'center',
        fontFamily: Font.pingFangMedium,
        fontWeight: 'normal',
        color: Colors.defaultColor,
    },
    content: {
        fontSize: px(28),
        textAlign: 'justify',
        marginTop: px(24),
        fontFamily: Font.pingFangRegular,
        fontWeight: 'normal',
        color: Colors.lightBlackColor,
    },
    centeredView: {
        // paddingHorizontal: px(36),
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: px(36),
        paddingRight: px(36),
        paddingTop: px(48),
        paddingBottom: px(16),
        borderRadius: px(16),
        backgroundColor: Colors.white,
        width: px(560),
        height: px(396),
    },
    investFail: {
        fontSize: px(24),
        marginTop: px(2),
        color: Colors.red,
        fontFamily: Font.pingFangRegular,
    },
    payInfo: {
        // paddingVertical: px(24),
        paddingTop: px(24),
        paddingBottom: px(24),
    },
    money: {
        fontSize: px(26),
        fontFamily: Font.numRegular,
        color: Colors.lightBlackColor,
    },
    investStatus: {
        fontSize: px(24),
        fontFamily: Font.pingFangRegular,
        color: Colors.defaultColor,
    },
    date: {
        fontSize: px(24),
        fontFamily: Font.numRegular,
        color: Colors.lightBlackColor,
    },
    container: {
        position: 'relative',
        // marginHorizontal: px(32),
        marginLeft: px(32),
        marginRight: px(32),
        marginTop: px(24),
        overflowY: 'scroll',
        backgroundColor: Colors.bgColor,
    },
    rowTitle: {
        fontSize: px(24),
        fontFamily: Font.pingFangRegular,
        fontWeight: 'normal',
        color: '#8F95A4',
    },
    listRowTitle: {
        fontSize: px(26),
        fontFamily: Font.pingFangMedium,
        color: Colors.defaultColor,
    },
    listRowHeader: {},
    footer: {
        marginTop: px(24),
        borderRadius: px(12),
        paddingTop: px(24),
        paddingBottom: px(36),
        // paddingHorizontal: px(32),
        paddingLeft: px(32),
        paddingRight: px(32),
        backgroundColor: Colors.white,
    },
    statusText: {
        fontSize: px(20),
        fontFamily: Font.pingFangRegular,
        fontWeight: 'normal',
    },
    status: {
        position: 'absolute',
        right: 0,
        top: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: px(92),
        height: px(38),
        borderBottomLeftRadius: px(8),
        borderTopRightRadius: px(12),
    },
    redText: {
        fontSize: px(24),
        // fontFamily: Font.numRegular,
        fontFamily: Font.pingFangRegular,
        color: Colors.red,
    },
    blackText: {
        fontSize: px(24),
        fontFamily: Font.pingFangRegular,
        // fontFamily: Font.numRegular,
        color: Colors.lightBlackColor,
    },
    bankcard: {
        borderBottomColor: '#E9EAEF',
        borderBottomStyle: 'solid',
        borderBottomWidth: 0.5,
        display: 'flex',
        flexDirection: 'row',
        paddingBottom: px(22),
        marginTop: px(20),
    },
    schedule: {
        fontSize: px(24),
        fontFamily: Font.pingFangRegular,
        fontWeight: 'normal',
        color: Colors.defaultColor,
    },
    card: {
        fontSize: px(26),
        fontFamily: Font.pingFangMedium,
        fontWeight: 'normal',
        color: Colors.defaultColor,
    },
    transfer: {
        fontSize: px(22),
        fontFamily: Font.pingFangRegular,
        fontWeight: 'normal',
        color: Colors.lightGrayColor,
    },
    section: {
        position: 'relative',
        paddingTop: px(24),
        // paddingHorizontal: px(32),
        paddingLeft: px(32),
        paddingRight: px(32),
        borderRadius: px(12),
        backgroundColor: Colors.white,
        background: `linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 100%)`,
        boxShadow: `0px 8px 20px 0px rgba(170,170,170,0.102)`,
    },
    title: {
        fontSize: px(26),
        fontFamily: Font.pingFangMedium,
        fontWeight: 'normal',
        color: Colors.defaultColor,
    },
    investHeader: {
        // paddingHorizontal: px(32),
        paddingLeft: px(32),
        paddingRight: px(32),
        backgroundColor: Colors.white,
        borderRadius: px(12),
    },
    headerTop: {
        // paddingVertical: px(24),
        paddingTop: px(24),
        paddingBottom: px(24),
        justifyContent: 'center',
        borderBottomWidth: 0.5,
        borderBottomStyle: 'solid',
        borderBottomColor: '#E9EAEF',
    },
    headerTopWrap: {},
    fundName: {
        fontSize: px(28),
        fontFamily: Font.pingFangMedium,
        fontWeight: 'normal',
        color: Colors.defaultColor,
    },
    fundCode: {
        fontSize: px(22),
        marginTop: px(8),
        fontFamily: Font.pingFangRegular,
        color: Colors.lightBlackColor,
    },
    detail: {
        fontSize: px(22),
        fontFamily: Font.pingFangRegular,
        color: '#0051CC',
        fontWeight: 'normal',
    },
    headerBottom: {
        display: 'flex',
        flexDirection: 'column',
        height: px(128),
        justifyContent: 'center',
    },
    headerBottomWrap: {
        ...Style.flexBetween,
    },
    headerBottomWrapItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    itemValue: {
        fontSize: px(28),
        fontFamily: Font.numMedium,
        fontWeight: '500',
    },
    itemLabel: {
        marginTop: px(8),
        fontSize: px(22),
        fontFamily: Font.pingFangRegular,
        color: Colors.lightGrayColor,
    },
    topRightBtn: {
        flex: 1,
        marginRight: Space.marginAlign,
    },
}
