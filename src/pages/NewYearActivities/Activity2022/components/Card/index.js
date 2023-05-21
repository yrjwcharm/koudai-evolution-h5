import {useEffect, useMemo, useState} from 'react'
import {resolveTimeStemp, countdownTool} from '../../../../../utils'
import './index.css'
import linkArrow from '../../../../../image/icon/link_arrow.png'

/**
 * 活动卡片
 * @param {object} props
 * @param {number} [props.countdown]
 * @param {object} [props.markData]
 * @param {string} props.title
 * @param {Object} props.children
 * @param {boolean} [props.showRule=false]
 * @param {Function} [props.onRuleBtnClick=() => { }]
 * @param {Function} [props.onCountdownOver]
 * @returns {Object}
 */
const Card = ({
    markData = {},
    countdown: countdownProps,
    title,
    children,
    showRule = false,
    onRuleBtnClick = () => {},
    onCountdownOver,
}) => {
    const [countdown, setCountdown] = useState([])
    const isMark = useMemo(() => +countdown[0] || +countdown[1] || +countdown[2] || +countdown[3], [countdown])

    // 活动倒计时
    useEffect(() => {
        let cancel = () => {}
        if (countdownProps) {
            cancel = countdownTool({
                timeStemp: +countdownProps,
                immediate: true,
                callback: (resetTime) => {
                    let c = resolveTimeStemp(resetTime)
                    setCountdown(c)
                    if (resetTime <= 0) {
                        onCountdownOver && onCountdownOver()
                    }
                },
            })
        }
        return cancel
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countdownProps])

    return (
        <div className="cardContainer">
            <div className={`cardMain ${isMark ? 'cardMainBlur' : ''}`}>
                <div className="cardHeader">
                    <div className="cardTitle">{title}</div>
                    {showRule ? (
                        <div className="cardRuleBtn" onClick={() => onRuleBtnClick && onRuleBtnClick()}>
                            <div className="cardRuleBtnText">规则</div>
                            {/* <div className="cardRuleBtnExpand">&gt;</div> */}
                            <img src={linkArrow} alt="link" />
                        </div>
                    ) : null}
                </div>
                <div className="cardChildren">{children}</div>
            </div>
            {isMark ? (
                <div className="hintOnMark">
                    <div className="hintOnMarkText">{markData?.title}</div>
                    <div className="hintOnMarkText">{markData?.desc}</div>
                    <div className="hintOnMarkShotDown">
                        <div>{countdown[0]}</div>天<div>{countdown[1]}</div>时<div>{countdown[2]}</div>分
                        <div>{countdown[3]}</div>秒
                    </div>
                </div>
            ) : null}
        </div>
    )
}
export default Card
