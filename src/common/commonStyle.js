/*
 * @Date: 2020-12-28 11:53:01
 * @Description:主题及公共样式表
 */

export const Colors = {
    /** color **/

    // 默认背景颜色
    bgColor: '#F5F6F8',
    /** 品牌色 **/
    brandColor: '#0051CC',
    // 默认黑色字体颜色
    defaultColor: '#121D3A',
    //浅黑色
    lightBlackColor: '#545968',
    // 默认深灰色字体颜色
    darkGrayColor: '#9aA1B2',
    // 默认浅灰色字体颜色
    lightGrayColor: '#9AA0B1',
    // 默认分割线颜色
    lineColor: '#E2E4EA',
    // 默认placeholder颜色
    placeholderColor: '#BDC2CC',
    // borderColor
    borderColor: '#E9EAEF',
    // 链接颜色
    linkColor: '#0051CC',
    // 输入框背景色
    inputBg: '#F5F6F8',
    transparent: 'transparent',
    // 红色 涨、报错
    red: '#E74949',
    // 绿色 跌
    green: '#4BA471',
    //橘色 确认中
    orange: '#EB7121',
    btnColor: '#0051CC',
    //黄色
    yellow: '#EB7121',
    //导航背景色
    navBgColor: '#FFF',
    white: '#fff',
    // 导航title 颜色
    navTitleColor: '#121D3A',
    // 导航左item title color
    navLeftTitleColor: '#121D3A',
    // 导航右item title color
    navRightTitleColor: '#121D3A',
    iconGray: '#989898',
    iconBlack: '#262626',
    defaultFontColor: '#121D3A',
    // 描述文字颜色
    descColor: '#545968',
}
export const Space = {
    /** space **/

    // 上下边距
    marginVertical: 16,
    // 左右边距
    marginAlign: 16,
    // 内边距
    padding: 16,
    cardPadding: 16,
    /** width **/
    //圆角
    borderRadius: 6,
    // 边框线宽度
    borderWidth: 0.5,
    // 分割线高度
    lineWidth: 0.5,
    modelPadding: 20,
    // 外阴影
    boxShadow: (color = '#E0E2E7', x = 0, y = 2, opacity = 1, radius = 8) => ({
        shadowColor: color,
        shadowOffset: {width: x, height: y},
        shadowOpacity: opacity,
        shadowRadius: radius,
        elevation: 20,
    }),
}

export const Font = {
    /** font **/

    // 默认文字字体
    numFontFamily: 'DINAlternate-Bold',
    numRegular: 'DIN-Regular',
    numMedium: 'DIN-Medium',
    pingFangMedium: 'PingFang-SC-Medium',
    pingFangRegular: 'PingFang-SC-Regular',
    //特大字体
    largeFont: 26,
    //金额输入框字体大小
    inputFont: 34,
    textH1: 16,
    textH2: 14,
    textH3: 12,
    //极小字体
    textSm: 11,
    // 导航title字体
    navTitleFont: 20,
    // 导航右按钮的字体
    navRightTitleFont: 14,
    // 占位符的默认字体大小
    placeholderFont: 13,
    weightMedium: 'bold',
}
export const Style = {
    flexRowCenter: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flexRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    flexCenter: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flexBetween: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    flexAround: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    flexEvenly: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    modelPadding: {
        marginHorizontal: 20,
        marginVertical: 20,
    },
    containerPadding: {
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        backgroundColor: '#F5F6F8',
        flex: 1,
    },
    baselineAlign: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    columnAlign: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    descSty: {
        color: '#9095A5',
        fontSize: 13,
    },
    tag: {
        display: 'flex',
        paddingHorizontal: 5,
        justifyContent: 'center',
        borderRadius: 2,
        height: 20,
    },
    more: {
        fontSize: 12,
        color: Colors.btnColor,
    },
    card: {
        display: 'flex',
        backgroundColor: '#fff',
        borderRadius: 6,
        padding: 16,
    },
    title: {
        fontSize: 14,
        color: Colors.defaultColor,
        fontWeight: 'bold',
        lineHeight: '20px',
    },
    title_desc: {
        fontSize: 12,
        lineHeight: '18px',
        color: '#545968',
    },
}
