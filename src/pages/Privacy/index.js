/*
 * @Date: 2021-09-07 21:18:22
 * @Author: yhc
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-19 17:05:22
 * @Description:隐私权政策
 */
import React, {useEffect} from 'react'
import './index.css'
function Privacy({history}) {
    document.title = '理财魔方隐私权政策'
    function locationReplace(url) {
        if (history.replaceState) {
            history.replaceState(null, document.title, url)
            history.go(0)
        } else {
            window.location.replace(url)
        }
    }

    useEffect(() => {
        if (window.location.hash) {
            document.querySelector(`a[name=${window.location.hash.split('#')[1]?.split('?')[0]}]`).scrollIntoView()
        }
        locationReplace('/privacy.html')
    }, [])
    return null
}

export default Privacy
