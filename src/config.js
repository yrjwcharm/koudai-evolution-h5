/*
 * @Date: 2022-01-10 11:47:54
 * @Description:
 */

import env from './env'

const SERVER_URL = {
    production: {
        // 正式环境
        SERVER_URL: {
            kapi: 'https://kapi-web.licaimofang.cn',
            mapi: 'https://mapi.licaimofang.cn',
            passport: 'https://passport.licaimofang.cn',
            H5: 'https://edu.licaimofang.cn',
        },
    },
    develop: {
        SERVER_URL: {
            kapi: 'http://kapi-web.bae.mofanglicai.com.cn:10080',
            mapi: 'http://mapi.bae.mofanglicai.com.cn:10080',
            passport: 'http://passport.bae.mofanglicai.com.cn:10080',
        },
    },
    lxg: {
        SERVER_URL: {
            kapi: '',
            mapi: 'http://mapi.bae.mofanglicai.com.cn:10080',
            passport: 'http://passport.bae.mofanglicai.com.cn:10080',
        },
    },
    pre1: {
        SERVER_URL: {
            kapi: 'https://kapi-web-kp1.licaimofang.com',
            mapi: 'https://mapi-kp1.licaimofang.com',
            passport: 'https://passport-kp1.licaimofang.com',
            H5: 'https://evolution-h5-kp1.licaimofang.com',
        },
    },
    pre2: {
        SERVER_URL: {
            kapi: 'https://kapi-web-kp2.licaimofang.com',
            mapi: 'https://mapi-kp2.licaimofang.com',
            passport: 'https://passport-kp2.licaimofang.com',
            H5: 'https://evolution-h5-kp2.licaimofang.com',
        },
    },
    wg: {
        SERVER_URL: {
            kapi: 'http://kapi-web.wanggang.mofanglicai.com.cn:10080',
            mapi: 'http://mapi7.wanggang.mofanglicai.com.cn:10080',
            passport: 'http://kapi-passport.wanggang.mofanglicai.com.cn:10080',
            H5: 'http://koudai-evolution-h5.bae.mofanglicai.com.cn:10080',
        },
    },
    ll: {
        SERVER_URL: {
            kapi: 'http://kapi-web.ll.mofanglicai.com.cn:10080',
            mapi: 'http://mapi7.ll.mofanglicai.com.cn:10080',
            passport: 'http://kapi-passport.ll.mofanglicai.com.cn:10080',
            H5: 'http://koudai-evolution-h5.bae.mofanglicai.com.cn:10080',
        },
    },
    my: {
        SERVER_URL: {
            kapi: 'http://kapiweb.mayue.mofanglicai.com.cn:10080',
            mapi: 'http://mapi7.mayue.mofanglicai.com.cn:10080',
            passport: 'http://kapi-passport.mayue.mofanglicai.com.cn:10080',
            H5: 'http://koudai-evolution-h5.bae.mofanglicai.com.cn:10080',
        },
    },
    hjq: {
        SERVER_URL: {
            kapi: 'http://kmapi.huangjianquan.mofanglicai.com.cn:10080',
            mapi: 'http://mapi7.huangjianquan.mofanglicai.com.cn:10080',
            passport: 'http://kapi-passport.huangjianquan.mofanglicai.com.cn:10080',
            H5: 'http://koudai-evolution-h5.bae.mofanglicai.com.cn:10080',
        },
    },
    jhy: {
        SERVER_URL: {
            kapi: 'http://kapi-web.jinhongyu.mofanglicai.com.cn:10080',
            mapi: 'http://kapi-web.jinhongyu.mofanglicai.com.cn:10080',
            passport: 'http://kapi-passport.jinhongyu.mofanglicai.com.cn:10080',
            H5: 'http://koudai-evolution-h5.bae.mofanglicai.com.cn:10080',
        },
    },
    lxc: {
        SERVER_URL: {
            kapi: 'http://kapi-web.lengxiaochu.mofanglicai.com.cn:10080',
            mapi: 'http://mapi7.lengxiaochu.mofanglicai.com.cn:10080',
            passport: 'http://kapi-passport.lengxiaochu.mofanglicai.com.cn:10080',
            H5: 'http://koudai-evolution-h5.bae.mofanglicai.com.cn:10080',
        },
    },
    syt: {
        SERVER_URL: {
            kapi: 'http://kapi-web.yitao.mofanglicai.com.cn',
            mapi: 'http://mapi7.yitao.mofanglicai.com.cn',
            passport: 'http://kapi-passport.yitao.mofanglicai.com.cn:10080',
            H5: 'http://koudai-evolution-h5.yitao.mofanglicai.com.cn',
        },
    },
    test: {
        SERVER_URL: {
            kapi: 'http://kapi-web.yitao.mofanglicai.com.cn',
            mapi: 'http://mapi7.yitao.mofanglicai.com.cn',
            passport: 'http://kapi-passport.yitao.mofanglicai.com.cn:10080',
            H5: 'http://koudai-evolution-h5.yitao.mofanglicai.com.cn',
        },
    },
    test2: {
        SERVER_URL: {
            kapi: 'http://kapi-web.yitao2.mofanglicai.com.cn',
            mapi: 'http://mapi2.yitao2.mofanglicai.com.cn:10080',
            passport: 'http://kapi-passport2.yitao2.mofanglicai.com.cn:10080',
            H5: 'http://koudai-evolution-h5.yitao2.mofanglicai.com.cn:10080',
        },
    },
    test3: {
        SERVER_URL: {
            kapi: 'http://kapi-web.yitao2.mofanglicai.com.cn',
            mapi: 'http://mapi2.yitao2.mofanglicai.com.cn',
            passport: 'http://kapi-passport2.yitao2.mofanglicai.com.cn:10080',
            H5: 'http://koudai-evolution-h5.yitao2.mofanglicai.com.cn',
        },
    },
    v7: {
        SERVER_URL: {
            kapi: 'http://kapi-webv7.yitao.mofanglicai.com.cn',
            mapi: 'http://mapi7.yitao.mofanglicai.com.cn',
            passport: 'http://kapi-passport.yitao.mofanglicai.com.cn:10080',
            H5: 'http://koudai-evolution-h5.yitao.mofanglicai.com.cn',
        },
    },
    wcy: {
        SERVER_URL: {
            kapi: 'http://kapi-web.wangchunyan.mofanglicai.com.cn:10080',
            mapi: 'http://mapi7.yitao.mofanglicai.com.cn',
            passport: 'http://kapi-passport.yitao.mofanglicai.com.cn:10080',
            H5: 'http://koudai-evolution-h5.yitao.mofanglicai.com.cn',
        },
    },
    lixiaoguang: {
        SERVER_URL: {
            kapi: 'http://kapi-web.lixiaoguang.mofanglicai.com.cn:10080',
            mapi: 'http://mapi7.yitao.mofanglicai.com.cn',
            passport: 'http://kapi-passport.yitao.mofanglicai.com.cn:10080',
            H5: 'http://koudai-evolution-h5.yitao.mofanglicai.com.cn',
        },
    },
}
export default function GetHost() {
    return SERVER_URL[env]
}
