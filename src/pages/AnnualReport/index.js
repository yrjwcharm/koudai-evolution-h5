/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router'
import {Button, Divider} from 'antd-mobile'
import qs from 'qs'
import './index.css'
import {isIOS} from '../../utils'
import {getConfig, share} from '../../utils/WXUtils'
import GetHost from '../../config'
import http from '../../service'

const AnnualReport = () => {
    const history = useHistory()
    const params = qs.parse(window.location.search.split('?')[1] || '')
    const [imageList] = useState([
        'https://static.licaimofang.com/wp-content/uploads/2022/01/annual_report_001.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/01/annual_report_002.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/01/annual_report_003-1.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/01/annual_report_004.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/01/annual_report_005.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/01/annual_report_006.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/01/annual_report_007.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/01/annual_report_008.png',
        window.ReactNativeWebView
            ? 'https://static.licaimofang.com/wp-content/uploads/2022/01/company-9-2.png'
            : 'https://static.licaimofang.com/wp-content/uploads/2022/01/annual-report-09-outer.jpg',
    ])
    const [shareInfo, setShareInfo] = useState({})

    const logtool = (params) => {
        window.ReactNativeWebView.postMessage(`logParams=${JSON.stringify(params)}`)
    }

    const jump = (url) => {
        window.ReactNativeWebView.postMessage(`url=${JSON.stringify(url)}`)
    }

    useEffect(() => {
        document.title = params.title ? decodeURIComponent(params.title) : '理财魔方｜2021 大数据年报'
        if (params.uid) {
            getConfig(() => {
                http.get('/share/common/info/20210101', {scene: 'annual', uid: params.uid}, false).then((res) => {
                    if (res.code === '000000') {
                        window.LogTool('AnnualReportH5', params?.channelFr)
                        setShareInfo(res.result.share_info)
                        share({
                            title: res.result.share_info.title,
                            content: res.result.share_info.content,
                            url: res.result.share_info.link,
                            img: res.result.share_info.avatar,
                        })
                    }
                })
            })
        }
    }, [])

    return (
        <div className={`annualReport${isIOS() ? ' ios' : ''}`}>
            {imageList.map((img, index) => {
                return <img className="image" key={img + index} src={img} alt="" />
            })}
            {window.ReactNativeWebView && (
                <Button
                    className="redPacketLog"
                    block
                    shape="rounded"
                    onClick={() => {
                        jump({
                            params: {type: 'year_share'},
                            path: 'InviteFriends',
                            type: 1,
                        })
                        logtool(['redPacketStart', 100])
                    }}
                >
                    查看红包获取记录
                </Button>
            )}
            <div className={`defaultFlex fixedBtns${isIOS() ? ' ios' : ''}`}>
                <Divider className="border" />
                {window.ReactNativeWebView ? (
                    <>
                        {params.show_personal_report == 1 && (
                            <Button
                                className="personal"
                                fill="outline"
                                onClick={() => {
                                    jump({
                                        path: 'ReportWebView',
                                        type: 1,
                                        params: {
                                            link: `${GetHost().SERVER_URL.H5}/PersonalAnnualReport`,
                                            scene: 'annual_report',
                                            timestamp: 1,
                                            title: '2021理财年报',
                                        },
                                    })
                                    logtool(['personalReportStart'])
                                }}
                            >
                                查看个人年报
                            </Button>
                        )}
                        <Button
                            className="share"
                            color="primary"
                            onClick={() => {
                                window.ReactNativeWebView.postMessage(`shareLink=${JSON.stringify(shareInfo)}`)
                                logtool(['annualReportShareStart'])
                            }}
                        >
                            分享年报
                            <span className="superscript">拿红包</span>
                        </Button>
                    </>
                ) : (
                    <Button
                        className="register"
                        color="primary"
                        onClick={() => {
                            window.LogTool('AnnualReportH5Register', params?.channelFr)
                            history.push(`/invite${window.location.search}`)
                        }}
                    >
                        <div className="registorBtnWrap">
                            <span className="getWelfare">领福利</span>
                            立即注册
                        </div>
                    </Button>
                )}
            </div>
        </div>
    )
}

export default AnnualReport
