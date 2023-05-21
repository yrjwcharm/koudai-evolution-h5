/*
 * @Description:
 * @Autor: xjh
 * @Date: 2021-01-15 15:56:47
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-15 18:12:27
 */
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './index.module.scss'
export default class Radio extends Component {
    static defaultProps = {
        checked: false,
    }
    static propTypes = {
        checked: PropTypes.bool.isRequired,
    }
    constructor(props) {
        super(props)
        this.state = {
            // checked: false,
            index: props.index,
        }
    }
    toggle() {
        this.setState({checked: !this.state.checked})
        this.props.onChange(!this.state.checked, this.state.index)
    }
    render() {
        return this.props.click ? (
            <div className={classNames([styles.radio_circle, styles.flexRowCenter, this.props.style])}>
                {this.props.checked && <div className={styles.radio_fill} />}
            </div>
        ) : (
            <div
                className={classNames([styles.radio_circle, styles.flexRowCenter, this.props.style])}
                onClick={this.toggle.bind(this)}
            >
                {this.props.checked && <div className={styles.radio_fill} />}
            </div>
        )
    }
}
