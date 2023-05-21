/*
 * @Date: 2022-10-22 14:52:39
 * @Description: 文章草稿
 */
import React, {useEffect, useState} from 'react'
import answerIcon from '~/image/icon/answer.png'
import LoadingBg from '~/image/bg/loadingBg.png'
import questionBg from '~/image/bg/questionBg.png'
import questionIcon from '~/image/icon/question.png'
import http from '~/service'
import {isIOS, getIsWxClient, inApp} from '~/utils'
import qs from 'qs'
import {
    Player,
    ControlBar,
    BigPlayButton,
    ProgressControl,
    DurationDisplay,
    PlayToggle, // PlayToggle 播放/暂停按钮 若需禁止加 disabled
    CurrentTimeDisplay,
    TimeDivider,
} from 'video-react'
import '../../../node_modules/video-react/dist/video-react.css' // import css
import './index.css'

export const VideoBox = ({cover, url}) => {
    return isIOS() && getIsWxClient() && !inApp ? (
        <video width="100%" playsInline={true} controls poster={cover} src={url}></video>
    ) : (
        <Player playsInline={true} poster={cover}>
            <source src={url} type="video/mp4" />
            <BigPlayButton position="center" />
            <ControlBar disableDefaultControls={true}>
                <PlayToggle />
                <ProgressControl />
                <CurrentTimeDisplay order={4.1} />
                <TimeDivider order={4.2} />
                <DurationDisplay order={4.4} />
            </ControlBar>
        </Player>
    )
}

const Index = () => {
    const query = qs.parse(window.location.search.split('?')[1] || '{}')
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState()

    useEffect(() => {
        http.get('/community/article/preview/202209', query)
            .then((res) => {
                if (res.code === '000000') {
                    setData(res.result)
                }
            })
            .finally(() => {
                setLoading(false)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (Object.keys(data || {}).length > 0 && !loading) {
            document.querySelectorAll('.articleContainer a').forEach((item) => {
                item.addEventListener(
                    'click',
                    (e) => {
                        if (inApp) {
                            e.preventDefault()
                            // const url = item.getAttribute('url')
                            // if (url) return window.ReactNativeWebView.postMessage(`url=${url}`)
                            // const id = item.href?.split('/article/')[1]
                            // // console.log(`article_id=${id}`);
                            // id && window.ReactNativeWebView.postMessage(`article_id=${id}`)
                        }
                    },
                    false,
                )
            })
        }
    }, [data, loading])

    return (
        <div
            className="articleContainer"
            style={{
                height: '100vh',
                overflow: 'auto',
            }}
        >
            {loading ? (
                <img className="loadingBg" src={LoadingBg} alt="" />
            ) : (
                <div>
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
                            {data?.tag_list?.some?.((item) => item !== '') && (
                                <div className="defaultFlex" style={{marginBottom: '0.64rem', flexWrap: 'wrap'}}>
                                    {data.tag_list.map?.((item, index) => {
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
                            className="defaultFlex"
                            style={{
                                marginBottom:
                                    Object.keys(data?.question_info || {}).length !== 0 ||
                                    data?.tag_list?.some((item) => item !== '')
                                        ? '0.32rem'
                                        : '0.8rem',
                            }}
                        >
                            {data?.author_info?.avatar ? (
                                <img
                                    className="avatar"
                                    src={
                                        data.author_info.avatar ||
                                        'https://static.licaimofang.com/wp-content/uploads/2021/02/专属投顾@2x.png'
                                    }
                                    alt=""
                                />
                            ) : null}
                            <span className="nickname">{data?.author_info?.nickname}</span>
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
                    )}
                    {Object.keys(data?.question_info || {}).length === 0 &&
                        data?.tag_list?.some?.((item) => item !== '') && (
                            <div className="defaultFlex" style={{marginBottom: '.64rem', flexWrap: 'wrap'}}>
                                {data.tag_list.map?.((item, index) => {
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
                    <div className="articleContent" style={{padding: data?.type == 5 ? 0 : '0 8px'}}>
                        {data?.html_list?.map?.((item, index) => {
                            const {cover, html, media_id = 0, media_type, url} = item
                            return (
                                <React.Fragment key={`${media_id}${media_type}${index}`}>
                                    {media_type === 'html' ? <div dangerouslySetInnerHTML={{__html: html}} /> : null}
                                    {media_type === 'vod' ? <VideoBox cover={cover} url={url} /> : null}
                                </React.Fragment>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Index
