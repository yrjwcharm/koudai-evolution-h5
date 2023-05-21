/*
 * @Date: 2022-01-10 11:47:54
 * @Description:
 */
import React, {useEffect, useState} from 'react'
import {Router, Redirect, Route, Switch} from 'react-router-dom'
import {Provider, useDispatch} from 'react-redux'
import configStore from '../redux'
import App from '../pages/App'
import Article from '../pages/Article'
import FundSafe from '../pages/FundSafe'
import AboutLCMF from '../pages/AboutLCMF'
import KnowLCMF from '../pages/KnowLCMF'
import ActivityPage from '../pages/ActivityPage'
import Chart from '../pages/Chart'
import Register from '../pages/Register'
import InviteRegister from '../pages/InviteRegister'
import SignalCanvas from '../pages/SignalCanvas' //买入信号
import Features from '../pages/Features'
import Agreement from '../pages/Agreement'
import Licenses from '../pages/Licenses'
import PortfolioBabyDetail from '../pages/PortfolioBabyDetail'
import BabyInvite from '../pages/BabyInvite'
import Privacy from '../pages/Privacy'
import UserInfoDelete from '../pages/userInfoDelete'
// import NewYearActivities from '../pages/NewYearActivities' // 跨年活动 antui更新，放开时需调节样式
// import InvestAnnals2021 from '../pages/InvestAnnals/InvestAnnals2021' // 投资年报 // 跨年活动 antui更新，放开时需调节样式
// import PersonalAnnualReport from '../pages/PersonalAnnualReport' // 个人年报 // 跨年活动 antui更新，放开时需调节样式
import LaunchApp from '../pages/LaunchApp' // 唤起APP
import NewAgreement from '../pages/NewAgreement' //新协议
// import AnnualReport from '../pages/AnnualReport'; // 大数据年报
import MessageNotice from '../pages/MessageNotice' //临时消息通知
import EducationalFund from '../pages/Insurance/EducationalFund' //保险=>教育金宣传页
import EducationalFundDetails from '../pages/Insurance/EducationalFund/EducationalFundDetails' //保险=>教育金详情页
import OldAgePension from '../pages/Insurance/OldAgePension' //保险=>养老金宣传页
import OldAgePensionDetails from '../pages/Insurance/OldAgePension/OldAgePensionDetails' //保险=>养老金详情页
import NoRisk from '../pages/Insurance/NoRisk' //保险=>无风险账户
import NoRiskDetails from '../pages/Insurance/NoRisk/NoRiskDetails' //保险=>无风险账户详情页
import InviteGetRE from '../pages/InviteGetRE' // 瓜分红包
import DoubleGifts from '../pages/DoubleGifts' // 虎虎生威送礼翻倍活动
import Active818 from '../pages/Active818' // 818活动
import PlantTree from '../pages/PlantTree' // 虎虎生威送礼翻倍活动
import PanelChartOfTool from '../pages/PanelChartOfTool' // 财富工具仪表盘
import PromoteOpenFollow from '../pages/PromoteOpenFollow' // 开启牛人跟投
import RationalChart from '../pages/RationalChart' // 理性等级收益概率图
import ArticleReadACT from '../pages/ArticleReadACT' // 理性等级收益概率图
import QaACT from '../pages/QaACT' // 理性等级收益概率图
import FeeDiscount from '../pages/FeeDiscount' // 理性等级收益概率图
import GoToAppStore from '../pages/GoToAppStore' // 跳转App Store
import BlancedPortfolio from '../pages/BlancedPortfolio' // 股债平衡活动页
import FundDetail from '../pages/FundDetail' // 基金详情
import PortfolioDetails from '../pages/PortfolioDetails' // 组合详情
import FallBuy from '../pages/SignalTool/FallBuy' // 越跌越买
import ProbabilitySignal from '../pages/SignalTool/ProbabilitySignal' // 概率信号
import LowBuy from '../pages/SignalTool/LowBuy' // 估值信号
import GoalRedeem from '../pages/SignalTool/GoalRedeem' // 目标盈
import TaurenSignal from '../pages/SignalTool/TaurenSignal' // 牛人信号
import IndexDetails from '../pages/IndexDetails' // 指数详情
import ProjectDetail from '../pages/ProjectDetail' // 计划详情
import V7AlphaInvite from '../pages/V7AlphaInvite' // v7 内测邀请
import PortfolioIntroduce from '../pages/PortfolioIntroduce' // 组合活动
import SpecialDetail from '../pages/SpecialDetail' // 专题详情
import SpecialDetailDraft from '../pages/SpecialDetailDraft' // 专题详情草稿
import ArticleDraft from '../pages/Article/Draft' // 文章草稿
import Popularize from '../pages/Popularize' // 产品推广
import Questionnaire from '../pages/Questionnaire' //评测
import QuestionnaireResult from '~/pages/QuestionnaireResult/QuestionnaireResult' //评测结果
import TradeRecord from '../pages/Trade/TradeRecord' // 交易记录-列表
import TradeRecordDetail from '../pages/Trade/TradeRecordDetail' // 交易记录-详情
import AdviserFee from '../pages/Trade/AdviserFee' // 投顾服务费
import LargeAmount from '~/pages/Trade/LargeAmount' // 大额急速购
import IdAuth from '~/pages/CreateAccount/idAuth' // 开户实名认证
import BankInfo from '~/pages/CreateAccount/bankInfo' // 开户绑定银行卡
import SetTradePassword from '~/pages/CreateAccount/setTradePassword' // 设置交易密码
import PortfolioAssetList from '~/pages/Assets/PortfolioAssetList/PortfolioAssetList' //持仓品类
import history from './history'
import AssetsConfigDetail from '~/pages/AssetsConfigDetail' // 资产分布
import TradeRules from '~/pages/TradeRules' // 交易须知
import TradeRedeem from '~/pages/Trade/TradeRedeem/TradeRedeem' //赎回
import CommonProblem from '~/pages/CommonProblem' // 常见问题
import MfbIndex from '~/pages/MfbHome' // 魔方宝首页
import MfbHoldingInfo from '~/pages/MfbHoldingInfo' // 魔方宝持有信息
import AutoCharge from '~/pages/AutoCharge' // 自动充值
import PortfolioAssets from '~/pages/Assets/PortfolioAssets/PortfolioAssets' //持仓详情页
import TradePwdManagement from '~/pages/TradePwdManagement' // 交易密码管理
import ModifyTradePwd from '~/pages/ModifyTradePwd' // 修改交易密码
import ForgotTradePwd from '~/pages/ForgotTradePwd' // 忘记交易密码
import ForgotTradePwdNext from '~/pages/ForgotTradePwdNext' // ForgotTradePwdNext
import MfbOut from '~/pages/MfbOut' // 魔方宝转出
import RemindMessage from '~/pages/Message/RemindMessage' // 消息中心
import MessageList from '~/pages/Message/MessageList' // 消息中心-具体消息列表
import HoldingFund from '~/pages/HoldFound/HoldingFund' // 持有基金
import FundSearching from '~/pages/HoldFound/FundSearching' // 基金查询方式
import HistoryHoldFunds from '~/pages/HoldFound/HistoryHoldFunds' // 历史持有基金
import TotalIncomeDetail from '~/pages/ProfitAnalysis/ProfitDetail' //添加收益明细界面
import FixedPlanList from '~/pages/FixedInvestment/FixedInvestManage' //定投管理界面
import FixedInvestDetail from '~/pages/FixedInvestment/FixedInvestDetail' //定投详情界面
import TerminatedFixedInvest from '~/pages/FixedInvestment/TerminatedFixedInvest' //终止定投界面逻辑
import ModifyFixedInvest from '~/pages/FixedInvestment/ModifyFixedInvest' //修改定投
import BankCardList from '~/pages/BankManage/BankCardList' //银行卡列表
import AddBankCard from '~/pages/BankManage/AddBankCard' //添加银行卡
import BankCard from '~/pages/BankManage/BankCard'
import TradeBuy from '~/pages/Trade/TradeBuy' // 购买/定投页
import MfbIn from '~/pages/MfbIn'
import ModifyPhoneNum from '../pages/ModifyPhoneNum/ModifyPhoneNum'
import InsuranceIntroduce from '../pages/InsuranceIntroduce' // PR-1158 保险介绍页
import TradeFixedConfirm from '../pages/TradeFixedConfirm' // 定投确认页
import TradeProcessing from '~/pages/Trade/TradeProcessing' // 交易确认页
import TradeAgreements from '~/pages/Trade/TradeAgreements' // 基金组合协议和产品概要
import VerifyCodeQA from '~/pages/VerifyCodeQA' // 收不到验证码
import TradeAgreementList from '~/pages/Trade/TradeAgreementList' // 权益须知
import {storage} from '~/utils'
import http from '~/service'
import qs from 'qs'
import {AliveScope} from 'react-activation'
import {getUserInfo} from '~/redux/actions/userinfo'

