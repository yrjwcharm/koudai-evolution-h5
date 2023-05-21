import React from 'react'

export default function Html(props) {
    const {html, ellipsizeMode, numberOfLines, ...others} = props

    return <div {...others} dangerouslySetInnerHTML={{__html: html}} />
}
