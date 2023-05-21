import {useRef, useState, useMemo} from 'react'
import {Image, DotLoading, SafeArea} from 'antd-mobile'
import './index.css'
import qs from 'qs'

const PromoteOpenFollow = () => {
    const data = useRef(qs.parse(window.location.href.split('?')[1]) || {}).current
    const [imgLoaded, setImgLoaded] = useState(false)

    const getInitReady = useMemo(() => {
        return !!data && imgLoaded
    }, [data, imgLoaded])

    return (
        <>
            {data ? (
                <div className="promoteOpenFollowContent">
                    <Image
                        src={data.img}
                        width={'100%'}
                        fit="contain"
                        onLoad={() => {
                            setImgLoaded(true)
                        }}
                        onClick={() => {
                            ;+data.avail &&
                                window.ReactNativeWebView?.postMessage(
                                    'url=' +
                                        JSON.stringify({
                                            path: data.btn,
                                            type: 1,
                                            params: {
                                                poid: data.poid,
                                            },
                                        }),
                                )
                        }}
                    />
                    <SafeArea position="bottom" style={{background: '#f5f6f8'}} />
                </div>
            ) : null}
            {!getInitReady && (
                <div className="beforeMask">
                    <DotLoading />
                </div>
            )}
        </>
    )
}

export default PromoteOpenFollow
