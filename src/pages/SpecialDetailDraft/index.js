/*
 * @Description:
 * @Autor: wxp
 * @Date: 2022-09-19 15:39:11
 */
import React, {useMemo, useRef, useState} from 'react'
import {Divider, Swiper, Toast, SpinLoading, Dialog} from 'antd-mobile'
import {useEffect} from 'react'
import http from '../../service'
import {inApp, isIOS, jump, storage} from '../../utils'
import styles from './index.module.scss'
import QueryString from 'qs'
import {DownOutline, RightOutline, UpOutline} from 'antd-mobile-icons'
import {throttle} from 'lodash'
import ProductList from '../../components/ProductList/index'
import Empty from '~/components/Empty'

const interactiveApp = throttle((scrollTop) => {
    if (scrollTop > 0) window.ReactNativeWebView?.postMessage?.(`scrolling=1`)
    else window.ReactNativeWebView?.postMessage?.(`scrolling=0`)
}, 300)

const SpecialDetailDraft = () => {
    const params = QueryString.parse(window.location.href.split('?')[1]) || {}
    const [data, setData] = useState(null)
    const [expand, setExpand] = useState(false)
    const [tabActive, setTabActive] = useState()
    const [prdTabActive, setTabPrdActive] = useState(0)
    const [bottomHeight, setBottomHeight] = useState(0)

    const tabActiveRef = useRef()

    const hasProduct = useMemo(() => {
        return data?.content_list?.[0]?.content?.groups?.[0]
            ? !data?.content_list?.[0]?.content?.groups?.[0]?.products?.items?.[0]
            : !data?.content_list?.[0]?.content?.products?.items?.[0]
    }, [data])

    useEffect(() => {
        tabActiveRef.current = tabActive
    }, [tabActive])

    const getData = () => {
        http.get('/subject/manage/info/20220901', params).then((res) => {
            if (res.code === '000000') {
                setData(res.result)
                !tabActiveRef.current && setTabActive(res.result?.content_list?.[0]?.type)
                window.ReactNativeWebView?.postMessage?.(`title="${res.result.title}"`)
                res.result.apply_info &&
                    window.ReactNativeWebView?.postMessage?.(`refuse=${JSON.stringify(res.result.apply_info)}`)
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
        }
        return () => {
            timer && clearInterval(timer)
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

    const handlerContainerScroll = (e) => {
        let scrollTop = e.currentTarget.scrollTop
        // app标题栏交互
        interactiveApp(scrollTop)
    }

    const handlerTabChange = (id) => {
        setTabActive(id)
    }
    const editComment = () => {
        let content = data?.content_list?.find((item) => item.type === 'comments')?.content?.items?.[0]?.content
        window.ReactNativeWebView?.postMessage?.(`writeComment=${content || ''}`)
    }

    const navToModifyContent = () => {
        jump({
            path: 'SpecailModifyContent',
            params: {
                ...params,
                scene: 'create',
            },
        })
    }

    const saveDraft = async (url) => {
        await Dialog.alert({
            content: '已成功保存为草稿，再次点击创建新专题可继续编辑',
            confirmText: <span className={styles.confirm}>我知道了</span>,
        })
        jump(url)
    }
    const submit = () => {
        const _submit = () => {
            http.post('/subject/manage/audit/submit/20220901', {subject_id: params.subject_id}).then((res) => {
                if (res.code === '000000') {
                    Toast.show(res.message || '提交成功')
                    setTimeout(() => {
                        jump(res.result.url)
                    }, 1000)
                } else {
                    Toast.show(res.message)
                }
            })
        }

        if (hasProduct) {
            return Dialog.alert({
                content: '请添加产品后再提交审核',
                confirmText: <span className={styles.confirm}>我知道了</span>,
            })
        }

        let emptyArticle = !data?.content_list?.[1]?.content?.items?.[0]
        if (emptyArticle) {
            return Dialog.confirm({
                content: '精选内容还未编辑，确定要提交审核？',
                confirmText: <span className={styles.confirm}>继续编辑</span>,
                cancelText: <span className={styles.concel}>确认提交</span>,
                onConfirm: () => {
                    setTabActive(data?.content_list?.[1]?.type)
                },
                onCancel: () => {
                    _submit()
                },
            })
        }

        let emptyComments = !data?.content_list?.[2]?.content?.items?.[0]
        if (emptyComments) {
            return Dialog.confirm({
                content: '评论还未编辑，确定要提交审核？',
                confirmText: <span className={styles.confirm}>继续编辑</span>,
                cancelText: <span className={styles.concel}>确认提交</span>,
                onConfirm: () => {
                    setTabActive(data?.content_list?.[2]?.type)
                },
                onCancel: () => {
                    _submit()
                },
            })
        }

        _submit()
    }

    const genProducts = (item) => {
        return (
            <div
                id={'tabCard-' + item.type}
                key={item.type}
                className={styles.tabCard}
                style={{paddingTop: '0.24rem', paddingBottom: '0.24rem'}}
            >
                {item?.content?.groups?.[0] ? (
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
                                }}
                            >
                                {itm.name}
                            </div>
                        ))}
                    </div>
                ) : null}

                {item?.content?.groups?.[0] || item?.content?.products?.items?.[0] ? (
                    <>
                        <div className={styles.prodTabCards}>
                            <ProductList
                                data={
                                    item?.content?.groups?.[0]
                                        ? item?.content?.groups?.[prdTabActive]?.products?.items
                                        : item?.content?.products?.items
                                }
                            />
                        </div>
                        {item.bottom_btn ? (
                            <div
                                className={styles.editPlainBtnWrap}
                                onClick={() => {
                                    jump(item.bottom_btn?.url)
                                }}
                            >
                                <img
                                    src="https://static.licaimofang.com/wp-content/uploads/2022/10/subject_edit@3x.png"
                                    alt=""
                                    style={{width: '0.32rem', height: '0.32rem', marginRight: '0.08rem'}}
                                />
                                <span>{item.bottom_btn?.text}</span>
                            </div>
                        ) : null}
                    </>
                ) : (
                    <Empty>
                        <div className={styles.emptyTitle}>暂无相关产品</div>
                        <div className={styles.emptyDesc}>请点击按钮进行添加</div>
                        <div className={styles.editBtnWrap}>
                            {item.bottom_btn ? (
                                <Button
                                    title={item.bottom_btn?.text}
                                    style={{marginTop: '10px'}}
                                    onClick={() => {
                                        jump(item.bottom_btn?.url)
                                    }}
                                />
                            ) : null}
                        </div>
                    </Empty>
                )}
            </div>
        )
    }
    const genArticles = (item) => {
        return (
            <div id={'tabCard-' + item.type} key={item.type} className={styles.tabCard}>
                {item?.content?.items?.[0] ? (
                    <>
                        {item?.content?.items?.map((itm, idx) => (
                            <div
                                key={idx}
                                onClick={() => {
                                    jump(itm.url)
                                }}
                            >
                                {idx > 0 && <Divider style={{width: '100%', color: '#e9eaef', margin: 0}} />}
                                <div className={styles.articleCard}>
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
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '6px',
                                                    objectFit: 'cover',
                                                }}
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
                        {item.bottom_btn ? (
                            <div
                                className={styles.editPlainBtnWrap}
                                style={{paddingBottom: '0.24rem'}}
                                onClick={() => {
                                    navToModifyContent()
                                }}
                            >
                                <img
                                    src="https://static.licaimofang.com/wp-content/uploads/2022/10/subject_edit@3x.png"
                                    alt=""
                                    style={{width: '0.32rem', height: '0.32rem', marginRight: '0.08rem'}}
                                />
                                <span>{item.bottom_btn?.text}</span>
                            </div>
                        ) : null}
                    </>
                ) : (
                    <Empty>
                        <div className={styles.emptyTitle}>暂无精选内容</div>
                        <div className={styles.emptyDesc}>请点击按钮进行添加</div>
                        <div className={styles.editBtnWrap}>
                            {item.bottom_btn ? (
                                <Button
                                    title={item.bottom_btn?.text}
                                    style={{marginTop: '10px'}}
                                    onClick={() => {
                                        // jump(item.bottom_btn?.url)
                                        navToModifyContent()
                                    }}
                                />
                            ) : null}
                        </div>
                    </Empty>
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
            >
                {item?.content?.items?.[0] ? (
                    <>
                        {item?.content?.items?.map((itm) => (
                            <CommentItem item={itm} key={itm.id} />
                        ))}
                        {item?.content?.has_more && (
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
                        )}
                        {item.bottom_btn ? (
                            <div
                                className={styles.editPlainBtnWrap}
                                onClick={() => {
                                    editComment()
                                }}
                            >
                                <img
                                    src="https://static.licaimofang.com/wp-content/uploads/2022/10/subject_edit@3x.png"
                                    alt=""
                                    style={{width: '0.32rem', height: '0.32rem', marginRight: '0.08rem'}}
                                />
                                <span>{item.bottom_btn?.text}</span>
                            </div>
                        ) : null}
                    </>
                ) : (
                    <Empty>
                        <div className={styles.emptyTitle}>暂无专题评论</div>
                        <div className={styles.emptyDesc}>请点击按钮添加首条评论</div>
                        {item.bottom_btn ? (
                            <Button title={item.bottom_btn?.text} style={{marginTop: '10px'}} onClick={editComment} />
                        ) : null}
                    </Empty>
                )}
            </div>
        )
    }

    return data ? (
        <div
            className={styles.container}
            onScroll={handlerContainerScroll}
            style={{paddingBottom: bottomHeight + 'px'}}
        >
            <div className={styles.topBgWrap}>
                <img alt="" src={data?.background_img} className={styles.topBg}></img>
                {!inApp && <div className={styles.topTitle}>{data?.name}</div>}
                <div
                    className={styles.topUpdTime}
                    style={{top: isIOS() && inApp ? '1.66rem' : !inApp ? '1.02rem' : '1.46rem'}}
                >
                    {data?.title_desc}
                </div>
                <div className={styles.topBgMask}></div>
            </div>
            <div className={styles.main}>
                {data?.desc_card && (
                    <div
                        className={styles.selectedComments}
                        style={{
                            backgroundColor: true ? 'linear-gradient(180deg, #E7EEFF 0%, #FFFFFF 100%)' : '#fff',
                        }}
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
                                {data?.desc_card?.content?.slice(0, expand ? data?.desc_card?.content?.length : 80)}
                                {data?.desc_card?.content?.length > 80 && !expand ? '...' : ''}
                            </span>
                            {data?.desc_card?.content?.length > 80 && (
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
                <div className={styles.tabsWrap} id="tabsWrap">
                    {data?.content_list?.map?.((item, idx) => (
                        <div
                            className={styles.tabItem}
                            key={idx + item.type}
                            onClick={() => {
                                if (['articles', 'comments'].includes(item.type) && hasProduct) return
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
                <div id="bottomCardsWrap">
                    {(() => {
                        const item = data?.content_list.find((item) => item.type === tabActive)
                        switch (tabActive) {
                            case 'products':
                                return genProducts(item)
                            case 'articles':
                                return genArticles(item)
                            case 'comments':
                                return genComments(item)
                            default:
                                return null
                        }
                    })()}
                </div>
            </div>
            <div
                className={styles.bottomWrap}
                onLoad={(e) => {
                    setBottomHeight(e.currentTarget.offsetHeight)
                }}
            >
                {data?.create_buttons && (
                    <>
                        <div className={styles.bottomLeftBtn} onClick={() => saveDraft(data?.create_buttons?.[0]?.url)}>
                            {data?.create_buttons?.[0]?.text}
                        </div>
                        <div className={styles.bottomRightBtn} onClick={submit}>
                            {data?.create_buttons?.[1]?.text}
                        </div>
                    </>
                )}
                {data?.edit_button && (
                    <button
                        className={styles.bottomLongBtn}
                        disabled={data.edit_button.avail !== 1}
                        onClick={() => {
                            jump(data?.edit_button?.url)
                        }}
                    >
                        {data?.edit_button?.text}
                    </button>
                )}

                <img
                    style={{height: 0, width: 0}}
                    src={'https://static.licaimofang.com/wp-content/uploads/2022/09/yh@3x.png'}
                    alt=""
                />
            </div>
        </div>
    ) : (
        <div className={styles.loadingContainer}>
            <SpinLoading />
        </div>
    )
}

export default SpecialDetailDraft

const CommentItem = ({item, isChild = false}) => {
    return (
        <div className={styles.commentCard} style={{paddingBottom: isChild ? 0 : '0.2rem'}}>
            <img src={item?.user_info?.avatar} alt="" className={styles.commentItemAvatar} />
            <div className={styles.commentCardMain}>
                <div className={styles.commentCardHeader}>
                    <div className={styles.commentNick}>{item?.user_info?.nickname}</div>
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

const Button = ({title, style = {}, onClick}) => {
    return (
        <div className={styles.buttonWrap} style={style} onClick={onClick}>
            {title}
        </div>
    )
}
