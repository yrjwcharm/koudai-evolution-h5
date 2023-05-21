/*
 * @Date: 2022/12/16 13:21
 * @Author: yanruifeng
 * @Description: loading加载框
 */
import {SpinLoading} from 'antd-mobile'
import {Colors} from '../../common/commonStyle'
import './index.scss'
const Loading = () => {
    return (
        <div className="loading_wrap">
            <SpinLoading color={Colors.btnColor} />
        </div>
    )
}

export default Loading
