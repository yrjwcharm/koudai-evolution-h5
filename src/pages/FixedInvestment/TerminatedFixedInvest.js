/*
 * @Date: 2022/10/11 13:52
 * @Author: yanruifeng
 * @Description: 已终止定投页面
 */
import React, {useCallback, useEffect, useState} from 'react'
import {FlatList, StyleSheet, View} from 'react-native'
import {px} from '../../utils/appUtil'
import {Colors} from '../../common/commonStyle'
import InvestHeader from './components/InvestHeader'
import Empty from '../../components/Empty'
import {callTerminatedFixedApi} from './services'
import RenderItem from './components/RenderItem'
import EmptyData from './components/EmptyData'
import Loading from '../../components/Loading'
import QueryString from 'qs'
const TerminatedFixedInvest = () => {
    const params = QueryString.parse(window.location.href.split('?')[1]) || {}
    const {type, poid = '', code = ''} = params
    const [data, setData] = useState({})
    const [loading, setLoading] = useState(true)
    const [showEmpty, setShowEmpty] = useState(false)
    const [emptyMsg, setEmptyMsg] = useState('')
    useEffect(() => {
        ;(async () => {
            const res = await callTerminatedFixedApi({type, poid, fund_code: code})
            if (res.code === '000000') {
                const {title = ''} = res.result || {}
                // navigation.setOptions({title});
                setLoading(false)
                setData(res.result)
            }
        })()
    }, [])
    const renderEmpty = useCallback(() => {
        return showEmpty ? <Empty text={emptyMsg || '暂无数据'} /> : null
    }, [emptyMsg, showEmpty])
    const executeSort = useCallback((data) => {
        if (data.sort_key) {
            callTerminatedFixedApi({
                sort_key: data?.sort_key,
                type,
                poid,
                fund_code: code,
                sort: data?.sort_type == 'asc' ? '' : data?.sort_type == 'desc' ? 'asc' : 'desc',
            }).then((res) => {
                if (res.code === '000000') {
                    setData(res.result)
                }
            })
        }
    }, [])
    return (
        <>
            {loading ? (
                <Loading color={Colors.btnColor} />
            ) : (
                <div style={styles.container}>
                    <div style={{marginTop: px(12)}} />
                    <InvestHeader headList={data?.head_list ?? []} handleSort={executeSort} />
                    {(data?.data_list ?? []).map((el, index) => {
                        return <RenderItem key={index + '' + el} item={el} index={index} />
                    })}
                    {(data?.data_list ?? []).length == 0 && <EmptyData />}
                </div>
            )}
        </>
    )
}

TerminatedFixedInvest.propTypes = {}

export default TerminatedFixedInvest
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgColor,
    },
})
