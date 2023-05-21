/*
 * @Date: 2021-01-26 17:24:06
 * @Author: dx
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-14 16:15:10
 * @Description: 根据传入金额大于、等于或小于0展示不同颜色
 */
import React, {useCallback} from 'react'
import PropTypes from 'prop-types'
import {Colors} from '~/common/commonStyle'
import classNames from 'classnames'

const NumText = ({text, style, type = 1}) => {
    const getColor = useCallback(() => {
        //  type:1代表数字 2代表文字
        if (!text || type == 2) {
            return Colors.defaultColor
        }
        if (parseFloat(text.replace(/,/g, '')) < 0) {
            return Colors.green
        } else if (parseFloat(text.replace(/,/g, '')) === 0) {
            return Colors.defaultColor
        } else {
            return Colors.red
        }
    }, [text, type])
    return (
        <div className={classNames(style)} style={{color: getColor()}}>
            {text}
        </div>
    )
}

NumText.propTypes = {
    text: PropTypes.string.isRequired,
}

export default NumText
