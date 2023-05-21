/*
 * @Date: 2021-09-15 19:19:56
 * @Author: yhc
 * @LastEditors: dx
 * @LastEditTime: 2021-09-17 18:42:59
 * @Description:用户更新信息删除
 */
import React from 'react'
import {isIOS} from '../../utils'
import './index.css'
function index() {
    return (
        <div className={`userInfoDeleteCon${isIOS() ? ' ios' : ''}`}>
            <div
                style={{
                    fontWeight: 700,
                    marginBottom: '10px',
                }}
            >
                尊敬的魔方用户：
            </div>
            我们非常重视用户的隐私和个人信息保护，通过{' '}
            <a href="/privacy" style={{color: '#0050c2'}}>
                《理财魔方隐私权政策》
            </a>
            向您说明：我们在您使用我们的产品与服务时，如何收集、使用、保存、共享和转让这些信息，以及我们为您提供的访问、更新、删除和保护这些信息的方式。如果您遇到信息更正、删除相关问题，您可以通过
            App 联系我们的在线客服，或者拨打我们的客服电话 400 - 080 - 8208 等方式与我们联系。
        </div>
    )
}

export default index
