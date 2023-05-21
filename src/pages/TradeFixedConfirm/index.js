/*
 * @Description:
 * @Autor: wxp
 * @Date: 2022-12-20 11:36:26
 */
import React, {Component} from 'react'
import http from '~/service'
import {jump, px} from '~/utils'
import styles from './index.module.scss'
import qs from 'querystring'
import {CheckCircleFill, CloseCircleFill} from 'antd-mobile-icons'

class TradeFixedConfirm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: {},
            heightArr: [],
        }
    }
    onLayout = (index, event) => {
        const arr = [...this.state.heightArr]
        arr[index] = event.currentTarget.getBoundingClientRect()?.height
        this.setState({
            heightArr: arr,
        })
    }
    componentDidMount() {
        const params = qs.parse(window.location.search.split('?')[1] || '')
        http.get('/trade/fix_invest/result/20210101', {invest_id: params?.invest_id}).then((res) => {
            this.setState({
                data: res.result,
            })
            document.title = res?.result?.title
        })
    }
    jumpTo = () => {
        jump({path: this.state.data.button?.url?.path, params: this.state.data.button?.url?.params}, 'replace')
    }
    render() {
        const {data, heightArr} = this.state
        return (
            <div className={styles.container}>
                {Object.keys(data).length > 0 && (
                    <div style={{paddingLeft: px(16), paddingRight: px(16)}}>
                        <div className={styles.top_sty}>
                            {data.is_success == true ? (
                                <CheckCircleFill color="#4BA471" fontSize={30} style={{paddingBottom: px(17)}} />
                            ) : (
                                <CloseCircleFill color="#DC4949" fontSize={50} style={{paddingBottom: px(17)}} />
                            )}
                            <div
                                style={{color: data.is_success ? '#4BA471' : '#DC4949', fontSize: px(16)}}
                                dangerouslySetInnerHTML={{__html: data.content}}
                            ></div>
                        </div>
                        <div className={styles.content_sty}>
                            {data.is_success == false && <div className={styles.desc_sty}>{data.items}</div>}
                            {data.items.length > 0 &&
                                data.items.map((_item, _index) => {
                                    return (
                                        <div
                                            style={{display: 'flex', position: 'relative'}}
                                            onLoad={(event) => this.onLayout(_index, event)}
                                            key={_index + '_item'}
                                        >
                                            <img
                                                alt=""
                                                src="https://static.licaimofang.com/wp-content/uploads/2022/10/question.png"
                                                style={{width: 0, height: 0, opacity: 0, zIndex: -1}}
                                            />
                                            {_index !== data.items.length - 1 && (
                                                <div
                                                    className={styles.line_sty}
                                                    style={{
                                                        height:
                                                            _index == data?.items?.length - 1
                                                                ? 0
                                                                : px(heightArr[_index]),
                                                    }}
                                                />
                                            )}
                                            <div className={styles.list_wrap} key={_index + '_item'}>
                                                <div className={styles.circle_sty} />
                                                <div
                                                    className={styles.item_sty}
                                                    dangerouslySetInnerHTML={{__html: _item}}
                                                ></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            <div className={styles.btn_sty} onClick={this.jumpTo}>
                                {data.button.text}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }
}

export default TradeFixedConfirm
