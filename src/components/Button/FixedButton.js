/*
 * @Date: 2022/12/16 12:12
 * @Author: yanruifeng
 * @Description: 底部button
 */
import './index.scss'
import {Button} from 'antd-mobile'
const FixedButton = ({title, onClick, disabled, isFixed = true}) => {
    return (
        <div className={isFixed ? 'fixed-button' : 'button_wrap'} onClick={onClick}>
            <Button block disabled={disabled} className="tool-btn" color="#0051cc">
                {title}
            </Button>
        </div>
    )
}
export default FixedButton
