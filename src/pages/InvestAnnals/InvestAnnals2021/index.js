import React from 'react'
import {ImageViewer, Image} from 'antd-mobile'
import './index.css'

const baseUrl = 'https://static.licaimofang.cn/wp-content/uploads/2022/01/'
// const baseUrl = 'http://192.168.0.102:5500/'

const InvestAnnals2022 = () => {
    const setViewerImage = (url) => {
        ImageViewer.show({image: url})
    }

    return (
        <>
            <div
                className="InvestAnnals2022"
                style={{
                    paddingBottom: '2rem',
                    height: '100vh',
                }}
            >
                <Image
                    width={'100%'}
                    height={'9.14rem'}
                    src={baseUrl + 'portfolios_report_1.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                />

                <Image
                    width={'100%'}
                    height={'8.04rem'}
                    src={baseUrl + 'portfolios_report_2.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                    onClick={() => {
                        setViewerImage(baseUrl + 'portfolios_report_2.jpg')
                    }}
                />

                <Image
                    width={'100%'}
                    height={'2.72rem'}
                    src={baseUrl + 'portfolios_report_3.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                />

                <Image
                    width={'100%'}
                    height={'3.57rem'}
                    src={baseUrl + 'portfolios_report_4.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                    onClick={() => {
                        setViewerImage(baseUrl + 'portfolios_report_4.jpg')
                    }}
                />

                <Image
                    width={'100%'}
                    height={'3.22rem'}
                    src={baseUrl + 'portfolios_report_5.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                    onClick={() => {
                        setViewerImage(baseUrl + 'portfolios_report_5.jpg')
                    }}
                />

                <Image
                    width={'100%'}
                    height={'5.6rem'}
                    src={baseUrl + 'portfolios_report_6.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                    onClick={() => {
                        setViewerImage(baseUrl + 'portfolios_report_6.jpg')
                    }}
                />

                <Image
                    width={'100%'}
                    height={'5.89rem'}
                    src={baseUrl + 'portfolios_report_7.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                />

                <Image
                    width={'100%'}
                    height={'6.10rem'}
                    src={baseUrl + 'portfolios_report_8.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                    onClick={() => {
                        setViewerImage(baseUrl + 'portfolios_report_8.jpg')
                    }}
                />

                <Image
                    width={'100%'}
                    height={'1.52rem'}
                    src={baseUrl + 'portfolios_report_9.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                />

                <Image
                    width={'100%'}
                    height={'3.88rem'}
                    src={baseUrl + 'portfolios_report_10.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                    onClick={() => {
                        setViewerImage(baseUrl + 'portfolios_report_10.jpg')
                    }}
                />

                <Image
                    width={'100%'}
                    height={'4.84rem'}
                    src={baseUrl + 'portfolios_report_11.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                />

                <Image
                    width={'100%'}
                    height={'7.1rem'}
                    src={baseUrl + 'portfolios_report_12.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                    onClick={() => {
                        setViewerImage(baseUrl + 'portfolios_report_12.jpg')
                    }}
                />

                <Image
                    width={'100%'}
                    height={'2.88rem'}
                    src={baseUrl + 'portfolios_report_13.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                />

                <Image
                    width={'100%'}
                    height={'5.98rem'}
                    src={baseUrl + 'portfolios_report_14.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                    onClick={() => {
                        setViewerImage(baseUrl + 'portfolios_report_14.jpg')
                    }}
                />

                <Image
                    width={'100%'}
                    height={'4.4rem'}
                    src={baseUrl + 'portfolios_report_15.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                />

                <Image
                    width={'100%'}
                    height={'4.51rem'}
                    src={baseUrl + 'portfolios_report_16.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                    onClick={() => {
                        setViewerImage(baseUrl + 'portfolios_report_16.jpg')
                    }}
                />

                <Image
                    width={'100%'}
                    height={'3.14rem'}
                    src={baseUrl + 'portfolios_report_17.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                />

                <Image
                    width={'100%'}
                    height={'5.66rem'}
                    src={baseUrl + 'portfolios_report_18.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                    onClick={() => {
                        setViewerImage(baseUrl + 'portfolios_report_18.jpg')
                    }}
                />

                <Image
                    width={'100%'}
                    height={'4.98rem'}
                    src={baseUrl + 'portfolios_report_19.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                />

                <Image
                    width={'100%'}
                    height={'5.76rem'}
                    src={baseUrl + 'portfolios_report_26.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                    onClick={() => {
                        setViewerImage(baseUrl + 'portfolios_report_26.jpg')
                    }}
                />

                <Image
                    width={'100%'}
                    height={'4.22rem'}
                    src={baseUrl + 'portfolios_report_21.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                />

                <Image
                    width={'100%'}
                    height={'4.4rem'}
                    src={baseUrl + 'portfolios_report_22.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                    onClick={() => {
                        setViewerImage(baseUrl + 'portfolios_report_22.jpg')
                    }}
                />

                <Image
                    width={'100%'}
                    height={'4.1rem'}
                    src={baseUrl + 'portfolios_report_23.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                />

                <Image
                    width={'100%'}
                    height={'5.8rem'}
                    src={baseUrl + 'portfolios_report_24.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                    onClick={() => {
                        setViewerImage(baseUrl + 'portfolios_report_24.jpg')
                    }}
                />

                <Image
                    width={'100%'}
                    height={'4.04rem'}
                    src={baseUrl + 'portfolios_report_25.jpg'}
                    alt=""
                    lazy
                    placeholder={''}
                />
            </div>
            {/* <ImageViewer
      image={viewerImage}
      visible={visible}
      onClose={() => {
        setVisible(false)
      }}
    /> */}
        </>
    )
}

export default InvestAnnals2022
