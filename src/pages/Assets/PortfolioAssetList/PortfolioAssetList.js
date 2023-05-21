/*
 * @Date: 2022-12-13 11:06:05
 * @Description: 持仓品类页
 */
import React, {useEffect, useState} from 'react'
import {getUrlParams, jump} from '~/utils'
// import AdInfo from '../components/AdInfo/AdInfo';
// import PointCard from '../components/PointCard/PointCard';
import ToolMenusCard from '../components/ToolMenusCard/ToolMenusCard'
import {getHold, getData as _getData} from './service'
import './index.scss'
import {RightOutline} from 'antd-mobile-icons'
import Eye from '../components/Eye/Eye'
import sortImg from '~/image/icon/sort.png'
import sortUp from '~/image/icon/sortUp.png'
import sortDown from '~/image/icon/sortDown.png'
import {Colors} from '~/common/commonStyle'
import TagInfo from '../components/TagInfo/TagInfo'
import BottomDesc from '~/components/BottomDesc'
import {RenderAlert} from '../components/RenderAlert/RenderAlert'
import TradeNotice from '../components/TradeNotice/TradeNotice'
import Empty from '~/components/Empty'
const PortfolioAssetList = ({location}) => {
    const [showEye, setShowEye] = useState('true')
    const [data, setData] = useState({})
    const [hold, setHold] = useState({})
    const {type = 30} = getUrlParams(location.search)
    const [refreshing, setRefreshing] = useState(false)
    const init = (refresh) => {
        refresh && setRefreshing(true)
        getData()
        getHoldData({type})
        setRefreshing(false)
    }
    const getData = async () => {
        let res = await _getData({type})
        setData(res.result)
    }
    const getHoldData = async (params) => {
        let res = await getHold(params)
        document.title = res.result?.title
        setHold(res.result)
    }
    const handleSort = (_data) => {
        if (_data.sort_key) {
            getHoldData({
                type,
                sort_key: _data?.sort_key,
                sort_type: _data?.sort_type == 'asc' ? '' : _data?.sort_type == 'desc' ? 'asc' : 'desc',
            })
        }
    }
    useEffect(() => {
        init()
    }, [])
    const handleSortText = (isSort, text, activeText) => {
        if (activeText && isSort) {
            return text.split('|')?.map((item, index) =>
                item == activeText ? (
                    <span style={{color: '#333'}}>
                        {index == 1 ? '|' : ''} {activeText} {index == 0 ? '|' : ''}
                    </span>
                ) : (
                    item
                ),
            )
        }
        return text
    }
    const {summary = {}} = hold
    return (
        Object.keys(data)?.length > 0 && (
            <div className="PortfolioAssetList">
                <div
                    className="headerCon"
                    onClick={() => {
                        window.LogTool('assets_card')
                        jump(summary?.url)
                    }}
                >
                    <div className="rightIcon">
                        <RightOutline color="#545968" fontSize={12} />
                    </div>
                    <div className="assetInfo defaultFlex">
                        <span>总资产(元)</span>
                        <span style={{fontSize: '11px', marginLeft: '8px'}}>{summary?.asset_info?.date}</span>
                        <Eye
                            color={'#9AA0B1'}
                            style={{height: '20px'}}
                            storageKey={'PortfolioAssetListEye'}
                            onChange={(_data) => {
                                setShowEye(_data)
                            }}
                        />
                    </div>
                    {showEye === 'true' ? (
                        <div className="assetValue">{summary?.asset_info?.value}</div>
                    ) : (
                        <div className="assetValue">****</div>
                    )}
                    <div className="defaultFlex profitCon">
                        <div style={{flex: 1}}>
                            <span className="assetInfo" style={{fontSize: '11px'}}>
                                {summary?.profit_acc_info?.text}
                            </span>
                            <span
                                className="profitVaule"
                                style={{
                                    color: showEye === 'true' ? summary?.profit_acc?.color || '#121D3A' : '#121D3A',
                                }}
                            >
                                {' '}
                                {showEye === 'true' ? summary?.profit_acc_info?.value : '****'}
                            </span>
                        </div>
                        <div style={{flex: 1}}>
                            <span className="assetInfo" style={{fontSize: '11px'}}>
                                {summary?.profit_acc?.text}
                            </span>
                            <span
                                className="profitVaule"
                                style={{
                                    color: showEye === 'true' ? summary?.profit_acc?.color || '#121D3A' : '#121D3A',
                                }}
                            >
                                {' '}
                                {showEye === 'true' ? summary?.profit_acc?.value : '****'}
                            </span>
                        </div>
                    </div>
                    {hold?.trade_notice && (
                        <TradeNotice
                            data={hold?.trade_notice}
                            style={{backgroundColor: '#F5F6F8'}}
                            textStyle={{color: Colors.lightBlackColor}}
                            iconColor={Colors.lightBlackColor}
                        />
                    )}
                </div>
                {/* 运营位 */}
                {/* {data?.ad_info && <AdInfo ad_info={data?.ad_info} />} */}
                {/* 工具菜单 */}
                {data?.tool_list && <ToolMenusCard data={data?.tool_list} />}
                {/* 投顾观点 */}
                {/* {data?.point_info ? <PointCard data={data?.point_info} /> : null} */}

                <div className="defaultFlex" style={{marginBottom: '8px', paddingTop: '8px'}}>
                    <div className="tag"></div>
                    <div className="holdTitle">
                        {'持仓'}({hold?.holding_info?.number})
                    </div>
                </div>
                <div className="holdCard defaultFlex">
                    {hold?.holding_info?.header_list?.map((head, index) => (
                        <div
                            key={index}
                            onClick={() => handleSort(head)}
                            style={{
                                flex: index == 0 ? 1.4 : 1,
                                color: Colors.lightGrayColor,
                                fontSize: 11,
                                textAlign: index == 0 ? 'left' : 'right',
                            }}
                        >
                            {handleSortText(head.sort_type, head.text, head.sort_name)}
                            {head?.sort_key && (
                                <img
                                    src={head?.sort_type == '' ? sortImg : head?.sort_type == 'asc' ? sortUp : sortDown}
                                    alt=""
                                    style={{width: 7, height: 12, marginBottom: -1.5, marginLeft: 1}}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div>
                    {hold?.holding_info?.product?.length > 0 ? (
                        hold?.holding_info?.product?.map((product, index) => {
                            const {
                                log_id,
                                adviser,
                                company_name,
                                holding_days,
                                profit_acc,
                                remind_info,
                                tag_info,
                                tool_tag_info,
                                url,
                                name,
                                anno,
                                amount,
                                share,
                                nav,
                                cost_nav,
                                profit,
                                code,
                                signal_icons, //工具icon
                                open_tip, //私募下期开放时间
                                profit_title,
                                right_top_tag,
                            } = product
                            return (
                                <div
                                    className="holdCard"
                                    key={index}
                                    onClick={() => {
                                        if (tag_info?.log_id) {
                                            window.LogTool('guide_click', '卡片标签 ', tag_info.log_id)
                                        }
                                        window.LogTool('single_card', log_id)
                                        jump(url)
                                    }}
                                >
                                    <div className="defaultFlex" style={{marginBottom: '5px'}}>
                                        <div className="name">{name}</div>
                                        {!!tag_info && <TagInfo data={tag_info} />}
                                    </div>
                                    <div className="defaultFlex">
                                        <div style={{flex: 1.4}}>
                                            <div className="holdDay">{holding_days}</div>
                                            <div className="adviser">{adviser}</div>
                                        </div>
                                        <div style={{flex: 1, textAlign: 'right'}}>
                                            <div className="darkText">{showEye === 'true' ? amount : '****'}</div>
                                            <div className="lightText"> {showEye === 'true' ? share : '****'}</div>
                                        </div>
                                        <div style={{flex: 1, textAlign: 'right'}}>
                                            <div className="darkText">{showEye === 'true' ? nav : '****'}</div>
                                            <div className="lightText"> {showEye === 'true' ? cost_nav : '****'}</div>
                                        </div>
                                        <div style={{flex: 1, textAlign: 'right'}}>
                                            {showEye === 'true' ? (
                                                <div
                                                    dangerouslySetInnerHTML={{__html: profit_acc}}
                                                    className="profit"
                                                />
                                            ) : (
                                                '****'
                                            )}
                                        </div>
                                    </div>
                                    {/* {!!remind_info && <RenderAlert alert={remind_info} />} */}
                                </div>
                            )
                        })
                    ) : (
                        <div className="holdCard">
                            <Empty text="暂无数据" />
                        </div>
                    )}
                </div>
                <BottomDesc />
            </div>
        )
    )
}

export default PortfolioAssetList
