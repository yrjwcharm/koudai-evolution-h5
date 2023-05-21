/*
 * @Date: 2022-12-13 22:59:03
 * @Description:
 */
import React from 'react'

function TagInfo({data, style}) {
    return (
        <div
            style={{
                padding: '4px 5px',
                borderRadius: '2px',
                marginLeft: '6px',
                backgroundColor: data?.color || '#E74949',
                fontSize: '12px',
                transform: 'scale(0.83)',
                transformOrigin: '0',
                color: '#fff',
                ...style,
            }}
        >
            {data?.text}
        </div>
    )
}

export default TagInfo
