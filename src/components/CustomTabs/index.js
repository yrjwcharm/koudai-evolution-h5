/*
 * @Date: 2022-12-16 11:50:19
 * @Description:
 */
import {Swiper, Tabs} from 'antd-mobile'
import React, {useState, useRef} from 'react'
import {isIOS} from '~/utils'
import './index.scss'
function CustomTabs({contents = [], tabItems = [], pointKey}) {
    const swiperRef = useRef(null)
    const [activeIndex, setActiveIndex] = useState(0)

    return (
        <div className="tabsBox">
            <div style={{padding: '0 .32rem'}}>
                <Tabs
                    activeKey={tabItems[activeIndex].key}
                    activeLineMode="fixed"
                    className={tabItems.length > 1 ? 'hairline' : ''}
                    onChange={(key) => {
                        const index = tabItems.findIndex((item) => item.key === key)
                        setActiveIndex(index)
                        swiperRef.current?.swipeTo(index)
                    }}
                    stretch={false}
                    style={{
                        '--active-line-border-radius': '.02rem',
                        '--active-line-color': '#121D3A',
                        '--active-title-color': '#121D3A',
                        '--fixed-active-line-width': tabItems?.length > 1 ? '.4rem' : 0,
                        '--hairline-width': 0,
                        '--hairline-color': '#E9EAEF',
                        '--active-title-weight': isIOS() ? 500 : 700,
                    }}
                >
                    {tabItems.map((tab) => (
                        <Tabs.Tab key={tab.key} title={tab.title} />
                    ))}
                </Tabs>
            </div>
            <Swiper
                allowTouchMove={false}
                defaultIndex={activeIndex}
                direction="horizontal"
                indicator={() => null}
                loop={false}
                onIndexChange={setActiveIndex}
                ref={swiperRef}
            >
                {contents.map((item, index) => (
                    <Swiper.Item key={tabItems[index].key}>{item}</Swiper.Item>
                ))}
            </Swiper>
        </div>
    )
}

export default CustomTabs
