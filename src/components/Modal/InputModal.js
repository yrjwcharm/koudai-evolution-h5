/*
 * @Date: 2021-03-09 17:09:23
 * @Author: dx
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-26 15:39:10
 * @Description: 带输入框的弹窗
 */
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react'
// import {useSafeAreaInsets} from 'react-native-safe-area-context';
// import Picker from 'react-native-picker';
// import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/AntDesign'
// import Mask from '../Mask';
import {px as text} from '../../utils/appUtil'
import {Colors, Font, Space, Style} from '../../common/commonStyle'
import {constants} from './util'
import {Mask, Modal} from 'antd-mobile'
const InputModal = forwardRef((props, ref) => {
    const {
        backdrop,
        /**
         * 点击确认按钮
         */
        children,
        confirmClick,
        confirmText = '确定',
        header,
        isTouchMaskToClose,
        title,
        onClose,
    } = props
    const [visible, setVisible] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastText, setToastText] = useState('')
    const keyboardHeight = useRef(0).current

    const show = () => {
        setVisible(true)
    }
    const hide = () => {
        setVisible(false)
        onClose?.()
    }
    const toastShow = (t, duration = 2000, {onHidden} = {}) => {
        setToastText(t)
        setShowToast(true)
        setTimeout(() => {
            setShowToast(false)
            setToastText('')
            onHidden && onHidden()
        }, duration)
    }
    const onDone = useCallback(() => {
        // setVisible(false);
        confirmClick && confirmClick()
    }, [confirmClick])
    // 键盘调起
    const keyboardWillShow = useCallback(
        (e) => {
            // Animated.timing(keyboardHeight, {
            //     toValue: e.endCoordinates.height,
            //     duration: e.duration,
            //     useNativeDriver: false,
            // }).start();
        },
        [keyboardHeight],
    )
    // 键盘隐藏
    const keyboardWillHide = useCallback(
        (e) => {
            // Animated.timing(keyboardHeight, {
            //     toValue: 0,
            //     duration: e.duration,
            //     useNativeDriver: false,
            // }).start();
        },
        [keyboardHeight],
    )
    useImperativeHandle(ref, () => {
        return {
            show: show,
            hide: hide,
            toastShow: toastShow,
        }
    })

    useEffect(() => {
        // Picker.hide();
        // Keyboard.addListener('keyboardWillShow', keyboardWillShow);
        // Keyboard.addListener('keyboardWillHide', keyboardWillHide);
        return () => {
            // Picker.hide();
            // Keyboard.removeListener('keyboardWillShow', keyboardWillShow);
            // Keyboard.removeListener('keyboardWillHide', keyboardWillHide);
        }
    }, [keyboardWillShow, keyboardWillHide])

    return (
        <Modal animationType={'slide'} visible={visible} onRequestClose={hide} transparent={true}>
            {backdrop && <Mask />}
            <div onClick={isTouchMaskToClose ? hide : () => {}} style={styles.container}>
                <div style={{position: 'relative', bottom: keyboardHeight}}>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={[styles.con, {paddingBottom: keyboardHeight === 0 ? 20 : 0}]}
                    >
                        {header || (
                            <div style={[Style.flexCenter, styles.header]}>
                                <div style={[Style.flexCenter, styles.close]} onClick={hide}>
                                    <Icon name={'close'} size={18} />
                                </div>
                                <span style={styles.title}>{title}</span>
                                {confirmText ? (
                                    <div style={[Style.flexCenter, styles.confirm]} onClick={onDone}>
                                        <span style={{fontSize: Font.textH2, color: Colors.brandColor}}>
                                            {confirmText}
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        )}
                        {children}
                    </div>
                </div>
            </div>
            <Modal animationType={'fade'} onRequestClose={() => setShowToast(false)} transparent visible={showToast}>
                <div style={[Style.flexCenter, styles.toastContainer]}>
                    <div style={styles.textContainer}>
                        <span style={styles.textStyle}>{toastText}</span>
                    </div>
                </div>
            </Modal>
        </Modal>
    )
})

const styles = {
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    con: {
        backgroundColor: '#fff',
        borderTopLeftRadius: constants.borderRadius,
        borderTopRightRadius: constants.borderRadius,
    },
    header: {
        paddingVertical: Space.padding,
        borderBottomWidth: Space.borderWidth,
        borderBottomColor: Colors.borderColor,
    },
    close: {
        position: 'absolute',
        right: 0,
        left: 0,
        width: text(120),
        height: constants.titleHeight,
    },
    confirm: {
        position: 'absolute',
        right: text(40),
        height: constants.titleHeight,
    },
    title: {
        fontSize: Font.textH1,
        color: Colors.defaultColor,
        fontWeight: '500',
    },
    toastContainer: {
        flex: 1,
        height: window.innerHeight,
        width: window.innerWidth,
    },
    textContainer: {
        padding: 20,
        backgroundColor: '#1E1F20',
        opacity: 0.8,
        borderRadius: 5,
    },
    textStyle: {
        fontSize: Font.textH1,
        // lineHeight: text(24),
        color: '#fff',
        textAlign: 'center',
    },
}

InputModal.defaultProps = {
    backdrop: true,
    confirmClick: () => {},
    confirmText: '确定',
    isTouchMaskToClose: true,
    title: '请输入',
}

export default InputModal
