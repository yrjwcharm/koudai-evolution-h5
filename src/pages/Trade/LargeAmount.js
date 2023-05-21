/*
 * @Description:大额转账汇款
 * @Autor: xjh
 * @Date: 2021-01-22 14:28:27
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-09 17:19:39
 */
import React, {useState, useEffect} from 'react'
import {Colors, Font, Space, Style} from '~/common/commonStyle'
import {isIphoneX} from '~/utils/appUtil'
import Html from './components/RenderHTML'
import {Toast, Dialog} from 'antd-mobile'

import {AddCircleOutline, RightOutline} from 'antd-mobile-icons'

import clipboard from 'copy-to-clipboard'
import BottomDesc from '~/components/BottomDesc'
import FixedButtonWithAgreement from '~/components/Button/FixedButtonWithAgreement'
import QueryString from 'qs'
import http from '~/service'
import {jump} from '~/utils'
const btnHeight = isIphoneX() ? 90 : 66

const merge = (list) => Object.assign({}, ...list)

const LargeAmount = ({history}) => {
    const params = QueryString.parse(window.location.href.split('?')[1]) || {}
    const {type = '200'} = params
    const [data, setData] = useState(null)
    const [button, setButton] = useState(null)

    const init = () => {
        http.get('/trade/large_transfer/info/20210101', {...params, type}).then((res) => {
            setData(res.result)
            setButton(res.result.button)
            window.document.title = res.result.title || '大额极速购'
        })
    }
    const jumpPage = (url) => {
        if (!url) {
            return
        }
        jump(url)
    }
    const btnClick = () => {
        http.get('/trade/large_transfer/query/20210101').then((res) => {
            Dialog.alert({
                title: res.result?.title,
                content: <Html html={res.result.content} />,
                onConfirm: () => jumpTo(res.result.status),
            })
        })
    }
    const jumpTo = (status) => {
        if (status === 1) {
            //查询到信息 返回上一页
            history.goBack()
        }
    }
    const copy = (_text) => {
        clipboard(_text)
        Toast.show('复制成功！')
    }

    useEffect(() => {
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return data ? (
        <div style={{backgroundColor: Colors.bgColor}}>
            <div
                style={merge([
                    Style.containerPadding,
                    {padding: 0, marginBottom: btnHeight, borderTopWidth: 0.5, borderColor: Colors.borderColor},
                ])}
            >
                <img src={data.large_amount_top_img} style={{width: '100%', height: 379, marginBottom: 12}} alt={''} />
                <div
                    style={{
                        backgroundColor: '#e74949',
                        padding: '5px 8px',
                        borderRadius: 125,
                        position: 'absolute',
                        right: 10,
                        top: 20,
                    }}
                    onClick={btnClick}
                >
                    <span style={{fontSize: 13, lineHeight: '18px', color: '#fff'}}>到账查询</span>
                </div>
                <div style={{paddingLeft: 16, paddingRight: 16}}>
                    <div style={merge([{padding: Space.padding}, styles.card_sty, {paddingBottom: 0}])}>
                        <div style={{marginBottom: 16}}>
                            <span style={merge([styles.title_sty])}>
                                可用银行卡列表<span style={styles.desc_sty}> (仅支持已绑定银行卡汇款)</span>
                            </span>
                        </div>
                        <>
                            {data?.pay_methods?.map((_item, _index) => {
                                return (
                                    <div
                                        style={merge([Style.flexRow, styles.list_sty])}
                                        key={_index + '_item'}
                                        onClick={() => jumpPage(_item.url)}
                                    >
                                        <div style={merge([Style.flexRow, {flex: 1}])}>
                                            <img
                                                src={_item.bank_icon}
                                                style={{width: 28, height: 28, marginRight: 10}}
                                                alt={''}
                                            />
                                            <span>
                                                {_item.bank_name}({_item.bank_no})
                                            </span>
                                        </div>
                                        {!!_item.url && <RightOutline color={'#999999'} fontSize={12} />}
                                    </div>
                                )
                            })}
                            {data?.add_bank_card ? (
                                <div style={merge([styles.bankCard])} onClick={() => jump(data?.add_bank_card.url)}>
                                    <AddCircleOutline fontSize={16} color={Colors.btnColor} />
                                    <span
                                        style={{
                                            fontSize: 14,
                                            lineHeight: '20px',
                                            color: '#0051CC',
                                            marginLeft: 3,
                                        }}
                                    >
                                        {data?.add_bank_card?.text}
                                    </span>
                                </div>
                            ) : null}
                        </>
                    </div>
                    <div style={merge([{padding: Space.padding}, styles.card_sty, {paddingBottom: 0}])}>
                        <span style={merge([styles.title_sty, {paddingBottom: 16}])}>
                            监管账户<span style={styles.desc_sty}>（民生银行监管）</span>
                        </span>
                        <div>
                            <div style={merge([Style.flexRow, styles.item_wrap_sty])}>
                                <div style={styles.item_sty}>
                                    <span style={styles.item_top_sty}>账户信息</span>
                                    <span style={styles.item_bottom_sty}>{data?.mf_account_info?.bank_name}</span>
                                </div>
                                <div style={styles.copyBtn} onClick={() => copy(data?.mf_account_info?.bank_name)}>
                                    <span style={styles.copy_sty}>复制</span>
                                </div>
                            </div>
                            <div style={merge([Style.flexRow, styles.item_wrap_sty])}>
                                <div style={styles.item_sty}>
                                    <span style={styles.item_top_sty}>银行卡账号</span>
                                    <span style={styles.item_bottom_sty}>{data?.mf_account_info?.bank_no}</span>
                                </div>
                                <div style={styles.copyBtn} onClick={() => copy(data?.mf_account_info?.bank_no)}>
                                    <span style={styles.copy_sty}>复制</span>
                                </div>
                            </div>
                            <div style={merge([Style.flexRow, styles.item_wrap_sty])}>
                                <div style={styles.item_sty}>
                                    <span style={styles.item_top_sty}>开户行</span>
                                    <span style={styles.item_bottom_sty}>{data?.mf_account_info?.bank_addr}</span>
                                </div>
                                <div style={styles.copyBtn} onClick={() => copy(data?.mf_account_info?.bank_addr)}>
                                    <span style={styles.copy_sty}>复制</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={merge([styles.item_wrap_sty, {marginBottom: 12}])}>
                        <img src={data.account_refer_pic} style={{width: 343, height: 361}} alt={''} />
                    </div>
                    <div style={styles.tip_sty}>
                        <span style={{color: Colors.descColor, fontWeight: 'bold'}}>提示信息：</span>
                        {data?.tips?.map((_i, _d) => {
                            return (
                                <div style={{marginTop: 8}} key={_i + _d}>
                                    <Html
                                        html={_i}
                                        style={{lineHeight: '20px', fontSize: 12, color: Colors.descColor}}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
                <BottomDesc />
            </div>
            {button ? (
                <FixedButtonWithAgreement
                    title={button.text}
                    agreement={data.agreement_bottom}
                    containerStyle={{paddingTop: 4}}
                    agreementStyle={{paddingBottom: 8}}
                    onClick={() => {
                        let url = button.url
                        if (typeof url.params?.isLargeAmount === 'string') {
                            url.params.isLargeAmount = url.params.isLargeAmount == 'true' ? true : false
                        }
                        jump(button.url)
                    }}
                />
            ) : null}
        </div>
    ) : null
}

const styles = {
    image_sty: {
        width: 242,
        height: 36,
    },
    process_list: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 16,
    },
    title_sty: {
        color: '#292D39',
        fontSize: Font.textH1,
        fontWeight: 'bold',
    },
    process_wrap: {
        paddingTop: 24,
        // paddingHorizontal: 5,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card_sty: {
        backgroundColor: '#fff',
        marginBottom: 12,
        borderRadius: 6,
    },
    desc_sty: {
        color: Colors.red,
        fontSize: Font.textH3,
        fontWeight: '400',
        paddingTop: 8,
        paddingBottom: 13,
    },
    list_sty: {
        borderTop: `0.5px solid ${Colors.borderColor}`,
        paddingTop: 12,
        paddingBottom: 12,
    },
    item_sty: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        paddingTop: 12,
        paddingBottom: 12,
    },
    item_top_sty: {
        color: '#545968',
        fontSize: 14,
    },
    item_bottom_sty: {
        color: '#121D3A',
        fontSize: 14,
        paddingTop: 6,
        fontWeight: 'bold',
    },
    copyBtn: {
        borderRadius: 6,
        backgroundColor: '#0051CC',
        padding: 8,
    },
    copy_sty: {
        color: '#fff',
        fontSize: 12,
    },
    item_wrap_sty: {
        borderTopWidth: 0.5,
        borderColor: Colors.borderColor,
    },
    tip_sty: {
        paddingTop: 6,
    },
    right_sty: {
        padding: '5px 7px',
        borderColor: Colors.defaultColor,
        borderWidth: 0.5,
        borderRadius: 5,
        marginRight: 16,
    },
    bankCard: {
        display: 'flex',
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 17,
        paddingBottom: 17,
        justifyContent: 'center',
        borderTop: `0.5px solid ${Colors.borderColor}`,
    },
    bank_icon: {
        width: 32,
        height: 32,
        marginRight: 14,
        resizeMode: 'contain',
    },
    content_sty: {
        marginTop: 16,
        lineHeight: '18px',
        marginBottom: 20,
        color: '#545968',
        fontSize: 12,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 16,
        position: 'absolute',
        width: '100%',
        top: 0,
        left: 0,
        zIndex: 1,
        paddingBottom: 12,
    },
    navTitle: {
        position: 'absolute',
        left: 17,
        bottom: 3,
        width: '100%',
        textAlign: 'center',
        color: Colors.navTitleColor,
        fontWeight: 'bold',
        fontSize: 17,
    },
    btn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
}
export default LargeAmount
