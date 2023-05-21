/*
 * @Date: 2022-12-12 15:56:52
 * @Description: 评测结果页
 */
import React, {useEffect, useState} from 'react'
import http from '~/service'
import {getUrlParams, jump} from '~/utils'
import './index.scss'
function QuestionnaireResult({location, history}) {
    const {fr, fund_code = '', upid = '', append = '', summary_id} = getUrlParams(location.search)
    const [data, setData] = useState({})
    useEffect(() => {
        document.title = '测评结果'
        http.get('/questionnaire/result/20210101', {fr, fund_code, upid, append, summary_id}).then((res) => {
            if (res.code === '000000') {
                setData(res.result)
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const buttonJump = (url) => {
        if (fr?.includes('risk')) {
            history.goBack()
        } else {
            jump(url, fr === 'single_buy' && !url?.path?.indexOf('IdAuth') > -1 ? 'navigate' : 'replace')
        }
    }

    return (
        Object.keys(data)?.length > 0 && (
            <div id="QuestionnaireResult">
                <div className="con">
                    <div className="title">{data?.risk_title}</div>
                    <div className="value">{data.risk_name}</div>
                    <div className="flexBetween" style={{position: 'relative'}}>
                        <div className="left"></div>
                        <div className="center"></div>
                        <div className="left right"></div>
                    </div>
                    <div style={{position: 'relative'}}>
                        <div className="content" dangerouslySetInnerHTML={{__html: data.risk_content}}></div>
                        <img src={require('~/image/icon/yinhaozuo.png').default} alt="" className="yinhaozuo" />
                        <img src={require('~/image/icon/yinhao.png').default} alt="" className="yinhao" />
                    </div>

                    {data?.open_account ? (
                        <div className="openBtn">
                            <div
                                style={{marginBottom: '20px', fontWeight: '500'}}
                                dangerouslySetInnerHTML={{__html: data?.open_account.title}}
                            ></div>
                            <div
                                className="redBtn flexCenter"
                                onClick={() => buttonJump(data?.open_account?.strong_btn?.url)}
                            >
                                {' '}
                                {data?.open_account?.strong_btn?.text}
                            </div>
                            <div className="lightBtn" onClick={() => buttonJump(data?.open_account?.light_btn?.url)}>
                                {data?.open_account?.light_btn?.text}
                            </div>
                        </div>
                    ) : (
                        <div className="rbutton flexCenter" onClick={() => buttonJump(data?.button?.url)}>
                            {data?.button?.text}
                        </div>
                    )}
                    {data.top_button && (
                        <div onClick={() => jump(data.top_button.url, 'replace')}>{data.top_button?.text}</div>
                    )}
                </div>
            </div>
        )
    )
}

export default QuestionnaireResult
