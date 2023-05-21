import {Slider} from 'antd-mobile'
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react'
import './index.css'

const SliderDate = ({num, content, onChange}, ref) => {
    const [value, setValue] = useState(0)

    const max = useMemo(() => {
        return Math.round(num / 0.62)
    }, [num])

    const top = useMemo(() => {
        return Math.round(max * 0.8)
    }, [max])
    const bottom = useMemo(() => {
        return Math.round(max * 0.18)
    }, [max])

    useEffect(() => {
        top && setValue(top)
    }, [top])

    useImperativeHandle(ref, () => ({
        reset: () => {
            top && setValue(top)
        },
    }))

    const handlerChange = useCallback(
        (value) => {
            let val = value
            if (value >= top) {
                val = top
            }
            if (value <= bottom) {
                val = bottom
            }
            setValue(val)
            onChange?.(val - bottom)
            // inputRef.current.value = value
        },
        [top, bottom, onChange],
    )

    return (
        <div className="sliderDateWrap">
            <Slider
                value={+value}
                onChange={handlerChange}
                step={1}
                max={max}
                style={{'--fill-color': 'transparent'}}
                icon={<Icon value={value - bottom} content={content} />}
            />
        </div>
    )
}

export default forwardRef(SliderDate)

const Icon = ({value, content}) => {
    const inputRef = useRef(null)
    const _value = useRef(Infinity)
    const [left, setLeft] = useState(true)

    useEffect(() => {
        if (value < 1 || value === _value.current) return
        setLeft(value < _value.current)
        _value.current = value
    }, [value])

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = content || ''
        }
    }, [content])

    return (
        <div className="sliderThumbReal">
            <div
                className={'triangleLeft'}
                style={{
                    borderRightColor: left ? '#545968' : '#CCCDD2',
                }}
            ></div>
            <input ref={inputRef} disabled={true} className="inputStyle" />
            <div
                className={'triangleRight'}
                style={{
                    borderLeftColor: left ? '#CCCDD2' : '#545968',
                }}
            ></div>
        </div>
    )
}
