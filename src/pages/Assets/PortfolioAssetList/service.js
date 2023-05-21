/*
 * @Date: 2022-12-13 11:08:49
 * @Description:
 */
import http from '../../../service'
export const getData = (parmas) => http.get('/asset/class/common/20220915', parmas)
export const getHold = (params) => http.get('/asset/class/holding/20220915', params)
export const getPageData = (params) => http.get('/asset/product/holding/20220915', params)
