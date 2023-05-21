/*
 * @Date: 2021-03-19 15:53:01
 * @Author: dx
 * @LastEditors: dx
 * @LastEditTime: 2021-04-23 16:58:55
 * @Description: 活动页
 */
import React from 'react'
import './index.css'
import headerBg from '../../image/bg/headerBg.png'
import bottomShadow from '../../image/bg/bottomShadow.png'

const ActivityPage = () => {
    return (
        <div className="activityPageContainer">
            <img src={headerBg} alt="" />
            <div className="title">致新用户的一封信</div>
            <div className="call">尊敬的用户：</div>
            <div className="contentBox">
                {`您好，欢迎加入理财魔方大家庭，我是您的专属投顾，我将陪伴您进入智能理财全新时代。下面是一些关于理财魔方的介绍，供您了解~\n\n作为富有责任感和使命感的智能投顾，理财魔方为您推荐的都是受证监会监管的公募基金，您在这里申购的基金是通过正规的持牌基金销售机构完成交易的，并且您投资的资金都托管在银行，投资的基金也可以在基金公司的官网查询到，所以您的资金绝对安全。\n\n理财魔方采集了全球成熟市场和新兴市场一共18个大类资产，上千个系列及维度特征的数据，筛选出了多只表现优秀的基金构建组合（不同组合的具体配置不同~），让您享受资产配置带来的收益。\n\n由于组合配置的基金是浮动收益类产品，它的收益受市场行情影响也会有所波动，在市场下跌时，短期内组合也会出现浮亏的情况。也请您多一些耐心和信心，给魔方恢复成长元气的时间，我们会尽全力控制好组合回撤，让您能安享时间带来的回报。\n\n当然我们为您配置的组合并不是一成不变的，系统会通过多维数据的分析，根据市场变化动态调整配置的资产，也就是平时所说的调仓，从而您实现了资产的止盈和止损。当您的组合触发调仓时，系统会发送短信通知您，届时您可进入APP参考提示来操作。\n\n另外，咱们APP的发现页面中会更新组合的业绩数据及观点类信息，供您查看。投资过程中如遇问题，您可在这里与我沟通，我的服务时间是工作日9:00-19:00。如在其他时间留言，我会在工作时间尽快给您回复~理财魔方竭诚为您服务！`}
                <div className="greet" style={{marginTop: '1.08rem'}}>
                    {'您的投资顾问'}
                </div>
                <div className="greet">{'谨启！'}</div>
            </div>
            <img src={bottomShadow} alt="" />
        </div>
    )
}

export default ActivityPage
