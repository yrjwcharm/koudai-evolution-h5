/*
 * @Date: 2021-05-08 14:25:51
 * @Author: dx
 * @LastEditors: yhc
 * @LastEditTime: 2022-01-19 15:01:31
 * @Description: 邀请好友
 */
import React, {useEffect, useRef, useState} from 'react'
import './index.css'
import http from '../../service'
import {Toast} from 'antd-mobile-v2'
import robot from '../../image/icon/robot.png'
import qs from 'qs'
import {getConfig, share} from '../../utils/WXUtils'
import baseConfig from '../../config'

const errorCode = {
    20000: '操作成功',
    10001: '该手机号已经注册，请直接前往APP登录',
    10002: '该手机号尚未注册',
    10003: '手机号码是必填域, 不能为空',
    10004: '手机号码格式不合法',
    10011: '密码不能为空',
    10012: '密码太简单',
    10013: '密码格式不合法',
    10014: '密码验证失败',
    10030: 'did已经存在',
    10031: 'did不存在',
    10032: 'did为必填域, 不能为空',
    10033: 'did格式不合法. 例如:含有特殊字符',
    10040: '验证码不能为空',
    10041: '验证码无效',
    10042: '验证码已经过期',
    10043: '验证码的操作类型不合法',
    10044: '验证码验证失败',
    10045: '验证码的操作类型是必填参数,不能为空',
    10050: '会话不存在',
    10060: '短时间请求次数太多,请等待一段时间然后重试',
    10083: '验证码发送失败',
}
const phoneReg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/

