const loaderConfig = () => ({
    name: '',
    startPage: 1,
    serial: true, // 是否需求上次请求的extra参数
    initParams: {},
    // 请求方法，params: 参数 next(data, end) 请求返回的结果，data 结果 end 是否没有下一下啊
    fetcher: (params, next) => {},
    refreshParams: null,
    loadMoreParams: null,

    onChange: () => {},
})

const TaskState = {
    WAIT: 'WAIT',
    RUN: 'RUN',
    COMPLETE: 'COMPLETE',
    FAIL: 'FAIL',
}

// const TaskMode = {
//     SERIAL: 'SERIAL',
//     CONCURRENT: 'CONCURRENT',
// }

const Event = {
    change: 'change', // 列表数据变化 loadin hasmore 变化
    data: 'data', // 每次接口请求返回
}
// const defaultTask = () => ({
//     params: {},
//     abort: {abort: () => {}},
//     page: 1,
//     uid: '',
//     trycount: MaxTryCount,
//     loading: true,
//     fail: false,
//     data: null,
//     has_more: true,
// })

const MaxTryCount = 3

export default class PageDataLoader {
    constructor(props) {
        Object.assign(this, {...loaderConfig(), ...props})

        this.currentPage = -1
        this.fail = false

        this.taskQueue = []
        this.data = []

        this._uid = 0
        this.listeners = []

        this.timer = setInterval(this.runloop, 200)
    }

    uid = () => `${this.name}_${this._uid++}`

    clear = () => {
        clearInterval(this.timer)
        try {
            this.taskQueue.forEach((it) => {
                it.abort.abort()
            })
        } catch (e) {
            console.log(e)
        }
        this.taskQueue = []
        this.data = []
    }

    noticeify = (position) => {
        const change = {}

        const hasError = this.taskQueue.some((it) => !!it.error)

        if (hasError) {
            const task = this.taskQueue.find((it) => !!it.error)
            if (task.page === this.startPage) {
                this.data = []
            }
            change.error = {
                info: task.error,
                page: task.page,
            }
        }
        change.data = this.data
        change.loading = this.taskQueue.some((it) => it.state === TaskState.RUN)
        change.hasMore = this.taskQueue[this.taskQueue.length - 1].hasMore

        this.listeners.forEach((lt) => {
            if (lt.type === Event.change) {
                const func = lt.func
                try {
                    func(change)
                } catch (err) {
                    console.error(err)
                }
            }
        })
    }

    runloop = () => {
        let end = false
        let endLoop = () => (end = true)
        this.taskQueue.forEach((it) => {
            if (!end) {
                this.doRequest(it, endLoop)
            }
        })
    }

    doRequest = (task, endLoop) => {
        if (task.state === TaskState.RUN) {
            endLoop()
            return
        }
        if (task.state === TaskState.COMPLETE) {
            return
        }

        if (task.state === TaskState.FAIL) {
            if (task.trycount > 0) {
                task.trycount -= 1
            } else {
                endLoop()
                return
            }
        }

        let params = task.params

        if (task.dependUid) {
            let depend = this.taskQueue.find((it) => it.uid === task.dependUid)
            if (!depend) {
                task.state = TaskState.FAIL
                task.trycount = 0
                task.failReason = 'depend task is miss'
                return
            }

            params = Object.assign(params, depend.extra)
        }
        task.state = TaskState.RUN

        if (task.trycount === MaxTryCount) {
            this.noticeify('start')
        }

        this.fetcher(params, {signal: task.abort.signal, next: task.next})
    }

    nextWrap = (uid) => {
        const that = this
        return function next(error, result) {
            const task = that.taskQueue.find((it) => it.uid === uid)
            if (!task) return

            if (error) {
                task.state = TaskState.FAIL
                task.error = error
                task.result = result
                if (task.trycount <= 0) {
                    that.noticeify('end')
                }
                return
            }

            const {data, hasMore, extra} = result

            task.state = TaskState.COMPLETE
            task.data = data
            task.hasMore = hasMore

            task.extra = extra

            task.result = result

            that.listeners.forEach((lt) => {
                if (lt.type === Event.data) {
                    const func = lt.func
                    try {
                        func(result)
                    } catch (err) {
                        console.error(err)
                    }
                }
            })

            if (task.page <= that.startPage) {
                that.data = data
            } else {
                that.data = that.data.concat(data)
            }
            that.noticeify('end')
        }
    }

    addTask = (params, page) => {
        const abort = new AbortController()

        const uid = this.uid()
        let dependUid = null
        const _next = this.nextWrap(uid)
        if (this.serial) {
            dependUid = this.taskQueue[this.taskQueue.length - 1]?.uid ?? null
        }

        this.taskQueue.push({
            params: {...this.initParams, page, ...params},
            abort,
            page: page,
            trycount: MaxTryCount,
            uid,
            dependUid: dependUid,
            state: TaskState.WAIT,
            data: null,
            result: null,
            hasMore: true,
            next: _next,
        })
        console.log(`${this.name} add task: ${uid} page:${page}`)
    }

    addListener = (type, func) => {
        this.listeners.push({type, func})
    }

    removeListener = (type, func) => {
        const listener = this.listeners.find((it) => it.type === type && it.func === func)
        const index = this.listeners.indexOf(listener)
        this.listeners.splice(index, 1)
    }
    refresh = () => {
        this.taskQueue.forEach((task) => {
            task.abort.abort()
        })
        this.taskQueue = []
        this.resultQueue = []
        this.has_more = true
        this.fail = false

        const page = this.startPage
        this.currentPage = page
        let params = {}
        if (this.refreshParams) {
            params = this.refreshParams(page)
        }

        this.addTask(params, page)
        this.runloop()
    }

    //  重新加载
    retryLoade = () => {
        const task = this.taskQueue.find((it) => it.state === TaskState.FAIL)
        task.state = TaskState.WAIT
        task.trycount = MaxTryCount
        this.runloop()
    }

    //  加载更多
    loadMore = () => {
        if (this.currentPage < this.startPage) {
            this.refresh(true)
            return
        }
        // 判断任务队列是否失败
        const lastTask = this.taskQueue[this.taskQueue.length - 1]
        if (lastTask && lastTask.state !== TaskState.COMPLETE) {
            return
        }

        const page = this.currentPage + 1
        if (page >= 100) return

        this.currentPage = page

        let params = {}
        if (this.loadMoreParams) {
            params = this.loadMoreParams(page)
        }

        this.addTask(params, page)
    }

    // 手动在外部修改列表
    changeData = (cb) => {
        if (typeof cb === 'function') {
            let result = cb(this.data)
            if (result !== undefined) {
                this.data = result
            }
        } else {
            this.data = cb
        }
        this.noticeify()
    }

    loadToPage = (page) => {
        this.refresh(false)
        while (this.currentPage < page) {
            this.loadMore(false)
        }
    }
}
