/*
 * @Date: 2022-11-24 16:32:16
 * @Description:
 */
export default function copyText(text) {
    window.getSelection().removeAllRanges() //这段代码必须放在前面否则无效
    var input = document.createElement('input')
    document.body.appendChild(input)
    input.setAttribute('value', text)
    input.select()
    var range = document.createRange()
    // 选中需要复制的节点
    range.selectNode(input)
    // 执行选中元素
    window.getSelection().addRange(range)
    input.select()
    input.setSelectionRange(0, input.value.length) //适配高版本ios
    // 执行 copy 操作
    document.execCommand('copy')
    // 移除选中的元素
    window.getSelection().removeAllRanges()
    document.body.removeChild(input)
}
