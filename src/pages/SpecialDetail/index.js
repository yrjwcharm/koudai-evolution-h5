/*
 * @Description:
 * @Autor: wxp
 * @Date: 2022-09-19 15:39:11
 */
import React, {useCallback, useMemo, useRef, useState} from 'react'
import {Divider, Swiper, Toast, SpinLoading} from 'antd-mobile'
import {useEffect} from 'react'
import http from '../../service'
import {inApp, isIOS, jump, logtool, storage} from '../../utils'
import styles from './index.module.scss'
import QueryString from 'qs'
import {DownOutline, RightOutline, UpOutline} from 'antd-mobile-icons'
import {throttle} from 'lodash'
import ProductList from '../../components/ProductList/index'
import Empty from '~/components/Empty'
import ShareBanner from '~/components/ShareBanner'
import {getConfig} from '~/utils/getConfig'
import {share} from '~/utils/share'
import copyText from '~/utils/copyText'

const interactiveApp = throttle((scrollTop) => {
    if (scrollTop > 0) window.ReactNativeWebView?.postMessage?.(`scrolling=1`)
    else window.ReactNativeWebView?.postMessage?.(`scrolling=0`)
}, 300)

const SpecialDetail = () => {
    const params = QueryString.parse(window.location.href.split('?')[1]) || {}
    const [data, setData] = useState(null)
    const [expand, setExpand] = useState(false)
    const [tabsFixed, setTabsFixed] = useState(false)
    const [tabActive, setTabActive] = useState()
    const [stickyTop, setStickyTop] = useState(0)
    const [prdTabActive, setTabPrdActive] = useState(0)
    const copyValue = useRef('')
    const containerRef = useRef(null)
    const scrollTimer = useRef()
    const tabsPosition = useRef({offsetTop: 0, offsetLeft: 0, offsetHeight: 0})
    const tabCardsTop = useRef({})
    const tabCardsTopArr = useRef([])
    const updateElInfoRef = useRef()
    const articlesCardInViewTimes = useRef(0)
    const commentsCardInViewTimes = useRef(0)
    const productCardLayoutState = useRef(false)

    if (!inApp) {
        params.scene = 'h5'
    }

    const viewPortHeight = useRef(
        window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
    ).current

    const scrollWrapStyle = useMemo(() => {
        const wrapStyle =
            params?.is_preview == 1 && params.examine ? {paddingBottom: '0.5rem'} : {height: '100vh', overflowY: 'auto'}
        if (!inApp && data?.top_reg) {
            wrapStyle.paddingTop = '1.28rem'
        }
        return wrapStyle
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    const descContentSliceData = useMemo(() => {
        let i = 0
        let sliceNum = 0
        const content = data?.desc_card?.content
        while (sliceNum <= 80 && i < content?.length) {
            sliceNum = sliceNum + (escape(content[i++]).includes('%u') ? 1 : 0.5)
        }
        return {
            sliceNum: sliceNum > 80 ? sliceNum : Infinity,
            i: i,
        }
    }, [data])

    const getData = () => {
        setStickyTop(storage.getItem('loginStatus')?.navBarHeight || 0)
        http.get('/products/subject/detail/20220901', params).then((res) => {
            if (res.code === '000000') {
                // copyText('123456阿萨德卡上扣')
                if (res.result.polaris_favor) {
                    copyValue.current = res.result.polaris_favor
                }

                setData(res.result)
                setTabActive(res.result?.content_list?.[0]?.type)

                if (res.result.kyc_part?.answered === false) {
                    showTestPanel(res.result.kyc_part)
                }

                if (!productCardLayoutState.current) {
                    productCardLayoutState.current = true
                    let item = res.result?.content_list.find((item) => item.type === 'products')
                    item &&
                        logtool({
                            event: 'relatedProduction_show',
                            plate_id: item?.content?.groups?.[0]?.name,
                            ctrl: res.result.id,
                            oid: (item?.content?.groups?.[0]
                                ? item?.content?.groups?.[0]?.products?.items
                                : item?.content?.products?.items
                            )
                                .map((item) => item.id)
                                ?.join(),
                        })
                }
            } else {
                Toast.show(res.message)
            }
        })
    }

    useEffect(() => {
        let timer
        if (inApp) {
            const {timeStamp} = QueryString.parse(window.location.href.split('?')[1]) || {}
            timer = setInterval(() => {
                const loginStatus = storage.getItem('loginStatus')
                if (loginStatus?.timeStamp === timeStamp) {
                    clearInterval(timer)
                    getData()
                }
            }, 10)
        } else {
            getData()
            getConfig(configShare)
        }
        return () => {
            timer && clearInterval(timer)

            scrollTimer.current && clearTimeout(scrollTimer.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        window.document.addEventListener('reload', getData)
        return () => {
            window.document.removeEventListener('reload', getData)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        let el = document.getElementsByClassName('AppRouter')?.[0]
        let MutationObserver = window.MutationObserver || window.webkitMutationObserver || window.MozMutationObserver
        let mutationObserver = new MutationObserver(function (mutations) {
            window.ReactNativeWebView?.postMessage(el?.scrollHeight)
            updateElInfoRef.current?.()
        })
        mutationObserver.observe(el, {
            characterData: true,
            subtree: true,
            childList: true,
        })
        return () => {
            mutationObserver.disconnect()
        }
    }, [])

    const configShare = () => {
        http.get(
            '/share/common/info/20210101',
            {
                name: 'SpecialDetail',
                params: JSON.stringify({
                    link: window.location.origin + window.location.pathname,
                    params,
                }),
            },
            false,
        ).then((res) => {
            if (res.code === '000000') {
                share({
                    title: res.result.share_info.title,
                    content: res.result.share_info.content,
                    url: res.result.share_info.link,
                    img: res.result.share_info.avatar,
                })
            }
        })
    }

    const handlerContainerScroll = (e) => {
        let scrollTop = e.currentTarget.scrollTop
        // let scrollHeight = e.currentTarget.scrollHeight
        // let clientHeight = e.currentTarget.clientHeight
        // 曝光埋点
        handlerArticlesCardShowLog(scrollTop + viewPortHeight)
        handlerCommentsCardShowLog(scrollTop + viewPortHeight)
        // app标题栏交互
        interactiveApp(scrollTop)

        // tabs固定
        let {offsetTop} = tabsPosition.current
        if (offsetTop && scrollTop >= offsetTop - stickyTop && !tabsFixed) {
            setTabsFixed(true)
        } else if (offsetTop && scrollTop < offsetTop - stickyTop && tabsFixed) {
            setTabsFixed(false)
        }
        // tabs选中
        let arr = tabCardsTopArr.current
        // if (scrollHeight - clientHeight - 15 <= scrollTop) {
        //     let [lastId] = arr[arr.length - 1]
        //     scrollTop >= clientHeight - stickyTop - 10 && tabActive !== lastId && setTabActive(lastId)
        //     return
        // }

        for (let i = arr.length - 1; i > -1; i--) {
            let [id, cardTop] = arr[i]
            if (scrollTop + 10 > cardTop - tabsPosition.current.offsetHeight - stickyTop) {
                tabActive !== id && setTabActive(id)
                return
            }
        }
    }

    const updateElInfo = useCallback(() => {
        let el = document.getElementById('tabsWrap')
        if (el?.style?.position !== 'fixed') {
            tabsPosition.current.offsetTop = el?.offsetTop || 0
            tabsPosition.current.offsetLeft = el?.offsetLeft || 0
            tabsPosition.current.offsetHeight = el?.offsetHeight || 0
        }

        data?.content_list?.forEach?.(({type}) => {
            tabCardsTop.current[type] = document.getElementById('tabCard-' + type)?.offsetTop
        })
        tabCardsTopArr.current = Object.entries(tabCardsTop.current)
    }, [data])

    useEffect(() => {
        updateElInfoRef.current = updateElInfo
    }, [updateElInfo])

    const handlerTabChange = (id) => {
        const scrollTop = containerRef.current?.scrollTop
        const scrollHeight = containerRef.current?.scrollHeight
        const clientHeight = containerRef.current?.clientHeight

        const duration = 300
        const xSplitNumber = 20
        const xInterVal = 1 / xSplitNumber
        let xIndex = 0

        let targetTop = tabCardsTop.current[id] - tabsPosition.current.offsetHeight - stickyTop
        const maxDistance = scrollHeight - clientHeight

        if (targetTop > maxDistance) targetTop = maxDistance

        let needMoveSum = targetTop - scrollTop

        function easeOutCubic(x) {
            return 1 - Math.pow(1 - x, 3)
        }

        const runScroll = () => {
            scrollTimer.current = setTimeout(() => {
                let yRate = easeOutCubic(xIndex)
                if (yRate === 1) {
                    clearTimeout(scrollTimer.current)
                    scrollTimer.current = undefined
                    return
                }
                xIndex += xInterVal
                let distance = (needMoveSum * yRate).toFixed(2)
                containerRef.current?.scrollTo?.(0, scrollTop + +distance)
                requestAnimationFrame(() => {
                    runScroll()
                })
            }, duration / xSplitNumber)
        }

        runScroll()
    }

    const handlerArticlesCardShowLog = (y) => {
        if (!articlesCardInViewTimes.current && y > tabCardsTop.current.articles) {
            articlesCardInViewTimes.current++
            logtool({event: 'SelectedContent_show'})
        }
    }

    const handlerCommentsCardShowLog = (y) => {
        if (!commentsCardInViewTimes.current && y > tabCardsTop.current.comments) {
            commentsCardInViewTimes.current++
            logtool({event: 'discuss_show'})
        }
    }

    const showTestPanel = (kyc_part) => {
        const str = JSON.stringify(kyc_part || data?.kyc_part)
        window.ReactNativeWebView?.postMessage(`showTest=${str}`)
        console.log(`postMessage:showTest=${str}`)
    }

    // 点击评测调整按钮
    const handleTestClick = (top_button) => {
        if (top_button?.url) {
            jump(top_button.url)
        } else {
            showTestPanel()
        }
    }
    const copy = () => {
        if (copyValue.current && !inApp) {
            copyText(copyValue.current)
        }
    }
    useEffect(() => {
        document.addEventListener('click', copy, true)
        window.answer = function (configStr) {}
        return () => {
            window.answer = undefined
            document.removeEventListener('click', copy, true)
        }
    }, [])

    const genTabsList = () => {
        return (
            <>
                <div
                    className={styles.tabsWrap}
                    style={
                        tabsFixed
                            ? {
                                  position: 'fixed',
                                  top: stickyTop + 'px',
                                  left: tabsPosition.current.offsetLeft || 0,
                                  marginTop: 0,
                                  zIndex: 100,
                              }
                            : {}
                    }
                    id="tabsWrap"
                >
                    {data?.content_list?.map?.((item, idx) => (
                        <div
                            className={styles.tabItem}
                            key={idx + item.type}
                            onClick={() => {
                                const map = {
                                    articles: 'SelectedContent',
                                    comments: 'discuss_click',
                                }
                                map[item.type] &&
                                    logtool?.({
                                        event: map[item.type],
                                    })
                                handlerTabChange(item.type)
                            }}
                        >
                            <span
                                style={{
                                    color: item.type === tabActive ? ' #121d3a' : '#545968',
                                    fontWeight: item.type === tabActive ? 'bold' : 'normal',
                                }}
                            >
                                {item.name}
                            </span>
                            {
                                <div
                                    className={styles.tabItemUnderline}
                                    style={{opacity: item.type === tabActive ? 1 : 0}}
                                ></div>
                            }
                        </div>
                    ))}
                </div>
                <div style={{height: tabsFixed ? tabsPosition.current.offsetHeight + 'px' : 0}}></div>
                <div id="bottomCardsWrap">
                    {data?.content_list?.map((item) => {
                        switch (item.type) {
                            case 'products':
                                return genProducts(item)
                            case 'articles':
                                return genArticles(item)
                            case 'comments':
                                return genComments(item)
                            default:
                                return null
                        }
                    })}
                </div>
            </>
        )
    }

    const genProducts = (item) => {
        // 如果做过kyc 且，产品为空才显示匹配为空的提示
        if (data?.kyc_part?.answered === true) {
            if (item?.content?.groups?.[0] === undefined && item?.content?.products?.items === undefined) {
                return (
                    <div className={styles.emptyTestWrap}>
                        <img
                            alt="icon"
                            className={styles.emptyTest_img}
                            src={require('~/image/empty-icon.png').default}
                        ></img>
                        <label className={styles.emptyTest_title}>暂无匹配的策略</label>
                        <label className={styles.emptyTest_desc}>建议调整投资需求再试试～</label>
                    </div>
                )
            }
        }
        return (
            <div
                id={'tabCard-' + item.type}
                key={item.type}
                className={styles.tabCard}
                style={{paddingTop: '0.24rem', paddingBottom: '0.24rem'}}
            >
                {item?.content?.groups?.[0] && (
                    <div className={styles.prdTabs}>
                        {item?.content?.groups?.map?.((itm, idx) => (
                            <div
                                className={styles.prdTab}
                                key={idx}
                                style={{
                                    color: prdTabActive === idx ? '#0051CC' : '#121d3a',
                                    backgroundColor: prdTabActive === idx ? '#DEE8FF' : '#F5F6F8',
                                }}
                                onClick={() => {
                                    setTabPrdActive(idx)
                                    if (idx !== prdTabActive) {
                                        logtool({
                                            event: 'relatedProduction',
                                            plate_id: itm.name,
                                            ctrl: data.id,
                                            oid: (item?.content?.groups?.[0]
                                                ? item?.content?.groups?.[idx]?.products?.items
                                                : item?.content?.products?.items
                                            )
                                                .map((item) => item.id)
                                                ?.join(),
                                        })
                                        logtool({
                                            event: 'relatedProduction_show',
                                            plate_id: itm.name,
                                            ctrl: data.id,
                                            oid: (item?.content?.groups?.[0]
                                                ? item?.content?.groups?.[idx]?.products?.items
                                                : item?.content?.products?.items
                                            )
                                                .map((item) => item.id)
                                                ?.join(),
                                        })
                                    }
                                }}
                            >
                                {itm.name}
                            </div>
                        ))}
                    </div>
                )}

                <div className={styles.prodTabCards}>
                    <ProductList
                        data={
                            item?.content?.groups?.[0]
                                ? item?.content?.groups?.[prdTabActive]?.products?.items
                                : item?.content?.products?.items
                        }
                    />
                </div>
            </div>
        )
    }
    const genArticles = (item) => {
        return (
            <div
                id={'tabCard-' + item.type}
                key={item.type}
                className={styles.tabCard}
                onLoad={(e) => {
                    handlerArticlesCardShowLog(viewPortHeight)
                }}
            >
                {item?.content?.items?.map((itm, idx) => (
                    <div key={idx}>
                        {idx > 0 && <Divider style={{width: '100%', color: '#e9eaef', margin: 0}} />}
                        <div
                            className={styles.articleCard}
                            onClick={() => {
                                jump(itm.url)
                            }}
                        >
                            <div className={styles.articleLeft}>
                                <div className={styles.articleTitle}>{itm.title}</div>
                                <div className={styles.articleDesc}>
                                    <span>
                                        {(() => {
                                            let n = itm.author?.nickname || itm.album_name || item.cate_name
                                            n = n.trim()
                                            return n.length <= 6 ? n : n.slice(0, 6) + '...'
                                        })()}
                                    </span>
                                    <span style={{marginLeft: '5px'}}>{itm.view_num}阅读</span>
                                    <span style={{marginLeft: '5px'}}>{itm.favor_num}点赞</span>
                                </div>
                            </div>
                            {itm.cover && (
                                <div className={styles.articleRight}>
                                    <img
                                        alt=""
                                        src={itm.cover}
                                        style={{width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover'}}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {item?.content?.has_more && (
                    <>
                        <Divider style={{width: '100%', color: '#e9eaef', margin: 0}} />
                        <div
                            className={styles.cardMore}
                            onClick={() => {
                                jump(item?.content?.more?.url)
                            }}
                        >
                            点击查看更多
                            <RightOutline fontSize={11} />
                        </div>
                    </>
                )}
            </div>
        )
    }
    const genComments = (item) => {
        return (
            <div
                id={'tabCard-' + item.type}
                key={item.type}
                className={styles.tabCard}
                style={{paddingTop: '10px', paddingBottom: '10px'}}
                onLoad={(e) => {
                    handlerCommentsCardShowLog(viewPortHeight)
                }}
            >
                {item?.content?.items?.map((itm) => (
                    <CommentItem item={itm} key={itm.id} />
                ))}
                {item?.content?.has_more ? (
                    <div
                        className={styles.cardMore}
                        style={{borderTop: '0.5px solid #E9EAEF'}}
                        onClick={() => {
                            jump(item?.content?.more?.url)
                        }}
                    >
                        点击查看更多
                        <RightOutline fontSize={11} />
                    </div>
                ) : (
                    item?.content?.items?.[0] && (
                        <div className={styles.emptyDesc} style={{padding: '8px'}}>
                            已显示全部评论
                        </div>
                    )
                )}
                {item?.content?.items?.[0] ? null : (
                    <Empty>
                        <div>
                            <span className={styles.emptyDesc}>暂无评论</span>&nbsp;
                            <span
                                className={styles.emptyWrite}
                                onClick={() => {
                                    window.ReactNativeWebView?.postMessage?.(`writeComment=1`)
                                }}
                            >
                                我来写一条
                            </span>
                        </div>
                    </Empty>
                )}
            </div>
        )
    }
    // 评测列表
    const genTestList = () => {
        const {kyc_part} = data || {}
        if (!kyc_part) return null

        let showTestLine = false
        {
            const item = data?.content_list?.find((it) => it.type === 'products')
            // const item = {content: {}}
            if (item && (item?.content?.groups?.[0] || item?.content?.products?.items)) {
                showTestLine = true
            }
        }

        return (
            <>
                <div className={styles.testPanel}>
                    <div className={styles.panelHeader}>
                        <div className={styles.flexline}>
                            <img
                                alt="more"
                                className={styles.docIcon}
                                src={require('~/image/icon/document.png').default}
                            />
                            <label>{kyc_part?.title}</label>
                        </div>
                        {kyc_part?.top_button ? (
                            <button
                                onClick={() => handleTestClick(kyc_part?.top_button)}
                                disabled={kyc_part?.top_button?.avail !== 1}
                                className={styles.testBtnWrap}
                            >
                                <label>{kyc_part?.top_button?.text}</label>
                                <img
                                    alt="more"
                                    className={styles.moreIcon}
                                    src={require('~/image/icon/arrow_yellow.png').default}
                                />
                            </button>
                        ) : null}
                    </div>
                    <div className={styles.panelContent}>
                        {kyc_part?.questions?.map((it) => (
                            <div className={styles.testItem} key={it.question}>
                                <div className={styles.questionWrap}>
                                    <span className={styles.listsign}></span>
                                    <label className={styles.question}>{it.question}</label>
                                </div>
                                <label className={styles.answer}>{it.answer}</label>
                            </div>
                        ))}
                    </div>
                </div>
                {showTestLine ? (
                    <div className={styles.testTipWrap}>
                        <div className={styles.testLine}></div>
                        <label className={styles.testTip}>{kyc_part.tip}</label>
                    </div>
                ) : null}
            </>
        )
    }

    // 兼容问题列表没有获取到的情况
    if (!data) {
        return (
            <div className={styles.loadingContainer}>
                <SpinLoading />
            </div>
        )
    }

    return data ? (
        <div
            className={styles.container}
            ref={containerRef}
            onScroll={handlerContainerScroll}
            style={{...scrollWrapStyle}}
        >
            {/* 注册引导 */}
            {!inApp && data?.top_reg && <ShareBanner data={data?.top_reg} />}
            <div className={styles.topBgWrap}>
                <img alt="" src={data?.background_img} className={styles.topBg}></img>
                {(!inApp || params.examine) && <div className={styles.topTitle}>{data?.name}</div>}
                <div
                    className={styles.topUpdTime}
                    style={{
                        top:
                            isIOS() && inApp && !params.examine
                                ? '1.66rem'
                                : !inApp || params.examine
                                ? '1.02rem'
                                : '1.46rem',
                    }}
                >
                    {data?.title_desc}
                </div>
                <div className={styles.topBgMask}></div>
            </div>
            <div className={styles.main}>
                {data?.desc_card && (
                    <div
                        className={styles.selectedComments}
                        style={{backgroundColor: true ? 'linear-gradient(180deg, #E7EEFF 0%, #FFFFFF 100%)' : '#fff'}}
                    >
                        {!data?.desc_card?.icon ? (
                            <div className={styles.commentCardHeader1}>{data?.desc_card?.name}</div>
                        ) : (
                            <div className={styles.commentCardHeader2}>
                                <img alt="" src={data?.desc_card?.icon} className={styles.avatar} />
                                <div className={styles.nickName}>{data?.desc_card?.name}</div>
                            </div>
                        )}
                        <div className={styles.commentCardContent} style={{paddingBottom: expand ? '12px' : '0px'}}>
                            <img alt="" src={data?.desc_card?.content_icon} className={styles.commentCardQuates} />
                            <span style={{wordBreak: 'break-all'}}>
                                {data?.desc_card?.content?.slice(
                                    0,
                                    expand
                                        ? data?.desc_card?.content?.length
                                        : descContentSliceData.i -
                                              (data?.desc_card?.content?.length > descContentSliceData.sliceNum
                                                  ? 3
                                                  : 0),
                                )}
                                {data?.desc_card?.content?.length > descContentSliceData.sliceNum && !expand
                                    ? '...'
                                    : ''}
                            </span>
                            {data?.desc_card?.content?.length > descContentSliceData.sliceNum && (
                                <span
                                    className={styles.expandBtn}
                                    onClick={() => {
                                        setExpand((val) => !val)
                                    }}
                                >
                                    {expand ? '收起' : '展开'}
                                    {expand ? (
                                        <UpOutline color="#0051cc" fontSize={11} style={{marginLeft: '2px'}} />
                                    ) : (
                                        <DownOutline color="#0051cc" fontSize={11} style={{marginLeft: '2px'}} />
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                )}
                {data?.banner_list && (
                    <div className={styles.banner}>
                        <Swiper
                            style={{'--height': '1.2rem', '--border-radius': '6px'}}
                            loop={true}
                            indicatorProps={{style: {opacity: data?.banner_list.length > 1 ? 1 : 0}}}
                        >
                            {data?.banner_list?.map((item, index) => (
                                <Swiper.Item key={index}>
                                    <img
                                        src={item.img}
                                        style={{width: '100%', height: '100%'}}
                                        alt=""
                                        onClick={() => {
                                            jump(item.url)
                                        }}
                                    />
                                </Swiper.Item>
                            ))}
                        </Swiper>
                    </div>
                )}
                {genTestList()}
                {genTabsList()}
            </div>
        </div>
    ) : (
        <div className={styles.loadingContainer}>
            <SpinLoading />
        </div>
    )
}

export default SpecialDetail

const CommentItem = ({item, isChild = false}) => {
    const params = QueryString.parse(window.location.href.split('?')[1]) || {}
    const [favor, setFavor] = useState(item.is_liked)
    const [likeNum, setLikeNum] = useState(item.like_num)

    const handlerLike = () => {
        if (params.is_preview == 1) return
        http.post('/community/article/comment/like/20210101', {comment_id: item.id, is_like: +!favor}).then((res) => {
            if (res.code === '000000') {
                !favor &&
                    logtool({
                        page_id: 'SpecialDetail',
                        event: 'discusslike_click',
                    })
                setLikeNum((val) => val + (favor ? -1 : 1))
                setFavor((val) => !val)
            }
        })
    }
    return (
        <div className={styles.commentCard} style={{paddingBottom: isChild ? 0 : '0.2rem'}}>
            <img src={item?.user_info?.avatar} alt="" className={styles.commentItemAvatar} />
            <div className={styles.commentCardMain}>
                <div className={styles.commentCardHeader}>
                    <div className={styles.commentNick}>{item?.user_info?.nickname}</div>
                    <div className={styles.commentRight}>
                        <span className={styles.commentLikeNum}>{likeNum || 0}</span>
                        <img
                            alt=""
                            className={styles.commentLikeIcon}
                            src={
                                'https://static.licaimofang.com/wp-content/uploads/2022/09/like' +
                                (!!favor ? 1 : 2) +
                                '.png'
                            }
                            onClick={handlerLike}
                        />
                    </div>
                </div>
                <div className={styles.commentCardContent}>{item.content}</div>
                <div className={styles.commentCardDesc}>
                    <span className={styles.commentDate}>{item.created_at_human}</span>
                </div>
                {item.children?.[0] &&
                    item.children.map((itm) => <CommentItem item={itm} key={itm.id} isChild={true} />)}
            </div>
        </div>
    )
}