const InviteRegister = ({location}) => {
    const [uid, setUid] = useState('')
    const [mobile, setMobile] = useState('')
    const [fr, setFr] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [code, setCode] = useState('')
    const [codeText, setCodeText] = useState('获取验证码')
    const timeRef = useRef(60)
    const getFlag = useRef(true)
    const submitFlag = useRef(true)
    const imgs = useRef([
        'https://static.licaimofang.com/wp-content/uploads/2021/11/invite_01.jpg',
        'https://static.licaimofang.com/wp-content/uploads/2022/01/02@2x.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/01/03@2x.png',
        'https://static.licaimofang.com/wp-content/uploads/2022/01/04@2x.png',
    ])

    const onChange = (key, value) => {
        if (key === 'phone') {
            setPhone(value.replace(/\D/g, ''))
        } else if (key === 'code') {
            setCode(value.replace(/\D/g, ''))
        } else {
            setPassword(value)
        }
    }
    const countDown = () => {
        setCodeText(timeRef.current + '秒')
        setTimeout(() => {
            if (timeRef.current > 1) {
                timeRef.current -= 1
                countDown()
            } else {
                setCodeText('重新获取')
                getFlag.current = true
                timeRef.current = 60
            }
        }, 1000)
    }
    const getCode = () => {
        if (getFlag.current) {
            if (phone === '') {
                Toast.fail('手机号不能为空')
            } else if (!phoneReg.test(phone)) {
                Toast.fail('手机号码格式错误')
            } else {
                getFlag.current = false
                http.get(`/0529/mobile/${phone}/available`, {}, false, 'passport').then((data) => {
                    if (data.code === 20000) {
                        http.post(
                            `/20170326/passport/${phone}/verify_code`,
                            {operation: 'passport_create'},
                            '发送中...',
                            'passport',
                        ).then((res) => {
                            if (res.code === 20000) {
                                countDown()
                                Toast.success('验证码发送成功')
                            } else {
                                getFlag.current = true
                                Toast.fail(errorCode[res.code] || res.message)
                            }
                        })
                    } else {
                        getFlag.current = true
                        Toast.fail(errorCode[data.code] || data.message)
                    }
                })
            }
        }
    }
    const onSubmit = () => {
        if (submitFlag.current) {
            const reg = /(?!\d+$)(?![a-zA-Z]+$)(?![!"#$%&'()*+,-./:;<=>?@[\\]\^_`{\|}~]+$).{8,20}/

            if (phone === '') {
                Toast.fail('手机号不能为空')
            } else if (!phoneReg.test(phone)) {
                Toast.fail('手机号码格式错误')
            } else if (password === '') {
                Toast.fail('请设置登录密码')
            } else if (password.length < 8) {
                Toast.fail('登录密码不能少于8位')
            } else if (!reg.test(password)) {
                Toast.fail('密码必须包含数字、英文和符号至少两项')
            } else if (
                password
                    .replace(/\d/g, '')
                    .replace(/[a-zA-Z]/g, '')
                    .replace(/[_!"#$%&'()*+,-./:;<=>?@[\]^`{|}~\\]/g, '')
            ) {
                Toast.fail('密码含有无效字符')
            } else if (code === '') {
                Toast.fail('验证码不能为空')
            } else if (code.length < 6) {
                Toast.fail('请输入6位验证码')
            } else {
                submitFlag.current = false
                const params = fr
                    ? {
                          mobile: phone,
                          verify_code: code,
                          password,
                          invite_phone: mobile,
                          uid,
                          channel: fr,
                          bonus: 'true',
                          did: 'invite',
                      }
                    : {
                          mobile: phone,
                          verify_code: code,
                          password,
                          invite_phone: mobile,
                          uid,
                          did: 'invite',
                      }
                http.get(`/0529/mobile/${phone}/available`, {}, false, 'passport').then((data) => {
                    if (data.code === 20000) {
                        fetch(`${baseConfig().SERVER_URL['mapi']}/20170523/promotion/passport`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(params),
                        })
                            .then((res) => res.json())
                            .then((res) => {
                                if (res.code === 20000) {
                                    submitFlag.current = true
                                    Toast.success('注册成功', 1.5, () => {
                                        window.location.href =
                                            'https://a.app.qq.com/o/simple.jsp?pkgname=com.licaimofang.app'
                                    })
                                } else {
                                    submitFlag.current = true
                                    Toast.fail(errorCode[res.code] || res.message)
                                }
                            })
                    } else {
                        submitFlag.current = true
                        Toast.fail(errorCode[data.code] || data.message)
                    }
                })
            }
        }
    }
    const configShare = () => {
        http.get('/share/common/info/20210101', {scene: 'invite', uid, url: window.location.href}, false).then(
            (res) => {
                if (res.code === '000000') {
                    share({
                        title: res.result.share_info.title,
                        content: res.result.share_info.content,
                        url: res.result.share_info.link,
                        img: res.result.share_info.avatar,
                    })
                }
            },
        )
    }

    useEffect(() => {
        document.title = '我邀请您一起定制家庭理财计划'
        // Toast.config({duration: 1.5});
        if (location.search.split('?')[1]) {
            const params = qs.parse(location.search.split('?')[1])
            setUid(params.uid || '')
            setMobile(params.mobile || '')
            setFr(params.channelFr || '')
            window.LogTool('InviteRegisterH5', params?.channelFr)
        }
    }, [location])
    useEffect(() => {
        if (uid) {
            getConfig(configShare)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uid])

    return (
        <div className="inviteRegisterContainer">
            <div style={{position: 'relative'}}>
                {imgs.current.map((img, idx) => {
                    return <img src={img} key={idx} alt="" />
                })}
                <div className="registerBox">
                    <div className="defaultFlex">
                        <img src={robot} alt="" />
                        <span className="from">
                            您的朋友 <span style={{color: '#0051CC'}}>{mobile}</span> 邀请您
                            <span style={{fontWeight: 600}}>定制家庭理财计划</span>
                        </span>
                    </div>
                    <input
                        style={{marginTop: '.4rem'}}
                        type="tel"
                        placeholder="手机号"
                        maxLength={11}
                        autoComplete="off"
                        className="input"
                        value={phone}
                        onChange={(e) => onChange('phone', e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="设置登录密码"
                        maxLength={20}
                        autoComplete="new-password"
                        className="input"
                        value={password}
                        onChange={(e) => onChange('password', e.target.value)}
                    />
                    <div style={{position: 'relative'}}>
                        <input
                            type="text"
                            placeholder="验证码"
                            maxLength={6}
                            autoComplete="off"
                            className="input"
                            value={code}
                            onChange={(e) => onChange('code', e.target.value)}
                        />
                        <span className="getCode" onClick={getCode}>
                            {codeText}
                        </span>
                    </div>
                    <div className="submit" onClick={onSubmit}>
                        立即定制
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InviteRegister
