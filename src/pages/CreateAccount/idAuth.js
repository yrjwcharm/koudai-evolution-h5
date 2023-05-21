/*
 * @Date: 2022-12-12 10:22:40
 * @Description: 开户实名认证
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useLocation} from 'react-router'
import {ActionSheet, Button, Dialog, Form, Input, Modal, Picker, SafeArea, Toast} from 'antd-mobile'
import qs from 'qs'
import BottomDesc from '~/components/BottomDesc'
import {BottomModal} from '~/components/Modal'
import first from '~/image/account/first.png'
import idFront from '~/image/account/idfront.png'
import idBack from '~/image/account/idback.png'
import personalMes from '~/image/account/personalMes.png'
import uploadIdTip from '~/image/account/upload_id_tip.png'
import baseConfig from '~/config'
import http from '~/service'
import {jump, storage} from '~/utils'
import styles from './index.module.scss'
import {debounce} from 'lodash'

const {Item} = Form

const IdAuth = ({history}) => {
    const [form] = Form.useForm()
    const location = useLocation()
    const params = location.search ? qs.parse(location.search.slice(1)) : {}
    const bottomModal = useRef()
    const handle = useRef()
    const typeRef = useRef()
    const canSendCode = useRef(true)
    const timer = useRef()
    const defaultRcode = useRef()
    const [careerList, setCareerList] = useState([])
    const [pickerVisible, setPickerVisible] = useState(false)
    const [idImg, setIdImg] = useState({})
    const {back, front} = idImg
    const [idInfo, setIdInfo] = useState({})
    const {id_no = '', name = '', rcode = '', rname = ''} = idInfo
    const [modalData, setModalData] = useState({})
    const [modalVisible, setModalVisible] = useState(false)
    const [code, setCode] = useState('')
    const [countdown, setCountdown] = useState(60)
    const [sendCode, setSendCode] = useState('获取验证码')

    const btnDisabled = useMemo(() => {
        return back && front && name.length >= 2 ? false : true
    }, [back, front, name])

    const showActionSheet = (type) => {
        typeRef.current = type
        handle.current = ActionSheet.show({
            actions: [
                {key: 'gallery', text: '从相册中获取'},
                {key: 'camera', text: '拍照'},
            ],
            cancelText: '取消',
            closeOnAction: true,
            closeOnMaskClick: true,
            onAction,
            safeArea: true,
        })
    }

    const onAction = ({key}) => {
        const input = document.createElement('input')
        input.accept = 'image/*'
        if (key === 'camera') input.capture = 'camera'
        input.onchange = () => {
            const formData = new FormData()
            formData.append('desc', typeRef.current)
            formData.append('file', input.files[0])
            Toast.show({content: '正在上传...', duration: 0, icon: 'loading'})
            fetch(
                `${baseConfig().SERVER_URL['kapi']}/mapi/identity/upload/20210101?request_id=${
                    new Date().getTime().toString() + parseInt(Math.random() * 1e6, 16)
                }`,
                {
                    body: formData,
                    headers: {
                        Accept: 'application/x-www-form-urlencoded; charset=utf-8',
                        Authorization: storage.getItem('loginStatus')?.access_token,
                    },
                    method: 'POST',
                    timeoutInterval: 30000,
                },
            )
                .then((res) => res.json())
                .then((res) => {
                    Toast.clear()
                    Toast.show(res.message)
                    if (res.code === '000000') {
                        Toast.show({content: '上传成功'})
                        const {identity_no, name, origin_url} = res.result
                        setIdImg((prev) => ({...prev, [typeRef.current]: origin_url}))
                        if (typeRef.current === 'front') {
                            setIdInfo((prev) => ({...prev, id_no: identity_no, name}))
                            form.setFieldsValue({id_no: identity_no, name, rcode: [defaultRcode.current]})
                        }
                    }
                })
                .finally(() => {
                    setTimeout(Toast.clear, 2000)
                })
        }
        input.type = 'file'
        input.click?.()
    }

    const onSendCode = () => {
        if (canSendCode.current) {
            canSendCode.current = false
            http.post('/passport/send_bind_user_partner_verify_code/20221220', {id_no, name})
                .then((res) => {
                    Toast.show(res.message)
                    if (res.code === '000000') {
                        setSendCode(`${countdown}秒重发`)
                        timer.current = setInterval(() => {
                            canSendCode.current = false
                            setCountdown((prev) => {
                                setSendCode(`${prev - 1}秒重发`)
                                if (prev <= 1) {
                                    clearInterval(timer.current)
                                    canSendCode.current = true
                                    setCountdown(60)
                                    setSendCode('重发验证码')
                                }
                                return prev - 1
                            })
                        }, 1000)
                    }
                })
                .finally(() => {
                    setTimeout(() => {
                        canSendCode.current = true
                    }, 1000)
                })
        }
    }

    const onBindSubmit = () => {
        Toast.show({content: '请稍后...', duration: 0, maskClickable: false})
        http.post('/passport/bind_user_partner_uid/20221220', {...params, code, id_no, name})
            .then((res) => {
                Toast.clear()
                Toast.show(res.message)
                if (res.code === '000000') {
                    const {auth_info, url} = res.result
                    storage.setItem('loginStatus', auth_info)
                    setModalVisible(false)
                    url && jump(url, 'replace')
                }
            })
            .finally(() => {
                setTimeout(() => {
                    Toast.clear()
                }, 2000)
            })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onSubmit = useCallback(
        debounce(
            () => {
                http.get('/passport/open_account/check/20210101', {
                    id_no,
                    name,
                }).then((res) => {
                    if (res.code === '000000') {
                        const {pop} = res.result
                        if (pop?.content) Dialog.confirm({content: pop.content, onConfirm: history.goBack})
                        else history.push(`/BankInfo?${qs.stringify({...params, id_no, name, rcode, rname})}`)
                    } else if (res.code === 'A30001') {
                        setModalData(res.result)
                        setModalVisible(true)
                    } else {
                        Toast.show({content: res.message})
                    }
                })
            },
            500,
            {leading: true, trailing: false},
        ),
        [id_no, name, params, rcode, rname],
    )

    useEffect(() => {
        document.title = '基金交易安全开户'
        Toast.config({maskClickable: false})
        http.get('/mapi/identity/upload_info/20210101', {scene: params.fr || ''}).then((res) => {
            if (res.code === '000000') {
                const {identity, id_no, name} = res.result
                setIdInfo((prev) => ({...prev, id_no, name}))
                setIdImg(identity)
            }
        })
        http.get('/passport/xy_account/career_list/20210101').then((res) => {
            if (res.code === '000000') {
                const {career, default_career} = res.result
                defaultRcode.current = default_career
                const defaultCareer = career.filter((item) => item.code === default_career)
                setCareerList([career.map((item) => ({label: item.name, value: item.code}))])
                setIdInfo((prev) => ({...prev, rcode: default_career, rname: defaultCareer[0].name}))
                form.setFieldValue('rcode', [default_career])
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className={styles.container}>
            <BottomModal ref={bottomModal} title="上传要求">
                <img className={styles.uploadIdTip} src={uploadIdTip} alt="" />
            </BottomModal>
            <Modal
                className={styles.modalContainer}
                content={
                    <>
                        <div className={styles.title}>{modalData.title}</div>
                        <div className={styles.msg}>{modalData.msg}</div>
                        <div style={{marginTop: '.4rem'}}>
                            <div className={styles.inputWrapper}>
                                <Input readOnly value={modalData.mobile} />
                            </div>
                            <div className={styles.inputWrapper} style={{marginTop: '.32rem'}}>
                                <Input
                                    maxLength={6}
                                    onChange={(val) => setCode(val.replace(/\D/g, ''))}
                                    placeholder="请输入验证码"
                                    type="tel"
                                    value={code}
                                />
                                <div
                                    className={styles.sendCode}
                                    onClick={onSendCode}
                                    style={{backgroundColor: countdown === 60 ? '#FF7D41' : '#FFCFB9'}}
                                >
                                    {sendCode}
                                </div>
                            </div>
                        </div>
                        <div className={styles.cannotGetCode} onClick={() => jump({path: 'VerifyCodeQA'})}>
                            没有收到验证码？
                        </div>
                        <Button block className={styles.submit} disabled={code.length < 6} onClick={onBindSubmit}>
                            完成
                        </Button>
                    </>
                }
                visible={modalVisible}
            />
            <div className={styles.content}>
                <img className={styles.stepImg} src={first} alt="" />
                <div className={styles.card}>
                    <div className={`defaultFlex hairline hairline--bottom ${styles.title} ${styles.cardHeader}`}>
                        <img className={styles.personalMes} src={personalMes} alt="" />
                        实名认证
                    </div>
                    <div className="flexBetween" style={{padding: '.28rem 0'}}>
                        <span className={styles.title} style={{color: '#545968'}}>
                            身份证上传
                        </span>
                        <span
                            className={styles.title}
                            onClick={() => bottomModal.current?.show()}
                            style={{color: '#0051CC'}}
                        >
                            上传要求
                        </span>
                    </div>
                    <div className="flexBetween" style={{paddingBottom: '.32rem'}}>
                        <div className={`flexColumn ${styles.idImage}`} onClick={() => showActionSheet('front')}>
                            <img
                                src={front ? front : idFront}
                                alt=""
                                style={front ? {width: '2.56rem', height: '1.66rem'} : {width: '2.16rem'}}
                            />
                            {front ? null : (
                                <div className={styles.desc} style={{marginTop: '.28rem'}}>
                                    点击拍摄/上传人像面
                                </div>
                            )}
                        </div>
                        <div className={`flexColumn ${styles.idImage}`} onClick={() => showActionSheet('back')}>
                            <img
                                src={back ? back : idBack}
                                alt=""
                                style={back ? {width: '2.56rem', height: '1.66rem'} : {width: '2.16rem'}}
                            />
                            {back ? null : (
                                <div className={styles.desc} style={{marginTop: '.28rem'}}>
                                    点击拍摄/上传国徽面
                                </div>
                            )}
                        </div>
                    </div>
                    {front ? (
                        <Form
                            className={styles.form}
                            form={form}
                            initialValues={{id_no, name}}
                            layout="horizontal"
                            onValuesChange={(values) => {
                                if (values.name) setIdInfo((prev) => ({...prev, ...values}))
                                if (values.rcode)
                                    setIdInfo((prev) => ({
                                        ...prev,
                                        rcode: values.rcode[0],
                                        rname: careerList.filter((item) => item.value === values.rcode[0])[0].label,
                                    }))
                            }}
                        >
                            <Item label="姓名" name="name">
                                <Input autoComplete="off" placeholder="请输入您的姓名" />
                            </Item>
                            <Item label="身份证" name="id_no">
                                <Input placeholder="请输入您的身份证号" readOnly />
                            </Item>
                            <Item
                                arrow
                                label="职业信息"
                                name="rcode"
                                onClick={() => setPickerVisible(true)}
                                trigger="onConfirm"
                            >
                                <Picker
                                    columns={careerList}
                                    onClose={() => setPickerVisible(false)}
                                    visible={pickerVisible}
                                >
                                    {(items) => items[0]?.label || '请选择您的职业'}
                                </Picker>
                            </Item>
                        </Form>
                    ) : null}
                </div>
                <BottomDesc style={{marginRight: 0, marginLeft: 0}} />
            </div>
            <div className={styles.fixedBtnContainer}>
                <Button block className={styles.fixedBtn} disabled={btnDisabled} onClick={onSubmit}>
                    下一步
                </Button>
                <SafeArea position="bottom" />
            </div>
        </div>
    )
}

export default IdAuth
