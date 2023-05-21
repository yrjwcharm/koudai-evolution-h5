/*
 * @Date: 2022-09-19 17:20:59
 * @Description: v7产品列表
 */
import React from 'react'
import {SmallChart} from '~/components/Chart'
import {jump, logtool} from '~/utils'
import styles from './index.module.scss'

const Index = ({data = [], type = 'default'}) => {
    /** @name 卡片左边部分 */
    const renderLeftPart = ({chart, image, rank_icon, rank_num = '', ratio_labels, yesterday_profit}) => {
        switch (true) {
            case chart?.length > 0:
                return (
                    <div className={styles.leftPart}>
                        <SmallChart data={chart} />
                    </div>
                )
            case !!image:
                return (
                    <img
                        alt=""
                        className={styles.leftPart}
                        src={image}
                        style={{marginRight: '.16rem', borderRadius: '.12rem'}}
                    />
                )
            case !!rank_icon:
                return (
                    <div alt="" className={styles.rankIcon} style={{backgroundImage: `url(${rank_icon})`}}>
                        {rank_num}
                    </div>
                )
            case ratio_labels?.length > 0:
                return (
                    <div className={styles.leftPart}>
                        {ratio_labels.map((label, i) => {
                            return (
                                <div className={`flexCenter ${styles[`ratioLabel${i + 1}`]}`} key={label + i}>
                                    {label}
                                </div>
                            )
                        })}
                    </div>
                )
            case !!yesterday_profit:
                const {bg_color, font_color, profit, profit_desc} = yesterday_profit
                return (
                    <div className={`flexColumn ${styles.profitBox}`} style={{backgroundColor: bg_color}}>
                        <div className={styles.profit} style={{color: font_color}}>
                            {profit}
                        </div>
                        <div className={styles.profitLabel} style={{color: font_color}}>
                            {profit_desc}
                        </div>
                    </div>
                )
            default:
                return null
        }
    }
    /** @name 默认卡片 */
    const renderDefaultItem = (item, index) => {
        const {
            flex_between = false, // 是否两端对齐
            desc,
            id,
            labels,
            name,
            out_box = false, // 外部是否有边框和阴影
            product_id,
            profit,
            profit_desc,
            reason,
            reason_icon,
            red_tag,
            tags,
            url,
            style_id,
            drawback,
            drawback_desc,
            product_button,
        } = item
        const containerSty = out_box
            ? {
                  marginTop: index === 0 ? 0 : '.16rem',
              }
            : {
                  marginTop: index === 0 ? 0 : '.24rem',
                  paddingTop: index === 0 ? 0 : '.24rem',
                  '--hairline-color': '#E9EAEF',
                  '--hairline-width': 0,
              }
        return (
            <div
                className={`hairline ${out_box ? styles.outBox : index === 0 ? '' : 'hairline--top'}`}
                key={name + id + index}
                style={containerSty}
            >
                <div
                    className="defaultFlex"
                    onClick={() => {
                        logtool({ctrl: product_id, event: 'fundcard'})
                        jump(url)
                    }}
                >
                    {(() => {
                        switch (style_id) {
                            case 106:
                                return (
                                    <div>
                                        <div className={styles.name}>{name}</div>
                                        {tags?.length > 0 && (
                                            <div style={{marginTop: '0.08rem'}} className="defaultFlex">
                                                {tags.map((tag, i) => (
                                                    <div key={tag + i} className={`hairline ${styles.tagBox}`}>
                                                        {tag}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className={styles.mainRowWrap}>
                                            <div style={{width: '1.28rem', height: '0.68rem'}}>
                                                <SmallChart data={item.chart} />
                                            </div>
                                            {profit ? (
                                                <div style={{marginLeft: '0.24rem', alignItems: 'center'}}>
                                                    <div
                                                        className={styles.bigProfit}
                                                        dangerouslySetInnerHTML={{
                                                            __html:
                                                                '<span style="font-size:16px;line-height:19px">' +
                                                                profit +
                                                                '</span>',
                                                        }}
                                                    ></div>
                                                    <div className={styles.profitLabel}>{profit_desc}</div>
                                                </div>
                                            ) : null}
                                            {drawback ? (
                                                <div style={{marginLeft: '0.94rem', alignItems: 'center'}}>
                                                    <div
                                                        className={styles.bigProfit}
                                                        dangerouslySetInnerHTML={{
                                                            __html:
                                                                '<span style="font-size:16px;line-height:19px">' +
                                                                drawback +
                                                                '</span>',
                                                        }}
                                                    ></div>
                                                    <div className={styles.profitLabel}>{drawback_desc}</div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                )
                            case 107:
                                return (
                                    <div className={styles.mainRowWrap} style={{marginTop: 0}}>
                                        <div style={{width: '1.28rem', height: '0.68rem'}}>
                                            <SmallChart data={item.chart} />
                                        </div>
                                        {profit ? (
                                            <div style={{marginLeft: '0.24rem', alignItems: 'center'}}>
                                                <div
                                                    className={styles.bigProfit}
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            '<span style="font-size:16px;line-height:19px">' +
                                                            profit +
                                                            '</span>',
                                                    }}
                                                ></div>
                                                <div className={styles.profitLabel}>{profit_desc}</div>
                                            </div>
                                        ) : null}
                                        <div style={{marginLeft: '0.94rem', flex: 1}}>
                                            <div className={styles.name} style={{marginTop: '0.05rem'}}>
                                                {name}
                                            </div>
                                            {tags?.length > 0 && (
                                                <div className="defaultFlex">
                                                    {tags.map((tag, i) => (
                                                        <div
                                                            key={tag + i}
                                                            className="defaultFlex"
                                                            style={{marginTop: '0.04rem'}}
                                                        >
                                                            {i > 0 ? (
                                                                <div
                                                                    style={{
                                                                        width: 1,
                                                                        height: '0.22rem',
                                                                        backgroundColor: '#9AA0B1',
                                                                        margin: '0 0.06rem',
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div className={styles.profitLabel}>{tag}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            default:
                                return (
                                    <>
                                        {renderLeftPart(item)}
                                        <div
                                            className={flex_between ? 'flexBetween' : ''}
                                            style={{flex: 1, position: 'relative'}}
                                        >
                                            <div>
                                                <div className="defaultFlex">
                                                    <span className={styles.name}>{name}</span>
                                                    {red_tag ? <div className={styles.redTagBox}>{red_tag}</div> : null}
                                                    {labels?.length > 0 ? (
                                                        <div
                                                            className="defaultFlex"
                                                            style={{marginLeft: '.16rem', flexShrink: 1}}
                                                        >
                                                            {labels.map((label, i) => (
                                                                <div
                                                                    className={`ellipsisLine ${styles.label}`}
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: i === 0 ? label : `| ${label}`,
                                                                    }}
                                                                    key={label + i}
                                                                    style={{'--line-num': 1}}
                                                                />
                                                            ))}
                                                        </div>
                                                    ) : null}
                                                </div>
                                                {tags?.length > 0 && (
                                                    <div className="defaultFlex" style={{marginTop: '.08rem'}}>
                                                        {tags.map((tag, i) => (
                                                            <div className={`hairline ${styles.tagBox}`} key={tag + i}>
                                                                {tag}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {product_button ? (
                                                <div
                                                    className={styles.showButton}
                                                    onClick={() => {
                                                        jump(product_button?.url)
                                                    }}
                                                >
                                                    <div className={styles.showButtonText}>{product_button.text}</div>
                                                </div>
                                            ) : null}
                                            {desc ? <div className={styles.managerDesc}>{desc}</div> : null}
                                            {profit ? (
                                                <div
                                                    className={flex_between ? '' : 'defaultFlex'}
                                                    style={
                                                        flex_between
                                                            ? {textAlign: 'right'}
                                                            : {marginTop: desc ? '.08rem' : '.24rem'}
                                                    }
                                                >
                                                    <div
                                                        className={styles.bigProfit}
                                                        dangerouslySetInnerHTML={{__html: profit}}
                                                    />
                                                    <div
                                                        className={styles.profitLabel}
                                                        style={
                                                            flex_between
                                                                ? {marginTop: '.08rem'}
                                                                : {marginLeft: '.16rem'}
                                                        }
                                                    >
                                                        {profit_desc}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </>
                                )
                        }
                    })()}
                </div>
                {reason ? (
                    <div className={`defaultFlex ${styles.reasonBox}`}>
                        {reason_icon ? <img alt="" className={styles.reasonIcon} src={reason_icon} /> : null}
                        <div
                            className={styles.label}
                            dangerouslySetInnerHTML={{__html: reason}}
                            style={{color: '#545968'}}
                        />
                    </div>
                ) : null}
            </div>
        )
    }
    /** @name 横向卡片 */
    const renderHorizontalItem = (item, index) => {
        const {chart, name, ratio_labels, product_id, profit, profit_desc, url} = item
        return (
            <div
                className="flexColumn"
                key={name + index}
                onClick={() => {
                    logtool({ctrl: product_id, event: 'fundcard'})
                    jump(url)
                }}
                style={{flex: 1}}
            >
                <div className={styles.name}>{name}</div>
                {profit ? (
                    <div className="flexColumn" style={{marginTop: '.16rem'}}>
                        <div className={styles.smProfit} dangerouslySetInnerHTML={{__html: profit}} />
                        <div className={styles.profitLabel} style={{marginTop: '.08rem'}}>
                            {profit_desc}
                        </div>
                    </div>
                ) : null}
                {chart?.length > 0 ? (
                    <div style={{marginTop: '.24rem', width: '100%', height: '.72rem'}}>
                        <SmallChart data={chart} />
                    </div>
                ) : null}
                {ratio_labels?.length > 0 && (
                    <div className={styles.ratioLabelBox}>
                        {ratio_labels.map((label, i) => {
                            return (
                                <div className={`flexCenter ${styles[`ratioLabel${i + 1}`]}`} key={label + i}>
                                    {label}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }
    return (
        <div className={styles.productList}>
            {type === 'horizontal' ? (
                <div className="defaultFlex" style={{paddingBottom: '.24rem'}}>
                    {data.map(renderHorizontalItem)}
                </div>
            ) : null}
            {type === 'default' ? data.map(renderDefaultItem) : null}
        </div>
    )
}

export default Index
