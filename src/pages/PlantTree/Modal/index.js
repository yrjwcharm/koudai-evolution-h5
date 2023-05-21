import {Mask} from 'antd-mobile'
import close from '../../../image/activity/close.png'
import './index.css'
import modalBottomIcon from '../../../image/activity/modal-bottom-icon.png'
/**
 * 活动弹窗
 * @returns
 */
const MyModal = ({children, visible, onClose, ...props}) => {
    return (
        <Mask visible={visible} onMaskClick={onClose} {...props}>
            <div className="modalContainer">
                <img
                    className="closeIcon"
                    alt="close"
                    src={close}
                    onClick={() => {
                        onClose && onClose()
                    }}
                />
                {children}
                <img src={modalBottomIcon} className="modalBottomIcon" alt="" />
            </div>
        </Mask>
    )
}
export default MyModal
