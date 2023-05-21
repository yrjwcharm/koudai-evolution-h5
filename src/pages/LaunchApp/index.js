/*
 * @Date: 2021-12-22 11:25:43
 * @Author: yhc
 * @LastEditors: yhc
 * @LastEditTime: 2022-02-28 20:09:55
 * @Description:
 */
import {useEffect} from 'react'

function App() {
    const gotoAPP = () => {
        const location = window.location
        location.href = 'lcmf://'
        // 2秒之后跳去下载
        setTimeout(() => {
            location.href = 'https://a.app.qq.com/o/simple.jsp?pkgname=com.licaimofang.app'
        }, 2000)
    }
    useEffect(() => {
        gotoAPP()
    }, [])
    return <div className="LaunchApp"></div>
}

export default App
