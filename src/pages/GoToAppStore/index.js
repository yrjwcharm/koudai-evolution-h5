import React, {useEffect} from 'react'
import {isIOS} from '../../utils'
import './index.css'

const GoToAppStore = () => {
    useEffect(() => {
        const inWeChat = () => {
            const ua = window.navigator.userAgent.toLowerCase()
            // eslint-disable-next-line eqeqeq
            if (ua.match(/MicroMessenger/i) == 'micromessenger') {
                return true
            } else {
                return false
            }
        }
        if (inWeChat()) {
            document.getElementById('wx-download-mask').style.display = 'block'
        } else {
            if (isIOS()) {
                window.location.href = 'https://itunes.apple.com/cn/app/li-cai-mo-fang/id975987023'
            }
        }
    }, [])

    return (
        <div style={{paddingBottom: 60}}>
            <img
                style={{display: 'block', width: '100%'}}
                src="https://static.licaimofang.com/wp-content/uploads/2022/01/01@2x.png"
                alt=""
            />
            <img
                style={{display: 'block', width: '100%'}}
                src="https://static.licaimofang.com/wp-content/uploads/2022/01/02@2x.png"
                alt=""
            />
            <img
                style={{display: 'block', width: '100%'}}
                src="https://static.licaimofang.com/wp-content/uploads/2022/01/03@2x.png"
                alt=""
            />
            <img
                style={{display: 'block', width: '100%'}}
                src="https://static.licaimofang.com/wp-content/uploads/2022/01/04@2x.png"
                alt=""
            />
            <div id="wx-download-mask">
                <div className="wx-download-guide" />
            </div>
            <div className="fixed-footer footer">
                <div className="row" style={{backgroundColor: '#f4f7f9'}}>
                    <div className="col col-66" style={{lineHeight: '44px'}}>
                        <div className="main-title" style={{fontSize: '14px'}}>
                            下载app开始投资
                        </div>
                    </div>
                    <div className="col">
                        <a
                            href={
                                isIOS()
                                    ? 'https://itunes.apple.com/cn/app/li-cai-mo-fang/id975987023'
                                    : 'market://details?id=com.licaimofang.app'
                            }
                            className="button button-primary button-small download-app"
                        >
                            免费下载
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GoToAppStore
