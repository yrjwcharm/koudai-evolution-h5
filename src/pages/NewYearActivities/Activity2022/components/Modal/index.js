import {Mask} from 'antd-mobile'
import close from '../../../../../image/activity/close.png'
import fireworks from '../../../../../image/activity/fireworks.png'
import './index.css'
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
                <img className="backgroundIcon" alt="background" src={fireworks} />
                {children}
            </div>
        </Mask>
    )
}
export default MyModal
