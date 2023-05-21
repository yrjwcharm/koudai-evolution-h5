/* eslint-disable eqeqeq */
/*
 * @Date: 2021-03-15 13:57:34
 * @Description: 文章详情
 */
import React, {useEffect, useState, useRef, useCallback} from 'react'
import './index.css'
import http from '~/service'
import {Button} from 'antd-mobile-v2'
import {RightOutline} from 'antd-mobile-icons'
import empty from '~/image/empty-icon.png'
import questionBg from '~/image/bg/questionBg.png'
import questionIcon from '~/image/icon/question.png'
import answerIcon from '~/image/icon/answer.png'
import LoadingBg from '~/image/bg/loadingBg.png'
import Logo from '~/image/icon/text_logo.png'
import {getConfig, share} from '~/utils/WXUtils'
import Audio from '~/components/AudioPlay/index'
import {QuestionCard, VoiceCard, ArticleCard} from '~/components/Card'
import parse, {domToReact} from 'html-react-parser'
import Lazyload from 'react-lazyload'
import {inApp, jump, storage} from '~/utils'

import qs from 'qs'
import {debounce} from 'lodash'
import {VideoBox} from './Draft'

let progress = false
const Article = ({match}) => {
    const [data, setData] = useState({})
    const [loading, setLoading] = useState(true)
    const [recommendData, setRecommendData] = useState({})
    const timeRef = useRef(Date.now())
    const configShare = () => {
        http.get(
            '/community/article/status/20210101',
            {article_id: match.params?.id, ...qs.parse(window.location.search.split('?')[1])},
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
    const parseStrToReact = (content) => {
        const options = {
            replace: ({type, name, attribs, children}) => {
                if (type !== 'tag') {
                    return
                }

                if (attribs && attribs['data-lazy'] === 'img-lazy') {
                    return (
                        <Lazyload
                            offset={150}
                            overflow={true}
                            once
                            height={200}
                            // placeholder={
                            //   <div style={{background:'green',height:'200px'}}/>
                            // }
                        >
                            {domToReact(children)}
                        </Lazyload>
                    )
                }
            },
        }

        return parse(content, options)
    }
    const getData = (loading = true) => {
        loading && setLoading(true)
        http.get(
            '/community/article/20210101',
            {article_id: match.params?.id, ...qs.parse(window.location.search.split('?')[1])},
            false,
        )
            .then((res) => {
                if (res.code === '000000') {
                    setData(res.result)
                }
            })
            .finally(() => {
                setLoading(false)
            })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onFollowBtn = useCallback(
        debounce(
            () => {
                http.post(data?.follow_status === 1 ? '/follow/cancel/202206' : '/follow/add/202206', {
                    item_id: data?.author_id,
                    item_type: data?.item_type,
                }).then((res) => {
                    if (res.code === '000000') {
                        getData(false)
                    }
                })
            },
            300,
            {leading: true, trailing: false},
        ),
        [data],
    )
    useEffect(() => {
        let timer
        if (!inApp) {
            getData()
            getConfig(configShare)
        } else {
            const {timeStamp} = qs.parse(window.location.href.split('?')[1]) || {}
            if (timeStamp) {
                timer = setInterval(() => {
                    if (storage.getItem('loginStatus')?.timeStamp === timeStamp) {
                        clearInterval(timer)
                        getData()
                    }
                }, 10)
            } else getData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [match.params])
    const getContent = (content) => {
        content = content?.replace(/<img([^>|]+)>/g, function (all, $1) {
            return `<div data-lazy="img-lazy"><img ${$1}></div>`
        })

        try {
            return (
                <div className="articleContent" style={{padding: data?.type == 5 ? 0 : '0 8px'}}>
                    {parseStrToReact(content)}
                </div>
            )
        } catch (e) {
            return (
                <div
                    className="articleContent"
                    style={{padding: data?.type == 5 ? 0 : '0 8px'}}
                    dangerouslySetInnerHTML={{__html: content}}
                />
            )
        }
    }
    useEffect(() => {
        let count = 0
        let timer = ''
        if (Object.keys(data).length > 0) {
            window.ReactNativeWebView?.postMessage(document.querySelector('.articleContainer').scrollHeight)
            timer = setInterval(() => {
                if (count < 10) {
                    count++
                    window.ReactNativeWebView?.postMessage(document.querySelector('.articleContainer').scrollHeight)
                } else {
                    clearInterval(timer)
                }
            }, 1000)
        }
        return () => {
            clearInterval(timer)
        }
    }, [data])
    useEffect(() => {
        http.get('/community/article/recommend/20210524', {
            id: match.params?.id,
            ...qs.parse(window.location.search.split('?')[1]),
        }).then((result) => {
            setRecommendData(result.result)
        })
    }, [match.params])
    useEffect(() => {
        if (Object.keys(data).length > 0 && !loading) {
            document.querySelectorAll('.articleContainer a').forEach((item) => {
                item.addEventListener(
                    'click',
                    (e) => {
                        if (inApp) {
                            e.preventDefault()
                            const url = item.getAttribute('url')
                            if (url) return window.ReactNativeWebView.postMessage(`url=${url}`)
                            const id = item.href?.split('/article/')[1]
                            // console.log(`article_id=${id}`);
                            id && window.ReactNativeWebView.postMessage(`article_id=${id}`)
                        }
                    },
                    false,
                )
            })
        }
    }, [data, loading])
    useEffect(() => {
        if (inApp) return
        document.querySelector('.AppRouter').addEventListener('scroll', handelScroll, true)
        return () => {
            document.querySelector('.AppRouter').removeEventListener('scroll', handelScroll, true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const handelScroll = (e) => {
        if (e.target.scrollTop + e.target.clientHeight + 100 >= e.target.scrollHeight && !progress) {
            postProgress({
                article_id: match.params?.id,
                latency: Date.now() - timeRef.current,
                done_status: 1,
                article_progress: 100,
            })
            progress = true
        }
    }
    //阅读上报
    const postProgress = (params) => {
        http.post('/community/article/progress/20210101', {
            ...params,
            ...qs.parse(window.location.search.split('?')[1]),
        })
    }
    // type=5是活动文章
    return (
        <div
            className="articleContainer"
            style={{
                padding: data?.type == 5 && inApp && match.params?.id != 557 ? 0 : '16px',
                paddingBottom: inApp ? '.32rem' : '2rem',
                minHeight: inApp && (data.type === 2 || data.type === 1) ? 0 : '100vh',
            }}
        >
            {loading ? (
                <img className="loadingBg" src={LoadingBg} alt="" />
            ) : Object.keys(data || {}).length > 0 ? (
                <div style={{paddingTop: inApp ? 0 : '1.52rem'}}>
                    {!inApp && (
                        <div className="downloadBox">
                            <div className="flexBetween" style={{position: 'relative', zIndex: 2}}>
                                <img src={Logo} alt="" />
                                <a
                                    href="http://a.app.qq.com/o/simple.jsp?pkgname=com.licaimofang.app"
                                    className="downloadBtn"
                                >
                                    {'打开App'}
                                </a>
                            </div>
                        </div>
                    )}
                    {/* {!window.ReactNativeWebView && <div className='registerBtn' onClick={() => getWxCode('/register')}>{'立即注册'}</div>} */}
                    {data?.cate_name && (
                        <div className="cateName">
                            {data?.cate_name}
                            {data?.phase ? ` 第${data?.phase}期` : ''}
                        </div>
                    )}
                    {Object.keys(data?.question_info || {}).length > 0 && (
                        <>
                            <div
                                className="questionContainer"
                                style={{
                                    marginBottom: data?.tag_list?.some((item) => item !== '') ? '0.32rem' : '0.8rem',
                                }}
                            >
                                <img className="questionBg" src={questionBg} alt="" />
                                <div className="defaultFlex">
                                    {data?.question_info?.nickname}
                                    <img className="questionIcon" src={questionIcon} alt="" />
                                </div>
                                <div className="questionName">{data?.question_info?.name}</div>
                            </div>
                            {data?.tag_list?.some((item) => item !== '') && (
                                <div className="defaultFlex" style={{marginBottom: '0.64rem', flexWrap: 'wrap'}}>
                                    {data.tag_list.map((item, index) => {
                                        return (
                                            item && (
                                                <span className="tag" key={item + index}>
                                                    {item}
                                                </span>
                                            )
                                        )
                                    })}
                                </div>
                            )}
                        </>
                    )}
                    {data?.title && (
                        <div
                            className="title"
                            style={{
                                margin: inApp && data?.type == 5 ? '0 16px 16px 16px' : '0 0 16px 0',
                            }}
                        >
                            {data?.title}
                        </div>
                    )}
                    {data?.author_info && (
                        <div
                            className="flexBetween"
                            style={{
                                marginBottom:
                                    Object.keys(data?.question_info || {}).length !== 0 ||
                                    data?.tag_list?.some((item) => item !== '')
                                        ? '0.32rem'
                                        : '0.8rem',
                            }}
                        >
                            <div className="defaultFlex">
                                <div className="defaultFlex" onClick={() => jump(data?.author_info?.url)}>
                                    {data?.author_info?.avatar ? (
                                        <img
                                            className="avatar"
                                            src={
                                                data?.author_info?.avatar ||
                                                'https://static.licaimofang.com/wp-content/uploads/2021/02/专属投顾@2x.png'
                                            }
                                            alt=""
                                        />
                                    ) : null}
                                    <span className="nickname">{data?.author_info?.nickname}</span>
                                </div>
                                {data?.author_info?.icon && (
                                    <img
                                        src={data?.author_info?.icon}
                                        style={{width: '0.32rem', marginLeft: '0.16rem'}}
                                        alt=""
                                    />
                                )}
                                {Object.keys(data?.question_info || {}).length > 0 && (
                                    <img className="answerIcon" src={answerIcon} alt="" />
                                )}
                            </div>
                            {inApp && data?.follow_btn?.text ? (
                                <Button
                                    block
                                    className={`followBtn${data?.follow_status === 1 ? ' followed' : ''}`}
                                    fill="outline"
                                    onClick={onFollowBtn}
                                >
                                    {data.follow_btn.text}
                                </Button>
                            ) : null}
                        </div>
                    )}
                    {Object.keys(data?.question_info || {}).length === 0 &&
                        data?.tag_list?.some((item) => item !== '') && (
                            <div className="defaultFlex" style={{marginBottom: '.64rem', flexWrap: 'wrap'}}>
                                {data.tag_list.map((item, index) => {
                                    return (
                                        item && (
                                            <span className="tag" key={item + index}>
                                                {item}
                                            </span>
                                        )
                                    )
                                })}
                            </div>
                        )}
                    {data.media_url ? (
                        <div style={{marginBottom: '0.56rem'}}>
                            <Audio
                                postMessage={() => {
                                    window.ReactNativeWebView?.postMessage('VoiceHearOut')
                                }}
                                postError={() => {
                                    window.ReactNativeWebView?.postMessage('AudioError')
                                }}
                                duration={data.media_duration}
                                feedbackStatus={data.feedback_status}
                                src={data.media_url}
                                id={match.params?.id}
                            />
                        </div>
                    ) : null}
                    {data?.video_media && Object.keys(data).length > 0 && (
                        <VideoBox cover={data?.video_media?.cover} url={data?.video_media?.url} />
                    )}
                    {data?.html_list?.length > 0 ? (
                        <div className="articleContent" style={{padding: data?.type == 5 ? 0 : '0 8px'}}>
                            {data.html_list.map?.((item, index) => {
                                const {cover, html, media_id = 0, media_type, url} = item
                                return (
                                    <React.Fragment key={`${media_id}${media_type}${index}`}>
                                        {media_type === 'html' ? (
                                            inApp ? (
                                                <div dangerouslySetInnerHTML={{__html: html}} />
                                            ) : (
                                                getContent(html)
                                            )
                                        ) : null}
                                        {media_type === 'vod' ? <VideoBox cover={cover} url={url} /> : null}
                                    </React.Fragment>
                                )
                            })}
                        </div>
                    ) : inApp ? (
                        <div
                            className="articleContent"
                            style={{padding: data?.type == 5 ? 0 : '0 8px'}}
                            dangerouslySetInnerHTML={{__html: data?.content}}
                        />
                    ) : (
                        getContent(data?.content)
                    )}
                    {!inApp && Object.keys(recommendData || {}).length > 0 ? (
                        <div style={{marginTop: '40px'}}>
                            <div className="recommendTitle">{recommendData?.articles?.title}</div>
                            {recommendData?.articles?.list?.map((data, index) => {
                                return data.type === 4 ? (
                                    <QuestionCard key={index} data={data} />
                                ) : data.type === 2 ? (
                                    <VoiceCard key={index} data={data} />
                                ) : (
                                    <ArticleCard key={index} data={data} />
                                )
                            })}
                        </div>
                    ) : null}
                </div>
            ) : (
                <div className="flexColumn emptyBox">
                    <img src={empty} alt="" />
                    <span>文章已下架</span>
                    <div className="defaultFlex otherArticles" onClick={() => jump({path: 'Community', type: 1})}>
                        查看其他文章
                        <RightOutline color="#0051CC" fontSize={12} />
                    </div>
                </div>
            )}
        </div>
    )
}

export default Article
