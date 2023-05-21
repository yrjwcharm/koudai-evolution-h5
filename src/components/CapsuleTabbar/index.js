/*
 * @Description:
 * @Autor: wxp
 * @Date: 2022-12-14 17:16:33
 */
import {RightOutline} from 'antd-mobile-icons'
import classNames from 'classnames'
import React from 'react'
import {Colors} from '~/common/commonStyle'
import {jump, px} from '~/utils'
import styles from './index.module.scss'

const CapsuleTabbar = (props) => {
    const {activeTab = 0, boxStyle = {}, goToPage, renderTab, tabs = [], unActiveStyle, tab_list} = props
    return (
        <div style={{flexDirection: 'row', alignItems: 'center'}}>
            <div className={classNames([styles.boxWrap, boxStyle])}>
                {tabs.map((name, page) => {
                    const isTabActive = activeTab === page
                    if (renderTab) {
                        return renderTab(name, page, isTabActive, goToPage)
                    }
                    return (
                        <div
                            disabled={isTabActive}
                            key={name}
                            onClick={() => !isTabActive && goToPage(page)}
                            className={styles.tabBox}
                            style={isTabActive ? {backgroundColor: '#DEE8FF'} : unActiveStyle}
                        >
                            <div className={classNames([styles.tabText, isTabActive ? styles.activeText : null])}>
                                {name}
                            </div>
                        </div>
                    )
                })}
            </div>
            {tab_list?.[activeTab]?.more ? (
                <div
                    onClick={() => {
                        jump(tab_list?.[activeTab]?.more.url)
                    }}
                    style={{marginTop: px(8), display: 'flex', alignItems: 'center'}}
                >
                    <div className={styles.moreText}>{tab_list?.[activeTab]?.more.text}</div>
                    <RightOutline color={Colors.brandColor} size={16} />
                </div>
            ) : null}
        </div>
    )
}

export default CapsuleTabbar
