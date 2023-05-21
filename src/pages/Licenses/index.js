/*
 * @Date: 2021-09-06 10:36:02
 * @Author: dx
 * @LastEditors: dx
 * @LastEditTime: 2021-09-14 14:29:13
 * @Description: 经营证件及执照
 */
// import {useEffect, useState} from 'react';
import './index.css'
// import http from '../../service';

const Licenses = ({match}) => {
    // const [data, setData] = useState('');

    // useEffect(() => {
    //   // http.get('/passport/agreement/detail/20210101', {id: match.params?.id}).then((res) => {
    //   //   if (res.code === '000000') {
    //   //     document.title = res.result.title || '用户协议';
    //   //     setData(res.result.agreement);
    //   //   }
    //   // });
    // }, [match.params]);

    return (
        <div className="licensesContainer">
            <div className="title">营业执照</div>
            <img src="https://static.licaimofang.com/wp-content/uploads/2021/09/businessLicense.jpg" alt="" />
            <div className="title">基金销售许可证</div>
            <img src="https://static.licaimofang.com/wp-content/uploads/2021/09/fundLicense.jpg" alt="" />
            <div className="title">保险代理许可证</div>
            <img src="https://static.licaimofang.com/wp-content/uploads/2021/09/insuranceLicense.jpg" alt="" />
        </div>
    )
}

export default Licenses