const GlobalGetUserInfo = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getUserInfo())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return null
}

const {store} = configStore()
function AppRouter() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (!window.ReactNativeWebView) {
            // document.querySelector('.AppRouter').style.overflow = 'auto'

            // login by code
            const {partner, login_code} = qs.parse(window.location.href.split('?')[1]) || {}
            if (partner && login_code) {
                if (!storage.getItem('loginStatus')) {
                    http.post('/auth/user/login_by_code/202212', {login_code: login_code})
                        .then((res) => {
                            if (res?.code === '000000' && res?.result?.uid) {
                                localStorage.setItem('loginStatus', JSON.stringify(res.result))
                            } else if (res?.code === 'A00001') {
                                localStorage.removeItem('loginStatus')
                            }
                        })
                        .finally(() => {
                            setShow(true)
                        })
                } else {
                    setShow(true)
                }
            } else {
                setShow(true)
            }
        } else {
            setShow(true)
        }
    }, [])
    useEffect(() => {
        if (show) {
            if (!window.ReactNativeWebView) {
                document.querySelector('.AppRouter').style.overflow = 'auto'
            }
        }
    }, [show])
    return show ? (
        <div className="AppRouter">
            <Provider store={store}>
                <GlobalGetUserInfo />
                <Router history={history}>
                    <AliveScope>
                        <Switch>
                            <Route path="/" exact component={App} />
                            <Route path="/investor" component={() => null} />
                            <Route path="/article/:id" component={Article} />
                            <Route path="/fundSafe" component={FundSafe} />
                            <Route path="/aboutLcmf/:pos?" component={AboutLCMF} />
                            <Route path="/knowLcmf" component={KnowLCMF} />
                            <Route path="/activityPage" component={ActivityPage} />
                            <Route path="/chart" component={Chart} />
                            <Route path="/register" component={Register} />
                            <Route path="/invite" component={InviteRegister} />
                            <Route path="/signalCanvas/:degree?" component={SignalCanvas} />
                            <Route path="/privacy" component={Privacy} />
                            <Route path="/features" component={Features} />
                            <Route path="/agreement/:id" component={Agreement} />
                            <Route path="/licenses" component={Licenses} />
                            <Route path="/babyInvite" component={BabyInvite} />
                            {/* <Route path='/newYearActivities' component={NewYearActivities} /> */}
                            {/* <Route path='/portfolios_report/2021' component={InvestAnnals2021} /> */}
                            {/* <Route path='/PersonalAnnualReport' component={PersonalAnnualReport} /> */}
                            <Route
                                path="/portfolioBabyDetail/:account_id?/:upid?/:amount?"
                                component={PortfolioBabyDetail}
                            />
                            {/*收益明细*/}
                            <Route path="/TotalIncomeDetail" component={TotalIncomeDetail} />
                            {/*定投*/}
                            <Route path="/FixedPlanList" component={FixedPlanList} />
                            <Route path="/TerminatedInvest" component={TerminatedFixedInvest} />
                            <Route path="/ModifyFixedInvest" component={ModifyFixedInvest} />
                            <Route path="/FixedInvestDetail/:invest_plan_id" component={FixedInvestDetail} />
                            {/*银行卡管理*/}
                            <Route path="/BankCardList" component={BankCardList} />
                            <Route path="/AddBankCard" component={AddBankCard} />
                            <Route path="/Agreement" component={Agreement} />
                            <Route path="/BankCard/:pay_method" component={BankCard} />
                            <Route path="/ModifyPhoneNum" component={ModifyPhoneNum} />
                            <Route path="/userInfoDelete" component={UserInfoDelete} />
                            <Route path="/launchApp" component={LaunchApp} />
                            <Route path="/newAgreement/:id" component={NewAgreement} />
                            {/* <Route path='/annualReport/:year?' component={AnnualReport} /> */}
                            <Route path="/MessageNotice" component={MessageNotice} />
                            <Route path="/educationalFund" component={EducationalFund} /> {/* 保险-教育金 */}
                            <Route path="/educationalFundDetails/:sale_id?" component={EducationalFundDetails} />{' '}
                            {/* 保险-教育金详情页 */}
                            <Route path="/oldAgePension" component={OldAgePension} /> {/* 保险-养老金 */}
                            <Route path="/oldAgePensionDetails" component={OldAgePensionDetails} />{' '}
                            {/* 保险-养老金详情页 */}
                            <Route path="/noRisk" component={NoRisk} /> {/* 保险-无风险账户 */}
                            <Route path="/noRiskDetails" component={NoRiskDetails} /> {/* 保险-无风险账户详情页 */}
                            <Route path="/inviteGetRE" component={InviteGetRE} />
                            <Route path="/doubleGifts" component={DoubleGifts} />
                            <Route path="/plantTree" component={PlantTree} />
                            <Route path="/panelChartOfTool" component={PanelChartOfTool} />
                            <Route path="/promoteOpenFollow" component={PromoteOpenFollow} />
                            <Route path="/rationalChart" component={RationalChart} />
                            <Route path="/articleReadACT" component={ArticleReadACT} />
                            <Route path="/qaACT" component={QaACT} />
                            <Route path="/feeDiscount" component={FeeDiscount} />
                            <Route path="/goToAppStore" component={GoToAppStore} />
                            <Route path="/blancedPortfolio" component={BlancedPortfolio} />
                            <Route path="/fundDetail/:code" component={FundDetail} />
                            <Route path="/portfolioDetails" component={PortfolioDetails} />
                            <Route path="/FallBuy" component={FallBuy} />
                            <Route path="/ProbabilitySignal" component={ProbabilitySignal} />
                            <Route path="/TaurenSignal" component={TaurenSignal} />
                            <Route path="/IndexDetails" component={IndexDetails} />
                            <Route path="/LowBuy" component={LowBuy} />
                            <Route path="/GoalRedeem" component={GoalRedeem} />
                            <Route path="/projectDetail/:project_id" component={ProjectDetail} />
                            <Route path="/active818" component={Active818} />
                            <Route path="/v7AlphaInvite" component={V7AlphaInvite} />
                            <Route path="/PortfolioIntroduce" component={PortfolioIntroduce} />
                            <Route path="/SpecialDetail" component={SpecialDetail} />
                            <Route path="/SpecialDetailDraft" component={SpecialDetailDraft} />
                            <Route path="/articleDraft" component={ArticleDraft} />
                            <Route path="/popularize" component={Popularize} />
                            <Route path="/Questionnaire" component={Questionnaire} />
                            <Route path="/QuestionnaireResult" component={QuestionnaireResult} />
                            <Route path="/tradeRecord" component={TradeRecord} />
                            <Route path="/TradeRecordDetail" component={TradeRecordDetail} />
                            <Route path="/AdviserFee" component={AdviserFee} />
                            <Route path="/IdAuth" component={IdAuth} />
                            <Route path="/BankInfo" component={BankInfo} />
                            <Route path="/SetTradePassword" component={SetTradePassword} />
                            <Route path="/PortfolioAssetList" component={PortfolioAssetList} />
                            <Route path="/AssetsConfigDetail" component={AssetsConfigDetail} />
                            <Route path="/TradeRules" component={TradeRules} />
                            <Route path="/TradeRedeem" component={TradeRedeem} />
                            <Route path="/CommonProblem" component={CommonProblem} />
                            <Route path="/MfbIndex" component={MfbIndex} />
                            <Route path="/MfbHoldingInfo" component={MfbHoldingInfo} />
                            <Route path="/AutoCharge" component={AutoCharge} />
                            <Route path="/PortfolioAssets" component={PortfolioAssets} />
                            <Route path="/TradePwdManagement" component={TradePwdManagement} />
                            <Route path="/ModifyTradePwd" component={ModifyTradePwd} />
                            <Route path="/ForgotTradePwd" component={ForgotTradePwd} />
                            <Route path="/ForgotTradePwdNext" component={ForgotTradePwdNext} />
                            <Route path="/MfbOut" component={MfbOut} />
                            <Route path="/RemindMessage" component={RemindMessage} />
                            <Route path="/MessageList" component={MessageList} />
                            <Route path="/TradeBuy" component={TradeBuy} />
                            <Route path="/MfbIn" component={MfbIn} />
                            <Route path="/HoldingFund" component={HoldingFund} />
                            <Route path="/FundSearching" component={FundSearching} />
                            <Route path="/HistoryHoldFunds" component={HistoryHoldFunds} />
                            <Route path="/LargeAmount" component={LargeAmount} />
                            <Route path="/InsuranceIntroduce" component={InsuranceIntroduce} />
                            <Route path="/TradeProcessing" component={TradeProcessing} />
                            <Route path="/TradeFixedConfirm" component={TradeFixedConfirm} />
                            <Route path="/TradeAgreements" component={TradeAgreements} />
                            <Route path="/VerifyCodeQA" component={VerifyCodeQA} />
                            <Route path="/TradeAgreementList" component={TradeAgreementList} />
                            <Redirect to="/" />
                        </Switch>
                    </AliveScope>
                </Router>
            </Provider>
        </div>
    ) : null
}

export default AppRouter
