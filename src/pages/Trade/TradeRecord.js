/*
 * @Date: 2021-02-02 12:27:26
 * @Description:交易记录
 */
import React, {useState, useRef, useMemo} from 'react'
import {Tabs, Swiper, Ellipsis} from 'antd-mobile'

import {jump} from '~/utils'
import {Colors, Font} from '~/common/commonStyle'
import {tagColor} from '../../utils/appUtil.js'
import QueryString from 'qs'
import http from '~/service'
import FlatList from './components/FlatList'
import PageDataLoader from './components/PageDataLoader.js'
import styles from './TradeRecord.module.scss'
import Icon from 'react-native-vector-icons/dist/FontAwesome'
const requestData =
    (url) =>
    (params, {signal, next}) => {
        return http
            .get(url, params, null, 'kapi', signal)
            .then((res) => {
                if (res.code === '000000') {
                    const {has_more, list, next_offset} = res.result
                    // if (res.co)
                    next(null, {data: list, hasMore: has_more, extra: {offset: next_offset}})
                } else {
                    next(res)
                }
            })
            .catch((err) => {
                next(err)
            })
    }

const getTabArr = ({fund_code, platform_class, isMfb, poid, prod_code}) => {
    const tabMap = [
        {title: '全部', key: 0},
        {title: '转入', key: 1},
        {title: '转出', key: 2},
        {title: '申购', key: -35},
        {title: '赎回', key: 4},
        {title: '投顾服务', key: -1},
        {title: '调仓', key: 6},
        {title: '分红', key: 7},
    ]

    //0 全部 1 转入 2 转出 -35申购 4赎回  -1投顾服务  -2升级 6调仓 7分红
    let tradeType = [0, -35, 4, -1, 6, 7]
    const mfbType = [0, 1, 2]
    // 老逻辑, 从app中拷来的
    if (fund_code || platform_class == 10 || platform_class == 20 || platform_class == 80) {
        tradeType = [0, -35, 4, 7]
    }

    const currentTypes = isMfb ? mfbType : tradeType // DEBUG: tradeType

    const url = isMfb ? 'wallet/records/20210101' : '/order/records/20210101'
    const tabArr = currentTypes
        .map((t) => tabMap.find((tab) => tab.key === t))
        .map((t) => {
            const loader = new PageDataLoader({
                name: 'trade_record_' + t.title,
                initParams: {type: t.key, page: 1, fund_code, platform_class, poid, prod_code},
                fetcher: requestData(url),
            })
            return {...t, loader}
        })

    return tabArr
}

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

const renderItem = ({item}) => {
    return (
        item && (
            <div
                className={styles.card}
                key={item?.time}
                onClick={() => {
                    global.LogTool('CheckTradeRecordDetail', item.url?.params?.txn_id, item.url?.params?.type)
                    jump(item.url)
                }}
            >
                <div className={styles.cardContent}>
                    <div className={styles.flexBetween}>
                        <div className={styles.titleWrap}>
                            <div
                                className={styles.tagWrap}
                                style={{
                                    backgroundColor: tagColor(item?.type?.val).bg_color,
                                }}
                            >
                                <span className={styles.tag} style={{color: tagColor(item?.type?.val).text_color}}>
                                    {item?.type?.text}
                                </span>
                            </div>
                            <Ellipsis className={styles.title} direction="middle" content={item.name} />
                        </div>
                        <span className={styles.date}>{item.time}</span>
                    </div>
                    <div className={styles.itemsLine} style={{paddingTop: 13, paddingBottom: 13}}>
                        {item?.items.map((_item, _index, arr) => (
                            <div
                                key={_index}
                                className={styles.itemWrap}
                                style={{
                                    flex: 1,
                                    alignItems:
                                        _index === 0 ? 'flex-start' : _index === arr.length - 1 ? 'flex-end' : 'center',
                                }}
                            >
                                <span className={styles.light_text}>{_item.k}</span>
                                <span
                                    className={styles.num_text}
                                    style={{
                                        fontFamily: _index != item?.items.length - 1 ? Font.numMedium : null,
                                        color:
                                            _index == item?.items.length - 1
                                                ? tradeStuatusColor(_item.v.val)
                                                : Colors.defaultColor,
                                    }}
                                >
                                    <span>{_item.v.text || _item.v}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                    {item.notice ? (
                        <div className={styles.notice}>
                            <span className={styles.notice_text}>{item.notice}</span>
                        </div>
                    ) : null}
                </div>
                {item.error_msg ? (
                    <div className={styles.errorMsgBox}>
                        <span className={styles.errorMsg}>
                            {item.error_msg}&nbsp;
                            <Icon name={'angle-right'} size={14} color={Colors.red} />
                        </span>
                    </div>
                ) : null}
            </div>
        )
    )
}

const TradeRecord = () => {
    const params = QueryString.parse(window.location.href.split('?')[1]) || {}
    const {
        // adjust_name,
        fr = '',
        fund_code = '',
        poid = '',
        prod_code = '',
        tabActive: active = 0,
        platform_class = 0,
    } = params

    window.document.title = '交易记录'
    const isMfb = fr == 'mfb'

    const tabArr = useMemo(
        () => getTabArr({fund_code, platform_class, isMfb, poid, prod_code}),
        [fund_code, isMfb, platform_class, poid, prod_code],
    )
    const [tabActive, setActiveTab] = useState(active || 0)
    const [data, setData] = useState(
        tabArr.map((it, i) => {
            return {
                shown: i === tabActive ? true : false,
            }
        }),
    )

    const swiperRef = useRef()
    const listsRef = useRef([])

    // Toast.show('交易记录已更新', {duration: 500})

    const handleTabchange = (title) => {
        const tab = tabArr.find((it) => String(it.title) === title)
        const index = tabArr.indexOf(tab)

        swiperRef.current?.swipeTo(index)
    }

    const handleSwiperChange = (index) => {
        const tab = tabArr[index]
        setActiveTab(index)
        setData((preData) => {
            preData[index].shown = true
            return [...preData]
        })
        listsRef.current[index]?.scrollTop()
        tab.loader.refresh()
    }

    return (
        <div className={styles.page}>
            <div className={styles.fixHeader}>
                <Tabs
                    activeKey={tabArr[tabActive].title}
                    style={{'--active-title-color': Colors.defaultFontColor}}
                    onChange={handleTabchange}
                >
                    {tabArr.map((item) => (
                        <Tabs.Tab title={item.title} key={item.title}></Tabs.Tab>
                    ))}
                </Tabs>
            </div>
            <Swiper
                direction="horizontal"
                loop
                indicator={() => null}
                ref={swiperRef}
                defaultIndex={tabActive}
                onIndexChange={handleSwiperChange}
            >
                {data.map((item, index) => (
                    <Swiper.Item>
                        <div>
                            <FlatList
                                ref={(el) => (listsRef.current[index] = el)}
                                className={styles.container}
                                loader={tabArr[index].loader}
                                renderItem={renderItem}
                            />
                        </div>
                    </Swiper.Item>
                ))}
            </Swiper>
        </div>
    )
}

export default TradeRecord
