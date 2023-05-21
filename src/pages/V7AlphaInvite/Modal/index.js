import {Mask} from 'antd-mobile'
import close from '../../../image/activity/close.png'
import styles from './index.module.scss'
/**
 * 活动弹窗
 * @returns
 */
const MyModal = ({children, visible, onClose, ...props}) => {
    return (
        <Mask visible={visible} onMaskClick={onClose} {...props}>
            <div className={styles.modalContainer}>
                <img
                    className={styles.closeIcon}
                    alt="close"
                    src={close}
                    onClick={() => {
                        onClose && onClose()
                    }}
                />
                {children}
            </div>
        </Mask>
    )
}
export default MyModal
