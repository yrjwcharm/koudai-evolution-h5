/*
 * @Date: 2021-01-06 18:39:56
 * @Description: 固定按钮
 */
import React, {useEffect, useRef, useState} from 'react'
import {Space} from '~/common/commonStyle'

import Agreements from '../Agreements'
import {SafeArea, Button} from 'antd-mobile'

const merge = (list) => Object.assign({}, ...list)
const FixedButtonWithAgreement = (props) => {
    const {
        agreement,
        disabled,
        heightChange,
        suffix = '',
        otherAgreement,
        otherParam,
        checkIcon,
        containerStyle,
        title,
        agreementStyle,
        ...restProps
    } = props

    const [check, setCheck] = useState(agreement?.default_agree !== undefined ? agreement.default_agree : true)
    const [showCheckTag, setShowCheckTag] = useState(true)
    const agreementRef = useRef()

    useEffect(() => {
        if (!agreementRef.current && agreement) {
            setCheck(agreement.default_agree)
            setShowCheckTag(!agreement.default_agree)
        }
        agreementRef.current = agreement
    }, [agreement])

    return (
        <div style={merge([styles.bottom, containerStyle])}>
            {agreement?.radio_text && showCheckTag && !check ? (
                <div style={styles.checkTag}>
                    <span style={{fontSize: 14, lineHeight: '20px', color: '#fff'}}>{agreement.radio_text}</span>
                    <div style={styles.qualTag} />
                </div>
            ) : null}
            {agreement ? (
                <div style={merge([{paddingTop: 4, paddingBottom: Space.padding}, agreementStyle])}>
                    <Agreements
                        check={agreement.default_agree}
                        data={agreement.list}
                        otherAgreement={otherAgreement}
                        otherParam={otherParam}
                        title={agreement.text}
                        text1={agreement.text1}
                        onChange={(checkStatus) => {
                            global.LogTool({ctrl: checkStatus ? 'check' : 'uncheck', event: 'contract'})
                            setCheck(checkStatus)
                            setShowCheckTag(!checkStatus)
                        }}
                        suffix={suffix}
                        checkIcon={checkIcon}
                    />
                </div>
            ) : null}
            <Button size="large" color="primary" {...restProps} disabled={(agreement && !check) || disabled}>
                {title}
            </Button>
            <div>
                <SafeArea opsition="bottom" />
            </div>
        </div>
    )
}

export default FixedButtonWithAgreement

const styles = {
    bottom: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        position: 'absolute',
        paddingTop: 8,
        bottom: 0,
        paddingLeft: 16,
        paddingRight: 16,
        width: '100vw',
        paddingBottom: 10,
    },
    checkTag: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '6px 8px',
        position: 'absolute',
        top: -30,
        zIndex: 10,
        left: 12,
        borderRadius: 4,
    },
    qualTag: {
        position: 'absolute',
        border: '6px solid transparent',
        borderTop: `6px solid rgba(0, 0, 0, 0.7)`,
        left: 8,
        bottom: -12,
    },
}
