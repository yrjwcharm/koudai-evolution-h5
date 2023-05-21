import {useEffect} from 'react'
import './index.css'

function App() {
    useEffect(() => {
        const location = window.location
        location.replace(window.location.origin + '/investor/')
    }, [])
    return <div className="App"></div>
}

export default App
