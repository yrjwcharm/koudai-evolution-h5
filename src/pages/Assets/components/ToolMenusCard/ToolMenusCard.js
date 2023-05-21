/*
 * @Date: 2022-12-13 11:34:01
 * @Description:
 */
import React from 'react'
import {jump} from '~/utils'
import './index.scss'
function ToolMenusCard({data, style}) {
    return (
        <div className="defaultFlex ToolMenusCard" style={style}>
            {data?.map((item) => (
                <div
                    key={item.tool_id}
                    className="flexColumn"
                    style={{width: '20%', marginBottom: 16}}
                    onClick={() => {
                        if (item?.tip) {
                            window.LogTool('guide_click', item?.text, item.tool_id)
                        } else {
                            window.LogTool('icon_click', item?.text, item.tool_id)
                        }
                        jump(item.url)
                    }}
                >
                    <img className="topMenuIcon" src={item.icon} alt="" />
                    <div className="menuTitle">{item.text}</div>
                </div>
            ))}
        </div>
    )
}

export default ToolMenusCard
