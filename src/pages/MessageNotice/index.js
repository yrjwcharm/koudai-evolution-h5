/*
 * @Date: 2022-07-15 19:56:55
 * @Description:
 */

import React from 'react'
function MessageNotice({match}) {
    return (
        <div style={{padding: '0 12px', backgroundColor: '#fff', height: '100%'}}>
            <div
                style={{
                    fontSize: ' 20px',
                    fontWeight: '800',
                    lineHeight: '28px',
                    padding: '16px 0',
                }}
            >
                调仓中由于中转货币基金公司短暂交易故障导致部分基金回滚通知
            </div>
            <img
                style={{width: '100%'}}
                src={'https://static.licaimofang.com/wp-content/uploads/2022/07/WechatIMG2045.png'}
                alt=""
            ></img>
        </div>
    )
}

export default MessageNotice
