/*
 * @Date: 2022-12-14 13:44:26
 * @Description: 赎回
 */
import {Button, Dialog, Picker, Radio, Toast} from 'antd-mobile'
import {DownOutline, UpOutline} from 'antd-mobile-icons'
import React, {Component} from 'react'
import BottomDesc from '~/components/BottomDesc'
import PasswordModal from '~/components/Modal/PasswordModal'
import http from '~/service'
import {getUrlParams, jump} from '~/utils'
import {onlyNumber} from '~/utils/appUtil'
import './index.scss'
let timer = null
export default class TradeRedeem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: '',
            text: '',
            check: [true, false],
            inputValue: '',
            toggleList: false,
            btnClick: false,
            showMask: false,
            password: '',
            trade_method: 0,
            tableData: {},
            reasonParams: '',
            redeem_id: '',
            redeemTo: '银行卡',
            tips: '',
            init: 1,
            notice: '', //不足7天的基金弹窗
            short_cut_options: [],
            min_ratio: '',
        }
        this.poid = getUrlParams(props.location.search).poid || 'X00F000003'
        this.notice = ''
        this.inputValue = 0
    }
    componentDidMount() {
        document.title = '赎回'
        http.get('/trade/redeem/info/20210101', {
            poid: this.poid,
        }).then((res) => {
            if (res.code === '000000') {
                this.getPlanInfo(res.result?.scene)
                if (res.result.pay_methods.default === 1) {
                    this.setState({
                        check: [false, true],
                    })
                } else {
                    this.setState({
                        check: [true, false],
                    })
                }
                this.setState({
                    data: res.result,
                    short_cut_options: res?.result?.redeem_info?.options,
                })
            }
        })
    }
    componentWillUnmount() {
        // Picker.hide();
    }
    getPlanInfo(scene) {
        return new Promise((resolve, reject) => {
            const {tableData, init, inputValue} = this.state
            http.get('/trade/redeem/plan/20210101', {
                percent: inputValue / 100,
                trade_method: this.state.trade_method,
                poid: this.poid,
                init,
            }).then((res) => {
                if (res.code === '000000') {
                    tableData.head = res.result.header || {}
                    tableData.body = res.result.body || []
                    this.notice = res.result.notice
                    if (scene == 'adviser' && init == 1) {
                        this.setState((prev) => ({
                            tips: res.result.amount_desc || prev.tips,
                            short_cut_options: res?.result?.options || [],
                            min_ratio: res?.result?.min_percent?.key,
                        }))
                        // if (res.result?.options) {
                        //     this.setState({
                        //         short_cut_options: res?.result?.options||[],
                        //     });
                        // } else {
                        //     this.setState({
                        //         short_cut_options: [],
                        //     });
                        // }
                    }
                    if (init != 1) {
                        this.setState((prev) => ({
                            tableData,
                            redeem_id: res.result.redeem_id,
                            tips: res.result.amount_desc || prev.tips,
                        }))
                    }
                    resolve(res.result.redeem_id)
                } else {
                    this.setState({
                        btnClick: false,
                    })
                    this.notice = ''
                    reject()
                    Toast.show({content: res.message})
                }
            })
        })
    }
    radioChange(index, type, name) {
        let check = this.state.check
        check = check.map((item) => false)
        check[index] = true
        this.setState(
            {
                check,
                trade_method: type,
                redeemTo: name,
            },
            () => {
                this.getPlanInfo()
            },
        )
    }
    pressChange(percent) {
        this.inputValue = percent * 100
        this.setState(
            {
                inputValue: (percent * 100).toString(),
                btnClick: true,
                init: 0,
            },
            () => {
                this.getPlanInfo()
            },
        )
    }
    toggleFund() {
        const toggleList = this.state.toggleList
        this.setState({
            toggleList: !toggleList,
        })
    }

    passwordInput = () => {
        this.passwordModal.show()
    }
    submitData = async (password) => {
        let toast = Toast.show({
            icon: 'loading',
            content: '加载中…',
        })
        let redeem_id = await this.getPlanInfo()
        http.post('/trade/redeem/do/20210101', {
            redeem_id: redeem_id || this.state.redeem_id,
            password,
            percent: this.inputValue / 100,
            trade_method: this.state.trade_method,
            poid: this.poid,
        }).then((res) => {
            toast.close()
            if (res.code === '000000') {
                jump({
                    path: 'TradeProcessing',
                    params: {txn_id: res.result.txn_id},
                })
            } else {
                Toast.show(res.message)
            }
        })
    }

    onChange = (e) => {
        let _text = e.target.value
        _text = onlyNumber(_text)
        if (_text && _text != 0) {
            if (_text > 100) {
                _text = '100'
            }
            this.inputValue = _text
            this.setState({btnClick: true, inputValue: _text, init: 0}, () => {
                timer && clearTimeout(timer)
                timer = setTimeout(() => {
                    this.getPlanInfo()
                }, 300)
            })
        } else {
            this.setState({btnClick: false, inputValue: '', tips: this.redeemTip, init: 1})
        }
    }
    redeemClick = () => {
        window.LogTool('confirmRedeemEnd', this.poid)
        if (this.notice) {
            Dialog.show({
                title: '赎回确认',
                content: this.notice,
                closeOnAction: true,
                closeOnMaskClick: true,
                actions: [
                    [
                        {
                            key: 'cancel',
                            text: '继续赎回',
                            style: {color: '#9aa0b1'},
                            onClick: () => {
                                this.redeemReason()
                            },
                        },
                        {
                            key: 'confirm',
                            text: '取消赎回',
                            style: {color: '#0051CC'},
                            onClick: () => {
                                this.props.history.goBack()
                            },
                        },
                    ],
                ],
            })
        } else {
            this.redeemReason()
        }
    }
    redeemReason = () => {
        setTimeout(async () => {
            const option = []
            // var _id
            this.state.data?.survey?.option?.forEach?.((_item, _index) => {
                option.push({
                    label: _item.v,
                    value: _item.id,
                })
            })
            if (!option.length) {
                this.passwordInput()
                return
            }
            const value = await Picker.prompt({
                columns: [option],
            })
            if (value) {
                http.get('/trade/redeem/survey/20210101', {
                    id: value[0],
                }).then((res) => {
                    this.passwordInput()
                })
            }
        }, 250)
    }
    onBlur = () => {
        const {min_ratio} = this.state
        let _text = this.state.inputValue
        if (_text && min_ratio) {
            if (_text < (min_ratio * 100).toFixed(2)) {
                _text = `${(min_ratio * 100).toFixed(2)}`
                this.inputValue = _text
                this.setState({btnClick: true, inputValue: _text, init: 0}, () => {
                    timer && clearTimeout(timer)
                    timer = setTimeout(() => {
                        this.getPlanInfo()
                    }, 300)
                })
            }
        }
    }
    render() {
        const {data, tableData, toggleList, btnClick, redeemTo, tips, short_cut_options} = this.state
        return (
            <div id="TradeRedeem">
                <div className="title">赎回至{redeemTo}</div>
                {/* 银行卡 */}
                <div style={{backgroundColor: '#fff', padding: '0 16px', marginBottom: '12px'}}>
                    {data?.pay_methods?.methods.map((_item, index) => {
                        return (
                            <div
                                key={index}
                                className="pay_methods flexBetween"
                                style={{borderBottomWidth: index == 0 ? 0.5 : 0}}
                                onClick={() => this.radioChange(index, _item.pay_type, _item.bank_name)}
                            >
                                <div className="defaultFlex">
                                    <img alt="" style={{width: 24, height: 24, marginRight: 8}} src={_item.bank_icon} />
                                    <span> {_item.bank_name}</span>
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            color: '#DC4949',
                                            marginLeft: '10px',
                                            marginBottom: '-3px',
                                        }}
                                    >
                                        {_item.desc}
                                    </div>
                                </div>
                                <Radio
                                    checked={this.state.check[index]}
                                    style={{
                                        '--icon-size': '20px',
                                    }}
                                    onChange={() => {
                                        this.radioChange(index, _item.pay_type, _item.bank_name)
                                    }}
                                />
                            </div>
                        )
                    })}
                </div>
                {/* 输入 */}
                <div style={{backgroundColor: '#fff', padding: '15px 15px 0px 15px'}}>
                    <div className="flexBetween">
                        {' '}
                        <span style={{fontSize: '16px'}}> {data?.redeem_info?.title}</span>
                        <div>
                            {short_cut_options?.map((_i, _d) => {
                                return (
                                    <span
                                        className="btn_percent"
                                        key={_d + _i}
                                        onClick={() => this.pressChange(_i.percent)}
                                    >
                                        {_i.text}
                                    </span>
                                )
                            })}
                        </div>
                    </div>
                    <div style={{position: 'relative'}}>
                        <input
                            className="inputRe"
                            value={this.state.inputValue}
                            onChange={(val) => this.onChange(val)}
                            onBlur={this.onBlur}
                            placeholder="请输入赎回百分比"
                        />
                        <span className="percentIcon">%</span>
                    </div>
                    {tips && (
                        <div
                            dangerouslySetInnerHTML={{__html: tips}}
                            style={{
                                color: '#545968',
                                fontSize: '12px',
                                lineHeight: '18px',
                                padding: '12px 0',
                                borderTop: '0.5px solid #DDDDDD',
                            }}
                        ></div>
                    )}
                </div>
                {/* 持有基金 */}
                <div className="holdFund">
                    <div className="flexBetween holdFundHeader" onClick={() => this.toggleFund()}>
                        <div style={{fontSize: '14px'}}> {data?.redeem_info?.redeem_text}</div>
                        {toggleList ? (
                            <UpOutline size={12} color={'#9095A5'} />
                        ) : (
                            <DownOutline size={12} color={'#9095A5'} />
                        )}
                    </div>
                    {toggleList && (
                        <div className="defaultFlex" style={{padding: '10px 0', borderTop: '0.5px solid #DDD'}}>
                            <div style={{fontSize: '12px', color: '#9095A5', flex: 1, textAlign: 'left'}}>
                                {' '}
                                {tableData?.head?.name}
                            </div>
                            <div style={{fontSize: '12px', color: '#9095A5', width: '80px', textAlign: 'center'}}>
                                {' '}
                                {tableData?.head?.amount_total}
                            </div>
                            <div style={{fontSize: '12px', color: '#9095A5', width: '80px', textAlign: 'right'}}>
                                {' '}
                                {tableData?.head?.amount}
                            </div>
                        </div>
                    )}
                    <div>
                        {toggleList &&
                            tableData?.body?.map((_item, _index) => {
                                return (
                                    <div key={_index + 'item'} className="defaultFlex" style={{padding: '8px 0'}}>
                                        <span style={{fontSize: '12px', color: '#121D3A', flex: 1, textAlign: 'left'}}>
                                            {_item.name}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: '12px',
                                                color: '#121D3A',
                                                width: '80px',
                                                textAlign: 'center',
                                            }}
                                        >
                                            {_item?.amount_total}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: '12px',
                                                color: '#121D3A',
                                                width: '80px',
                                                textAlign: 'right',
                                            }}
                                        >
                                            {_item?.amount}
                                        </span>
                                    </div>
                                )
                            })}
                    </div>
                </div>
                <PasswordModal _ref={(ref) => (this.passwordModal = ref)} onDone={this.submitData} />
                <div style={{padding: '8px 16px', background: '#fff', position: 'fixed', bottom: 0, width: '100%'}}>
                    <Button
                        onClick={this.redeemClick}
                        block
                        size="large"
                        disabled={data?.button?.avail == 0 || btnClick == false}
                        style={{
                            backgroundColor: data?.button?.avail == 0 || btnClick == false ? '#CEDDF5' : '#0051CC',
                            color: '#fff',
                            opacity: 1,
                        }}
                    >
                        {data?.button?.text}
                    </Button>
                </div>
                <BottomDesc style={{marginBottom: '80px'}} />
            </div>
        )
    }
}
