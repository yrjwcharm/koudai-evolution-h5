/*
 * @Date: 2021-05-06 18:22:53
 * @Author: dx
 * @LastEditors: dx
 * @LastEditTime: 2021-05-07 11:13:07
 * @Description: 注册理财魔方
 */
import React, {useEffect, useState} from 'react'
import './index.css'

const Register = () => {
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        const searchArr = window.location.search.split('&')
        let code = ''
        searchArr.forEach((item) => {
            if (item.split('code=')[1]) {
                code = item.split('code=')[1]
            }
        })
        if (code) {
            console.log(code)
            setLoaded(true)
        }
    }, [])

    return loaded && <div className="registerContainer"></div>
}

export default Register
