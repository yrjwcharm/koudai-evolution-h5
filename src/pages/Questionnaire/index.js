/* eslint-disable no-undef */
/*
 * @Date: 2022-12-12 11:50:11
 * @Description: 评测
 */
import React, {useEffect, useRef, useState} from 'react'
import http from '~/service'
import {Toast} from 'antd-mobile'
import './index.scss'
import classnames from 'classnames'
import {getUrlParams, jump, px} from '~/utils'
function Index({history, location}) {
    const {fr = 'plan_v611', fund_code = '', plan_id = 2, append = ''} = getUrlParams(location.search)
    const summaryIdRef = useRef('')
    const questionnaireRef = useRef('')
    const upidRef = useRef('')
    const startTimeRef = useRef('')
    const endTimeRef = useRef('')
    const [current, setCurrent] = useState(0)
    const [questions, setQuestions] = useState([])
    const [answers, setAnswers] = useState([])
    const [tips, setTips] = useState('')
    const clickRef = useRef(true)
    const init = () => {
        document.title = '风险测评'
        http.get('/questionnaire/start/20210101', {fr, fund_code, plan_id}).then((res) => {
            if (res.code === '000000') {
                summaryIdRef.current = res.result.summary_id
                getQuestions()
            } else {
                Toast.show({content: res.message})
            }
        })
    }
    useEffect(() => {
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const getQuestions = () => {
        const params = {
            summary_id: summaryIdRef.current,
            questionnaire_cate: questionnaireRef.current,
            fr,
        }
        http.get('/questionnaire/questions/20210101', params).then((res) => {
            if (res.code === '000000') {
                //已经答过的题
                setTips(res.result.tip)
                setQuestions((prev) => prev.concat(res.result.questions))
                startTimeRef.current = Date.now()
                questionnaireRef.current = res.result.questionnaire_cate
            } else {
                Toast.show({content: res.message})
            }
        })
    }
    const jumpNext = (item) => {
        if (!clickRef.current) {
            return false
        }
        clickRef.current = false
        setAnswers((prev) => {
            const next = [...prev]
            next[current] = item.id
            return next
        })
        if (current === questions.length - 1) {
            reportResult(item)
            setTimeout(() => {
                clickRef.current = true
            }, 1000)
        } else {
            reportResult(item)
            setTimeout(() => {
                setCurrent((prev) => prev + 1)
                startTimeRef.current = Date.now()
                setTimeout(() => {
                    clickRef.current = true
                }, 500)
            }, 500)
        }
    }
    const reportResult = (option) => {
        endTimeRef.current = Date.now()
        const params = {
            summary_id: summaryIdRef.current,
            action: option.action,
            question_id: questions[current].id,
            option_id: option.id,
            option_val: option.content,
            questionnaire_cate: questionnaireRef.current,
            latency: endTimeRef.current - startTimeRef.current,
            fr,
            append,
        }
        http.post('/questionnaire/report/20210101', params).then((res) => {
            if (res.code === '000000') {
                if (option.action === 'submit') {
                    upidRef.current = res.result.upid
                    jump(
                        {
                            path: 'QuestionnaireResult',
                            params: {
                                upid: upidRef.current,
                                summary_id: summaryIdRef.current,
                                fr,
                                fund_code,
                                append,
                            },
                        },
                        'replace',
                    )
                }
            }
        })
    }

    return (
        <div className="questionCon">
            {current === 0 && tips ? (
                <div className="tip"> {tips}</div>
            ) : (
                <div className={'progressCon'}>
                    <div
                        className={'progressCon progressConW'}
                        style={{width: `${((current + 1) / questions.length) * 100}%`}}
                    ></div>
                </div>
            )}
            <div style={{padding: '0 16px'}}>
                <div style={{fontSize: 14, color: '#9AA0B1', lineHeight: '20px', marginBottom: '20px'}}>
                    {questions[current]?.risk_title}
                </div>
                <div style={{fontFamily: 'DIN Alternate-Bold, DIN Alternate', marginBottom: '10px'}}>
                    <span style={{color: '#0051CC', fontSize: 40, fontWeight: 'bold'}}>{current + 1}</span>
                    <span style={{color: '#9AA0B1', fontSize: 20}}>/{questions.length}</span>
                </div>
                <div style={{fontSize: 20, fontWeight: 'bold', marginBottom: '28px'}}>{questions[current]?.name}</div>
                {questions[current] &&
                    questions[current].options.map((item, index) => {
                        return (
                            <div
                                key={item + index}
                                className={classnames('card', 'defaultFlex', {
                                    cardActive: answers[current] === item.id,
                                })}
                                onClick={() => jumpNext(item)}
                            >
                                {item.content}
                            </div>
                        )
                    })}

                {current != 0 && (
                    <div
                        style={{marginTop: px(24), color: '#9AA0B1'}}
                        onClick={() => {
                            setCurrent((prev) => prev - 1)
                            startTimeRef.current = Date.now()
                        }}
                    >
                        上一题
                    </div>
                )}
            </div>
        </div>
    )
}

export default Index
