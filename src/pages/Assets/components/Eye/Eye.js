/*
 * @Date: 2022-12-13 15:43:31
 * @Description:
 */
import {EyeOutline, EyeInvisibleOutline} from 'antd-mobile-icons'
import React, {useState, useEffect} from 'react'

const Eye = ({storageKey, onChange, color, size, style}) => {
    const [showEye, setShowEye] = useState('true')
    useEffect(() => {
        const res = localStorage.getItem(storageKey || 'myAssetsEye')
        onChange(res ? res : 'true')
        setShowEye(res ? res : 'true')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    // 显示|隐藏金额信息
    const toggleEye = (e) => {
        e.stopPropagation()
        onChange(showEye === 'true' ? 'false' : 'true')
        setShowEye((show) => {
            global.LogTool('click', show === 'true' ? 'eye_close' : 'eye_open')
            localStorage.setItem(storageKey || 'myAssetsEye', show === 'true' ? 'false' : 'true')
            return show === 'true' ? 'false' : 'true'
        })
    }
    return (
        <div
            onClick={toggleEye}
            style={{width: 40, height: 40, justifyContent: 'center', display: 'flex', alignItems: 'center', ...style}}
        >
            {showEye === 'true' ? (
                <EyeOutline fontSize={size || 16} color={color || 'rgba(255, 255, 255, 0.8)'} />
            ) : (
                <EyeInvisibleOutline fontSize={size || 16} color={color || 'rgba(255, 255, 255, 0.8)'} />
            )}
        </div>
    )
}

export default Eye
