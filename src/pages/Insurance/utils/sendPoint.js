import {storage} from '../../../utils'

const sendPoint = (params) => {
    const img = new Image()
    let result = storage.getItem('loginStatus') || {}
    let _params = {
        app: 6000,
        did: result.did || 'koudai-evolution-h5',
        ver: result.ver || '6.2.9',
        ...params,
    }
    let _str = ''
    try {
        Object.keys(_params)?.forEach((item, index) => {
            if (index === 0) {
                _str += `${item}=${_params[item]}`
            } else {
                _str += `&${item}=${_params[item]}`
            }
        })

        img.src = `https://tj.licaimofang.com/v.gif?${_str}`
    } catch (error) {}
}

export {sendPoint}
