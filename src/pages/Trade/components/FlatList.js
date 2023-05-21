import React, {useEffect, useState, useRef, useMemo, useImperativeHandle} from 'react'
import {List, PullToRefresh} from 'antd-mobile'

import Empty from '~/components/Empty'
import styles from './FlatList.module.scss'
import {debounce} from '~/utils'

const ListFooterComponent = ({hasMore, onLoadMore, renderFooter, loading, pid}) => {
    const elementRef = useRef(null) // Prevent duplicated trigger of `check` function
    // const [flag, setFlag] = useRef({})

    const doLoadMore = debounce(
        () => {
            onLoadMore(false)
        },
        500,
        true,
    )

    useEffect(() => {
        if (!hasMore || loading) return
        if (elementRef.current) {
            const node = elementRef.current
            try {
                const intersectionObserver = new IntersectionObserver(function (entries) {
                    const ratio = entries[0].intersectionRatio
                    if (ratio > 0) {
                        doLoadMore()
                    }
                })
                intersectionObserver.observe(node)
                return () => {
                    if (node) {
                        intersectionObserver.unobserve(node)
                    }
                }
            } catch (e) {
                // TODO: 不支持 Observer api
                // document
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasMore, loading])
    if (renderFooter) {
        return <div ref={elementRef}>{renderFooter(hasMore)}</div>
    }

    return (
        <div ref={elementRef} className={styles.listFooter}>
            <span className={styles.tip}>{hasMore ? '正在加载...' : '我们是有底线的...'}</span>
        </div>
    )
}

function RetryLoadBox({isInit, retryLoade}) {
    return (
        <div className={isInit ? styles.retryLoadBox : styles.retryLoadEndBox} onClick={retryLoade}>
            <span className={styles.errtip}>加载失败，点击重新加载</span>
        </div>
    )
}

let _id = 1
function FlatList(props, ref) {
    const {renderItem, loader, renderHeader, renderEmpty, renderFooter, ...otherProps} = props
    const uid = useMemo(() => 'FlatList_' + _id++, [])

    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(true)
    const [loadError, setLoadError] = useState()
    const [first, setFirst] = useState(true)

    const scrollViewRef = useRef()
    useEffect(() => {
        const onChange = (result) => {
            console.log('onChange', result)
            setFirst(false)
            setData(result.data || [])
            setLoading(result.loading)
            setHasMore(result.hasMore)
            setLoadError(result.error)
        }
        loader.addListener('change', onChange)

        loader.refresh()

        return () => {
            loader.removeListener('change', onChange)
        }
    }, [loader])

    const onLoadMore = () => {
        loader.loadMore()
    }
    const onRefresh = () => {
        loader.refresh()
    }
    const scrollTop = () => {
        scrollViewRef?.current.scroll(0, 0)
    }

    useImperativeHandle(ref, () => ({
        scrollTop,
    }))

    return (
        <div {...otherProps} className={`${props.className} ${styles.FlatList}`} ref={scrollViewRef} id={uid}>
            <PullToRefresh onRefresh={onRefresh}>
                <List className={styles.list} header={renderHeader?.()}>
                    {(data || []).map((item, index) => (
                        <List.Item style={{backgroundColor: 'transparent'}} key={item?.time}>
                            {renderItem({item, index})}
                        </List.Item>
                    ))}
                </List>
                {!loading && loadError && <RetryLoadBox isInit={loadError.page === 1} retryLoade={loader.retryLoade} />}

                {!loadError &&
                    !loading &&
                    !first &&
                    data.length == 0 &&
                    (renderEmpty ? renderEmpty() : <Empty text={'暂无记录'} />)}
                {!loadError && (first || data.length > 0) && (
                    <ListFooterComponent
                        renderFooter={renderFooter}
                        hasMore={hasMore}
                        onLoadMore={onLoadMore}
                        loading={loading}
                        pid={uid}
                    />
                )}
            </PullToRefresh>
        </div>
    )
}

export default React.forwardRef(FlatList)
