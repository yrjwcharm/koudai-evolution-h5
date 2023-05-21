/*
 * @Date: 2021-09-13 09:54:53
 * @Author: dx
 * @LastEditors: dx
 * @LastEditTime: 2021-09-13 09:58:23
 * @Description: userinfo action
 */
import actionTypes from '../actionTypes'
import http from '../../service'
import storage from '../../utils/storage'

export const updateUserInfo = (userInfo) => {
    return {
        type: actionTypes.UserInfo,
        payload: userInfo,
    }
}

export function getUserInfo(repeat = 3) {
    return (dispatch) => {
        http.get('/common/user_info/20210101').then(async (res) => {
            if (res.code === '000000') {
                dispatch(updateUserInfo(res.result))
            }
            if (!res) {
                let result = storage.getItem('loginStatus')
                if (typeof result === 'string') {
                    result = JSON.parse(result)
                }
                const userInfo = {
                    is_login: !!result.access_token,
                }
                dispatch(updateUserInfo(userInfo))
                if (repeat-- > 0) {
                    dispatch(getUserInfo(repeat))
                }
            }
        })
    }
}
