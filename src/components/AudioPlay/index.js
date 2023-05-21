/*
 * @Date: 2021-05-20 12:11:45
 * @Author: yhc
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-01 17:27:12
 * @Description:
 */
import React, {Component} from 'react'
import ReactSlider from 'react-slider'
import './index.css'
import pauseImg from '../../image/icon/pause.png'
import playImg from '../../image/icon/play.png'
import rollbackImg from '../../image/icon/rollback.png'
import speedImg from '../../image/icon/speed.png'
import tips from '../../image/icon/tips.png'
import {Picker, Toast} from 'antd-mobile-v2'
import http from '../../service'
import {compareVersion, storage} from '~/utils'
class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isPlay: false,
            volume: 100,
            allTime: props.duration,
            currentTime: 0,
            isPost: false, //是否已经提交信息
            showErrorBtn: false,
            showTip: false,
            pickerVisible: false,
        }
        this.selectData = [
            {
                label: '不能正常播放',
                value: 1,
            },
            {
                label: '音质太差',
                value: 2,
            },
            {
                label: '声音太小',
                value: '3',
            },
        ]
    }

    componentDidMount() {
        //ios message监听不到
        window.onVoiceData = () => {
            this.setState({showTip: true, showErrorBtn: false})
        }
        window.changeAudioTime = this.changeTime
        window.audioPlay = this.playAudio
        window.audioPause = this.pauseAudio
        const {id} = this.props
        const audio = document.getElementById(`audio${id}`)
        audio.addEventListener('pause', this.pauseAudio)
        audio.addEventListener('play', this.playAudio)
        audio.addEventListener('error', this.handleError)
    }
    componentWillUnmount() {
        const {id} = this.props
        const audio = document.getElementById(`audio${id}`)
        audio.removeEventListener('pause', this.pauseAudio)
        audio.removeEventListener('play', this.playAudio)
        audio.removeEventListener('error', this.handleError)
    }
    handleError = () => {
        this.setState({showErrorBtn: true})
    }
    formatSecond(time) {
        const second = Math.floor(time % 60)
        let minite = Math.floor(time / 60)
        return `${minite}:${second >= 10 ? second : `0${second}`}`
    }

    // 该视频已准备好开始播放~
    onCanPlay = () => {
        const {id, duration} = this.props
        const audio = document.getElementById(`audio${id}`)
        setTimeout(() => {
            this.setState({
                allTime: duration || audio.duration,
            })
        })
    }

    playAudio = () => {
        window.ReactNativeWebView?.postMessage('audioPlay')
        const {id} = this.props
        const audio = document.getElementById(`audio${id}`)
        if (
            window?.ReactNativeWebView &&
            compareVersion(storage.getItem('loginStatus')?.ver || '6.0.0', '7.0.0') >= 0
        ) {
            audio.muted = true
        }
        audio.play()
        window.LogTool('articlePlayStart', this.props.id)
        this.setState({
            isPlay: true,
        })
    }

    pauseAudio = () => {
        window.ReactNativeWebView?.postMessage('audioPause')
        const {id} = this.props
        const audio = document.getElementById(`audio${id}`)
        audio.pause()
        this.setState({
            isPlay: false,
        })
    }
    speedAudio = () => {
        if (this.state.currentTime === this.state.allTime) return
        window.LogTool('articleForward15sStart', this.props.id)
        this.changeTime(this.state.currentTime + 15)
    }
    rollbackAudio = () => {
        if (this.state.currentTime === 0) return
        window.LogTool('articleBackward15sStart', this.props.id)
        this.changeTime(this.state.currentTime - 15)
    }
    changeTime = (value, scene) => {
        const {id} = this.props
        const audio = document.getElementById(`audio${id}`)
        this.setState({
            currentTime: value,
        })
        if (scene != 'rn') {
            window.ReactNativeWebView?.postMessage(`changeAudioTime:${value}`)
        }
        audio.currentTime = value
        if (value === audio.duration) {
            this.setState({
                isPlay: false,
            })
        }
    }
    // 当前播放位置改变时执行
    onTimeUpdate = () => {
        const {id} = this.props
        const audio = document.getElementById(`audio${id}`)
        if (audio.duration - audio.currentTime <= 10) {
            if (!this.state.isPost) {
                this.props.postMessage && this.props.postMessage()
                this.setState({isPost: true})
            }
        }
        this.props.onChangeTime && this.props.onChangeTime(audio.currentTime)
        this.setState({
            currentTime: audio.currentTime,
        })
        if (audio.currentTime === audio.duration) {
            this.setState({
                isPlay: false,
            })
        }
    }
    feedBack = (val) => {
        http.post('/community/feedback/20210701', {
            resource_id: this.props.id,
            resource_type: 1,
            option: val[0],
        }).then((res) => {
            Toast.info(res.message)
            if (res.code === '000000') {
                this.setState({pickerVisible: false, showTip: true})
            }
        })
    }
    render() {
        const {src, id} = this.props
        const {isPlay, allTime, currentTime, showErrorBtn, showTip, pickerVisible} = this.state
        return (
            <>
                <div
                    style={{backgroundColor: '#F6F7F9', height: '2.3rem', padding: '0.16rem 0.24rem', borderRadius: 6}}
                >
                    <audio
                        id={`audio${id}`}
                        src={src}
                        // src='https://public.licaimofang.com/cms/upload/2021-06-28/272986223bf1d94bac4d39c85f5640e6.mp3'
                        ref={(audio) => {
                            this.audioDom = audio
                        }}
                        preload={'auto'}
                        onCanPlay={this.onCanPlay}
                        onTimeUpdate={this.onTimeUpdate}
                    ></audio>
                    <ReactSlider
                        className="horizontal-slider"
                        thumbClassName="example-thumb"
                        trackClassName="example-track"
                        min={0}
                        step={0.01}
                        style={{width: '100%'}}
                        onChange={this.changeTime}
                        max={allTime}
                        value={currentTime}
                        renderThumb={(props, state) => (
                            <div {...props}> {this.formatSecond(currentTime) + '/' + this.formatSecond(allTime)}</div>
                        )}
                    />
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-around',
                            padding: '0 20px',
                            marginTop: '0.46rem',
                        }}
                    >
                        <div onClick={this.rollbackAudio}>
                            <img src={rollbackImg} alt="" className="sm_img" />
                        </div>
                        {isPlay ? (
                            <div onClick={this.pauseAudio}>
                                <img src={pauseImg} alt="" className="large_img" />
                            </div>
                        ) : (
                            <div onClick={this.playAudio}>
                                <img src={playImg} alt="" className="large_img" />
                            </div>
                        )}
                        <div onClick={this.speedAudio}>
                            <img src={speedImg} alt="" className="sm_img" />
                        </div>
                    </div>
                </div>
                <Picker
                    data={this.selectData}
                    title={'音质反馈'}
                    visible={pickerVisible}
                    cols={1}
                    className="forss"
                    onOk={this.feedBack}
                    onDismiss={() => {
                        this.setState({pickerVisible: false})
                    }}
                />
                {showErrorBtn && this.props.feedback_status !== 1 ? (
                    <div
                        onClick={() => {
                            if (window.ReactNativeWebView) {
                                this.props.postError()
                            } else {
                                this.setState({pickerVisible: true})
                            }
                        }}
                        style={{textAlign: 'right', marginTop: '0.16rem'}}
                    >
                        <img className="err_icon" src={tips} alt="" />
                        <span className="err_text">音质反馈</span>
                    </div>
                ) : showTip ? (
                    <div style={{textAlign: 'right', marginTop: '0.16rem'}}>
                        <span style={{fontSize: '0.24rem', color: '#9AA1B2'}}>已成功反馈，会尽快修复问题。</span>
                    </div>
                ) : null}
            </>
        )
    }
}

export default App
