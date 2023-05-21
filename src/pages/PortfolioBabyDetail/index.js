/*
 * @Date: 2021-09-06 14:41:03
 * @Author: dx
 * @LastEditors: dx
 * @LastEditTime: 2022-01-12 11:45:40
 * @Description: 百万宝贝计划组合详情
 */
import React, {useEffect, useRef, useState} from 'react'
import {Icon, Modal, Toast} from 'antd-mobile-v2'
import './index.css'
import {formaNum, storage} from '../../utils'
import http from '../../service'
import minus from '../../image/icon/minus.png'
import plus from '../../image/icon/plus.png'
import popup from '../../image/icon/popup.png'
import ruler from '../../utils/ruler'
import arrow from '../../image/icon/arrow.png'
import BottomDesc from '../../components/BottomDesc'
import {isIOS} from '../../utils'
import qs from 'qs'

const PortfolioBabyDetail = ({match}) => {
    const [data, setData] = useState({})
    const [age, setAge] = useState('')
    const [targetAmount, setTarget] = useState('')
    const [firstAmount, setFirst] = useState('')
    const [perMonthAmount, setPerMonth] = useState('')
    const [calcModal, setCalcModal] = useState(false)
    const [consultModal, setConsultModal] = useState(false)
    const [loading, setLoading] = useState(true)
    const targetAmountObj = useRef({
        0: 30,
        10: 50,
        20: 80,
        30: 100,
        40: 150,
        50: 200,
    })
    const upidRef = useRef(match.params.upid || '')

    const init = () => {
        const getData = () => {
            http.get('/portfolio/purpose_invest_detail/20210101', {
                account_id: match.params.account_id,
                amount: match.params.amount || '',
                upid: upidRef.current,
            })
                .then((res) => {
                    if (res.code === '000000') {
                        document.title = res.result.title
                        setAge(res.result.plan_info?.personal_info?.age)
                        setFirst(res.result.plan_info?.goal_info?.items[0]?.val)
                        const index = Object.values(targetAmountObj.current).findIndex(
                            (item) => item === res.result.plan_info?.goal_info?.amount / 10000,
                        )
                        setTarget(Object.keys(targetAmountObj.current)[index])
                        upidRef.current = res.result.upid
                        setData(res.result)
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        }
        if (window.ReactNativeWebView) {
            const {timeStamp} = qs.parse(window.location.href.split('?')[1]) || {}
            let timer = setInterval(() => {
                if (storage.getItem('loginStatus')?.timeStamp === timeStamp) {
                    clearInterval(timer)
                    getData()
                }
            }, 10)
        } else {
            getData()
        }
    }

    const logtool = (params) => {
        window.ReactNativeWebView.postMessage(`logParams=${JSON.stringify(params)}`)
    }

    const jump = (url) => {
        window.ReactNativeWebView.postMessage(`url=${JSON.stringify(url)}`)
    }

    const consultClick = (item) => {
        if (item.type === 'im') {
            setConsultModal(false)
            logtool(['im'])
            jump({
                type: 1,
                path: 'IM',
            })
        } else if (item.type === 'tel') {
            setConsultModal(false)
            const path = `tel:${item.sno}`
            logtool(['call'])
            jump({
                type: 2,
                path,
            })
        }
    }

    useEffect(() => {
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (Object.keys(data).length > 0) {
            ruler.initPlugin({
                el: 'rulerWrap',
                startValue: targetAmount,
                maxScale: 50,
                background: '#fff',
                success: function (res) {
                    // console.log(res);
                    setTarget(res)
                },
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    useEffect(() => {
        if (age !== '' && firstAmount !== '' && targetAmount !== '') {
            http.get('/portfolio/monthly/amount/20210909', {
                account_id: match.params.account_id,
                age,
                initial_amount: firstAmount * 1,
                goal_amount: targetAmountObj.current[targetAmount] * 10000,
                upid: upidRef.current,
            }).then((res) => {
                if (res.code === '000000') {
                    if (res.result.tip) {
                        Toast.fail(res.result.tip, 2)
                        init()
                    } else {
                        setPerMonth(res.result.amount * 1)
                    }
                }
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [age, firstAmount, match.params, targetAmount])

    useEffect(() => {
        window.document.addEventListener('reload', init)
        return () => {
            window.document.removeEventListener('reload', init)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (calcModal || consultModal) {
            document.querySelector('.am-modal-header').className += ' hairline--bottom'
        }
    }, [calcModal, consultModal])

    return (
        <div
            className={`portfolioDetailCon${isIOS() ? ' ios' : ''}`}
            style={Object.keys(data).length > 0 ? {opacity: 1} : {}}
        >
            {Object.keys(data).length > 0 && (
                <>
                    <div className={loading ? 'loading' : ''}>
                        <img className="topBg" src={data.top_bg_img} onLoad={() => setLoading(false)} alt="" />
                    </div>
                    <div className="topTitle">
                        <div>{'百万宝贝计划'}</div>
                        <div>{'为孩子轻松攒到一百万'}</div>
                    </div>
                    <div className="targetContainer">
                        <div className="flexBetween editLine hairline--bottom">
                            <div className="key">
                                {data?.plan_info?.personal_info?.title}
                                <span>（{data?.plan_info?.personal_info?.tip}）</span>
                            </div>
                            <div className="defaultFlex">
                                <img
                                    className="minus"
                                    src={minus}
                                    alt=""
                                    onClick={() => setAge((prev) => (prev > 0 ? prev - 1 : 0))}
                                />
                                <span className="age">{age}</span>
                                <span className="ageUnit">岁</span>
                                <img
                                    className="plus"
                                    src={plus}
                                    alt=""
                                    onClick={() =>
                                        setAge((prev) =>
                                            prev < data?.plan_info?.personal_info?.personal_info?.age_max
                                                ? prev + 1
                                                : data?.plan_info?.personal_info?.personal_info?.age_max,
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div className="targetAmount">
                            <div className="key">{data?.plan_info?.goal_info?.title}</div>
                            <div className="val">
                                <span style={{fontSize: '.7rem', fontFamily: 'DINAlternate-Bold'}}>
                                    {targetAmountObj.current[targetAmount]}
                                </span>
                                万
                            </div>
                            <img className="arrow" src={arrow} alt="" />
                        </div>
                        <div className="defaultFlex tipContainer" onClick={() => setCalcModal(true)}>
                            <img src={popup} alt="" />
                            <span>99%概率超出</span>
                        </div>
                        <div id="rulerWrap" />
                        {data?.plan_info?.goal_info?.items?.map?.((item, index) => {
                            return (
                                <div
                                    className={`flexBetween editLine${index !== 0 ? ' hairline--top' : ''}`}
                                    key={item + index}
                                >
                                    <div className="key">{item.key}</div>
                                    <div className="defaultFlex">
                                        {item.type === 'begin' ? (
                                            <img
                                                className="minus"
                                                src={minus}
                                                alt=""
                                                onClick={() =>
                                                    setFirst((prev) =>
                                                        prev - item.interval > item.min
                                                            ? ~~prev - item.interval
                                                            : item.min,
                                                    )
                                                }
                                            />
                                        ) : null}
                                        <div style={{position: 'relative'}}>
                                            <span
                                                className="age amount"
                                                style={item.type === 'begin' ? {opacity: 0} : {}}
                                            >
                                                {formaNum(item.type === 'begin' ? firstAmount : perMonthAmount, true)}
                                            </span>
                                            {item.type === 'begin' ? (
                                                <input
                                                    className="age amount input"
                                                    type="text"
                                                    value={formaNum(firstAmount, true)}
                                                    onBlur={() =>
                                                        setFirst((prev) => {
                                                            if (prev < item.min) {
                                                                Toast.fail(
                                                                    `百万宝贝计划首次投入金额最低为${item.min}元`,
                                                                )
                                                                return item.min
                                                            } else {
                                                                return prev
                                                            }
                                                        })
                                                    }
                                                    onChange={(e) => setFirst(e.target.value.replace(/\D/g, ''))}
                                                />
                                            ) : null}
                                        </div>
                                        {item.type === 'begin' ? (
                                            <img
                                                className="plus"
                                                src={plus}
                                                alt=""
                                                onClick={() =>
                                                    setFirst((prev) =>
                                                        prev < item.min ? item.min : ~~prev + item.interval,
                                                    )
                                                }
                                            />
                                        ) : null}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {data?.extend_img_part?.map?.((item, index) => {
                        return <img className="pointPic" key={item + index} src={item.img} alt="" />
                    })}
                    {window.ReactNativeWebView && (
                        <div className="menuContainer">
                            {data?.gather_info?.map?.((item, index) => {
                                return (
                                    <div
                                        className={`flexBetween menuItem${index !== 0 ? ' hairline--top' : ''}`}
                                        key={item + index}
                                        onClick={() => {
                                            logtool(['portfolioDetailFeatureStart', 'bottommenu', index])
                                            jump(item.url)
                                        }}
                                    >
                                        <span>{item.title}</span>
                                        <Icon color="#9aA1B2" size="sm" type="right" className="arrow" />
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    <div className="riskHint">{data?.tip}</div>
                    <BottomDesc />
                    {window.ReactNativeWebView && (
                        <div className={`flexBetween fixedBtnContainer${isIOS() ? ' ios' : ''}`}>
                            <div className="flexColumn consult" onClick={() => setConsultModal(true)}>
                                <img src={data?.btns[0]?.icon} alt="" />
                                <span>{data?.btns[0]?.title}</span>
                            </div>
                            <div className="btn" onClick={() => jump(data?.btns[1]?.url)}>
                                {data?.btns[1]?.title}
                            </div>
                        </div>
                    )}
                    <Modal
                        animationType="slide-up"
                        closable
                        onClose={() => setCalcModal(false)}
                        popup
                        title={
                            <div>
                                <span style={{opacity: 0}}>{data?.plan_info?.goal_info?.tip_info?.title}</span>
                                <span className="confirm" onClick={() => setCalcModal(false)}>
                                    确定
                                </span>
                            </div>
                        }
                        visible={calcModal}
                        wrapClassName="modalWrap"
                    >
                        {/* <div className='contentKey'>{'99%概率计算方式'}</div>
            <div className='contentVal'>{'采用了金融领域的随机漫步方法。根据历史年化收益率及历史波动率进行模拟，生成了十万条未来可能的收益曲线，在每一个时间节点上，采用了表现最差的1%的点，按照时间序列连线，就形成了99%概率的收益曲线'}</div> */}
                        <div dangerouslySetInnerHTML={{__html: data?.plan_info?.goal_info?.tip_info?.popup?.content}} />
                    </Modal>
                    <Modal
                        animationType="slide-up"
                        closable
                        onClose={() => setConsultModal(false)}
                        popup
                        title="选择咨询方式"
                        visible={consultModal}
                        wrapClassName="modalWrap"
                    >
                        <div className="contactContainer">
                            {data?.btns[0]?.subs?.map?.((item, index) => {
                                return (
                                    <div className="flexBetween methodItem" key={item + index}>
                                        <div className="defaultFlex">
                                            <img className="methodIcon" src={item.icon} alt="" />
                                            <div>
                                                <div className="methodTitle">{item.title}</div>
                                                <div className="methodDesc">{item.desc}</div>
                                            </div>
                                        </div>
                                        <div className="methodBtn" onClick={() => consultClick(item)}>
                                            {item.btn?.title}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Modal>
                </>
            )}
        </div>
    )
}

export default PortfolioBabyDetail
