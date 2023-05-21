/*
 * @Date: 2021-09-13 09:51:02
 * @Author: dx
 * @LastEditors: dx
 * @LastEditTime: 2021-09-13 10:30:18
 * @Description: userinfo reducer
 */
import actionTypes from '../actionTypes'

const initState = {
    is_login: false,
}

export default function userInfo(state = initState, action) {
    switch (action.type) {
        case actionTypes.UserInfo:
            return {
                ...state,
                ...action.payload,
            }
        default:
            return state
    }
}
