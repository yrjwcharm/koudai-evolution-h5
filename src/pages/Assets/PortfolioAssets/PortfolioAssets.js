/*
 * @Date: 2022-12-15 14:27:04
 * @Description: 持仓详情页
 */
import {Dialog} from 'antd-mobile'
import {DownOutline, RightOutline, UpOutline} from 'antd-mobile-icons'
import {Modal} from 'antd-mobile'
import classNames from 'classnames'
import React, {useCallback, useEffect, useState} from 'react'
import BottomDesc from '~/components/BottomDesc'
import http from '~/service'
import {getUrlParams, jump} from '~/utils'
import Eye from '../components/Eye/Eye'
import ToolMenusCard from '../components/ToolMenusCard/ToolMenusCard'
import ChartTabs from './ChartTabs'
import './index.scss'
import {getCommonData, getDsData, getPageData} from './services'
import {Colors} from '~/common/commonStyle'
import TradeNotice from '../components/TradeNotice/TradeNotice'
import {debounce} from 'lodash'
const PortfolioAssets = ({location, history}) => {
    const [refreshing, setRefreshing] = useState(false)
    const [data, setData] = useState({})
    const {code, button_list, chart_tabs, console_info, name, profit_explain, summary, tags, top_button, trade_notice} =
        data
    const [commonData, setCommonData] = useState({})
    const [dsList, setDsList] = useState([])
    const {gather_list, tool_list} = commonData
    const [showEye, setShowEye] = useState('true')
    const [expand, setExpand] = useState(false)
    const params = getUrlParams(location.search)
    const init = () => {
        getPageData(params || {})
            .then((res) => {
                if (res.code === '000000') {
                    const {need_ds, title = '资产详情'} = res.result
                    document.title = title
                    if (need_ds) {
                        getDsData(params || {}).then((resp) => {
                            if (resp.code === '000000') {
                                setDsList(resp.result?.list || [])
                            }
                        })
                    }
                    setData(res.result)
                }
            })
            .finally(() => {
                setRefreshing(false)
            })
        getCommonData(params || {}).then((res) => {
            if (res.code === '000000') {
                setCommonData(res.result)
            }
        })
        // getTransferGuidePop(params || {}).then((res) => {
        //     if (res.code === '000000') {
        //         const { back_close, cancel, confirm, content, title, touch_close } = res.result;
        //         content &&
        //             Modal.show({
        //                 backButtonClose: back_close,
        //                 cancelCallBack: () => window.LogTool('PortfolioTransition_Windows_No', params?.poid),
        //                 cancelText: cancel.text,
        //                 confirm: true,
        //                 confirmCallBack: () => {
        //                     window.LogTool('PortfolioTransition_Windows_yes', params?.poid);
        //                     jump(confirm.url);
        //                 },
        //                 confirmText: confirm.text,
        //                 content,
        //                 isTouchMaskToClose: touch_close,
        //                 title,
        //             });
        //     }
        // });
    }

    // const showSignalModal = ({options, renderData, type}) => {
    //     Modal.show(
    //         {
    //             ...options,
    //             children: (
    //                 <View style={{paddingHorizontal: Space.padding}}>
    //                     {centerControl.current?.renderSignalItems(renderData)}
    //                 </View>
    //             ),
    //         },
    //         type
    //     );
    // };

    // const onDone = (password, params) => {
    //     setDividend({password, ...params}).then((res) => {
    //         res.message && Toast.show(res.message)
    //         if (res.code === '000000') {
    //             init()
    //         }
    //     })
    // }
    /** @name 处理隐藏金额信息 */
    const hideAmount = (value) => {
        return showEye === 'true' ? value : '****'
    }
    useEffect(() => {
        // Storage.get('portfolioAssets').then((res) => {
        //     setShowEye(res ? res : 'true');
        // });
        init()
    }, [])

    const accountJump = useCallback(
        debounce((url) => {
            http.get('/position/popup/20210101', {poid: params?.poid, action: 'redeem'}).then((res) => {
                if (res.result) {
                    window.LogTool('RedemptionDetainmentWindows')
                    Dialog.show({
                        title: res.result?.title || '提示',
                        content: res.result?.content || '确认赎回？',
                        closeOnAction: true,
                        closeOnMaskClick: true,
                        actions: [
                            [
                                {
                                    key: 'cancel',
                                    text: (res?.result?.button_list && res?.result?.button_list[0]?.text) || '确认赎回',
                                    style: {color: '#9aa0b1'},
                                    onClick: () => {
                                        window.LogTool('RedemptionDetainmentWindows_Yes')
                                        jump(url)
                                    },
                                },
                                {
                                    key: 'confirm',
                                    text: (res?.result?.button_list && res?.result?.button_list[1]?.text) || '再想一想',
                                    style: {color: '#0051CC'},
                                    onClick: () => {
                                        window.LogTool('RedemptionDetainmentWindows_No')
                                    },
                                },
                            ],
                        ],
                    })
                } else {
                    jump(url)
                }
            })
        }, 600),
        [],
    )

    const {asset_info, profit_info, profit_acc_info, indicators} = summary || {}
    return (
        Object.keys(data)?.length > 0 && (
            <div id="PortfolioAssets">
                {/* 资产 */}
                <div className="card">
                    <div className="flexBetween">
                        <div className="name">{name}</div>
                        <div
                            style={{color: '#0051CC'}}
                            onClick={() => {
                                window.LogTool({event: 'details'})
                                jump(top_button.url)
                            }}
                        >
                            {top_button?.text}
                        </div>
                    </div>
                    <div className="defaultFlex">
                        <span style={{color: '#545968', fontSize: '12px', marginRight: '8px'}}>{code}</span>
                        {tags &&
                            tags.map((tag, i) => {
                                return (
                                    <div key={tag + i} className="tag">
                                        {tag}
                                    </div>
                                )
                            })}
                    </div>
                    <div className="line"></div>
                    <div className="flexBetween">
                        <div>
                            <div style={{fontSize: '12px', color: '#545968'}} className="defaultFlex">
                                {asset_info.text}
                                <span style={{marginLeft: '4px'}}>{asset_info.date}</span>
                                <Eye
                                    color={'#9AA0B1'}
                                    storageKey={'PortfolioAssets'}
                                    style={{height: '24px'}}
                                    onChange={(_data) => {
                                        setShowEye(_data)
                                    }}
                                />
                            </div>
                            <div className="amount">{hideAmount(asset_info.value)}</div>
                        </div>
                        <div>
                            <div>
                                <span style={{fontSize: '12px', color: '#545968', marginRight: '4px'}}>
                                    {profit_info.text}
                                </span>
                                <span
                                    className="amount"
                                    style={{fontSize: '14px'}}
                                    dangerouslySetInnerHTML={{__html: hideAmount(`${profit_info.value}`)}}
                                />
                            </div>
                            <div className="defaultFlex">
                                <span style={{fontSize: '12px', color: '#545968', marginRight: '4px'}}>
                                    {profit_acc_info.text}
                                </span>
                                <span
                                    className="amount"
                                    style={{fontSize: '14px'}}
                                    dangerouslySetInnerHTML={{__html: hideAmount(`${profit_acc_info.value}`)}}
                                />
                                {profit_explain?.tool_type != 21 && (
                                    <img
                                        src="https://static.licaimofang.com/wp-content/uploads/2022/10/question.png"
                                        alt="qs"
                                        className={'portfolioCardBottomRateDescTip'}
                                        style={{marginLeft: '6px'}}
                                        onClick={() => {
                                            Modal.show({
                                                content: (
                                                    <div>
                                                        <div style={{textAlign: 'center'}}>
                                                            {profit_explain?.title}
                                                            <div
                                                                style={{
                                                                    fontSize: '12px',
                                                                    color: '#ddd',
                                                                    marginTop: '6px',
                                                                }}
                                                            >
                                                                {profit_explain?.start_date}~{profit_explain?.end_date}
                                                            </div>
                                                            <div
                                                                style={{margin: '16px 0'}}
                                                                dangerouslySetInnerHTML={{
                                                                    __html: profit_explain?.profit_holding,
                                                                }}
                                                            />
                                                            <div
                                                                style={{
                                                                    backgroundColor: '#F1F6FF',
                                                                    padding: '12px 0',
                                                                    fontSize: '12px',
                                                                    marginBottom: '12px',
                                                                }}
                                                            >
                                                                {profit_explain?.formula}
                                                            </div>
                                                            <div
                                                                style={{textAlign: 'left', lineHeight: '16px'}}
                                                                dangerouslySetInnerHTML={{
                                                                    __html: profit_explain?.content,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ),
                                                closeOnAction: true,
                                                actions: [
                                                    {
                                                        key: 'confirm',
                                                        text: '我知道了',
                                                    },
                                                ],
                                            })
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    {trade_notice?.desc && (
                        <TradeNotice
                            data={trade_notice}
                            style={{backgroundColor: '#F5F6F8'}}
                            textStyle={{color: Colors.lightBlackColor}}
                            iconColor={Colors.lightBlackColor}
                        />
                    )}

                    {/* 展开按钮 */}
                    <div
                        style={{textAlign: 'center', marginTop: '6px'}}
                        onClick={() => {
                            window.LogTool({event: 'more_details'})
                            setExpand((prev) => !prev)
                        }}
                    >
                        {expand ? <DownOutline /> : <UpOutline />}
                    </div>
                    {expand && (
                        <div className="expandBox flexBetween">
                            {indicators.map?.((item, index) => {
                                const {text, value} = item
                                return (
                                    <div key={index} style={{textAlign: 'center'}}>
                                        <div style={{fontSize: '12px', color: '#545968', marginBottom: '6px'}}>
                                            {text}
                                        </div>
                                        <div
                                            style={{
                                                fontFamily: ' DIN-Medium, DIN',
                                                fontSize: '12px',
                                                color: '#121D3A',
                                            }}
                                        >
                                            {value}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
                {/* 中控 */}
                <div
                    className={classNames(['card', console_info.type == 'adjust' ? 'adjustCard' : 'defaultCard'])}
                    style={{margin: '12px 0'}}
                >
                    <div style={{textAlign: 'center'}}>
                        <div className="consoleTitle" dangerouslySetInnerHTML={{__html: console_info.title}}></div>
                        <div className="consoleContent">
                            <div dangerouslySetInnerHTML={{__html: console_info.content}}></div>
                            {console_info.desc && (
                                <div
                                    style={{marginTop: '12px'}}
                                    dangerouslySetInnerHTML={{__html: console_info.desc}}
                                ></div>
                            )}
                        </div>
                        {console_info.notice && (
                            <div style={{fontSize: '12px', color: '#b9b7b7', marginTop: '12px', textAlign: 'left'}}>
                                {console_info.notice}
                            </div>
                        )}
                    </div>
                </div>
                {/* 图表 */}
                {chart_tabs ? <ChartTabs data={chart_tabs} /> : null}
                {tool_list?.length > 0 && <ToolMenusCard data={tool_list} style={{margin: '12px 0'}} />}
                {gather_list?.length > 0 && (
                    <div className="gatherCon">
                        {gather_list.map((item, index, arr) => {
                            const {label, url, value} = item
                            return (
                                <div
                                    key={index}
                                    className="flexBetween gatherItem"
                                    style={{borderBottomWidth: index == arr.length - 1 ? '0' : '1px'}}
                                    onClick={() => url && jump(url)}
                                >
                                    <span style={{color: '#545968'}}>{label}</span>
                                    {url ? (
                                        <RightOutline fontSize={'12px'} />
                                    ) : (
                                        <span style={{fontSize: '12px', color: '#121D3A', fontWeight: 'bold'}}>
                                            {value}
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
                <BottomDesc style={{marginTop: '40px', marginBottom: '100px'}} />
                <div className="fixedBtnCon defaultFlex">
                    {button_list.map((btn, i, arr) => {
                        const {avail, log_id, text, url} = btn
                        return i == 0 ? (
                            <div
                                key={i}
                                onClick={() => {
                                    log_id && window.LogTool({event: log_id})
                                    if (avail == 0) return
                                    accountJump(url)
                                }}
                                className="btn flexCenter"
                                style={{color: avail == 0 ? '#545968' : '#121d3a', width: '80px', height: '40px'}}
                            >
                                {text}
                            </div>
                        ) : (
                            <div
                                key={i}
                                onClick={() => {
                                    log_id && window.LogTool({event: log_id})
                                    if (avail == 0) return
                                    jump(url)
                                }}
                                style={{
                                    flex: 1,
                                }}
                                className={classNames('flexCenter', 'btn', [
                                    i == 1 && 'leftBtn',
                                    arr.length - 1 == i && 'rightBtn',
                                    avail == 0 && 'btnNoAvail',
                                ])}
                            >
                                {text}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    )
}

export default PortfolioAssets
