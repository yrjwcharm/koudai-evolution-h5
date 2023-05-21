/*
 * @Date: 2021-07-26 14:22:53
 * @Author: yhc
 * @LastEditors: yhc
 * @LastEditTime: 2021-08-06 14:23:59
 * @Description:
 */
import React, {Component} from 'react'
import circle from '../../image/bg/circle.png'

class Index extends Component {
    constructor(x, y, degree) {
        super()
        this.x = x
        this.y = y
        this.degree = degree //热度
        this.maxPercent = 120 //最大进度
        this.color = '#eee'
        this.radius = 80 //半径
        this.process = 0 //初始进度
        this.timer = ''
        this.scaleWidth = 8 //刻度的长度
        this.circleWith = 148 //图片的大小
        this.scaleSpace = 14 //刻度与圆的距离
        this.canvas = React.createRef()
        this.scaleColors = [
            '#FED5D1',
            '#FFDAD6',
            '#FFD9D6',
            '#FFD7D4',
            '#FCCBC8',
            '#FCC5C2',
            '#F9B4B1',
            '#F7A7A5',
            '#F49390',
            '#F28885',
            '#EF7573',
            '#ED6A67',
            '#EC605E',
            '#EB5B59',
            '#EB5B59',
            '#EB5C5A',
        ]
    }

    componentDidMount() {
        this.degree = this.props.match?.params?.degree || 80
        //获取真实canvasDOM
        const canvas = this.canvas.current
        //绘制区域中心点
        let centerX, centerY
        //绘制上下文
        const ctx = canvas.getContext('2d')
        //设置canvas满屏 将画布放大两倍
        canvas.width = 305 * 3
        canvas.height = 240 * 3
        ctx.scale(3, 3)
        //设置中心点
        centerX = canvas.width / 6
        centerY = canvas.height / 6 + 20
        //实例化圆
        let c = new Index(centerX, centerY, this.props.match?.params?.degree || 80)

        // requestAnimationFrame(function step(){
        //     loading()
        //     requestAnimationFrame(step);
        // },this);
        if (this.degree > this.maxPercent) {
            this.maxPercent = this.degree
        }
        const loading = () => {
            if (this.process >= this.degree) {
                clearInterval(this.timer)
            }
            // 清除canvas内容
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            c.drawLine(ctx)
            c.drawTextCon(ctx)
            c.drawText(ctx, this.process >= this.degree ? this.degree : this.process)
            //画圆弧
            c.drawDefalut(ctx)
            // 进度圆弧
            c.sector(ctx, (this.process / this.maxPercent) * 270)
            //动态刻度
            c.drawLineProgress(ctx, (this.process / this.maxPercent) * 100)
            //小原点
            c.drawSmCircle(
                Math.cos(((this.process / this.maxPercent) * 270 * Math.PI) / 180 + Math.PI * 0.74) * this.radius +
                    centerX,
                Math.sin(((this.process / this.maxPercent) * 270 * Math.PI) / 180 + Math.PI * 0.74) * this.radius +
                    centerY,
                ctx,
            )
            // 控制结束时动画的速度
            // if (this.process / this.degree > 0.90) {
            //     this.process += 2;
            // } else if (this.process / this.degree > 0.80) {
            //     this.process += 1.5;
            // } else if (this.process / this.degree > 0.70) {
            //     this.process += 1;
            // } else {
            //     this.process += 0.5;
            // }
            this.process += this.degree / (800 / 16)
        }
        this.timer = setInterval(loading, 16)
    }
    componentWillUnmount() {
        clearInterval(this.timer)
    }
    /**
     * 绘制圆
     * @param  ctx 绘制上下文
     */
    drawDefalut(cxt) {
        cxt.save()
        cxt.beginPath()
        cxt.strokeStyle = this.color
        cxt.lineWidth = 10
        cxt.lineCap = 'round'
        cxt.arc(this.x, this.y, this.radius, (3 / 4) * Math.PI, Math.PI / 4, false)
        cxt.stroke()
        cxt.restore()
    }
    //文案的容器
    drawTextCon(cxt) {
        cxt.save()
        cxt.translate(this.x, this.y)
        cxt.beginPath()
        var img = new Image()
        img.src = circle
        cxt.drawImage(img, -74, -71, this.circleWith, this.circleWith)
        cxt.restore()
    }
    //文案

    drawText = (cxt, process) => {
        cxt.save()
        cxt.translate(this.x, this.y)
        cxt.font = 'bold 20px PingFangSC-Semibold, PingFang SC'
        cxt.textAlign = 'center'
        cxt.fillStyle = this.degree >= 80 ? '#E74949' : '#EB7121'
        cxt.fillText(this.degree >= 80 ? '建议购买' : '建议持有', 0, -6)
        cxt.restore()
        cxt.save()
        cxt.translate(this.x, this.y)
        cxt.font = '12px PingFangSC-Semibold, PingFang SC'
        cxt.textAlign = 'center'
        cxt.fillStyle = '#121D3A'
        cxt.fillText('当前热度', -20, 20)
        cxt.restore()
        cxt.save()
        cxt.translate(this.x, this.y)
        cxt.font = '18px DINAlternate-Bold'
        cxt.textAlign = 'left'
        cxt.fillStyle = this.degree >= 80 ? '#E74949' : '#EB7121'
        cxt.fillText(parseInt(process) + '℃', 6, 22)
        cxt.restore()
    }
    //刻度
    drawLine(ctx) {
        let pi = Math.PI
        ctx.save()
        ctx.translate(this.x, this.y)
        for (let i = 0; i < 61; i++) {
            //绘制刻度。
            ctx.save()
            ctx.rotate(pi * 0.75 + (i * pi) / 40) //旋转坐标轴。坐标轴x的正方形从 向上开始算起
            ctx.beginPath()
            ctx.moveTo(this.radius + this.scaleSpace, 0)
            ctx.lineTo(this.radius + this.scaleSpace + this.scaleWidth, 0)
            ctx.lineWidth = 1
            ctx.strokeStyle = '#eee'
            ctx.stroke()
            ctx.closePath()
            ctx.restore()
        }
        ctx.restore()
    }
    //动态刻度
    drawLineProgress(ctx, process) {
        let pi = Math.PI
        ctx.save()
        ctx.translate(this.x, this.y)
        for (let i = 0; i < Math.floor(process * 0.6) + 1; i++) {
            //绘制刻度。
            ctx.save()
            ctx.rotate(pi * 0.75 + (i * pi) / 40) //旋转坐标轴。坐标轴x的正方形从 向上开始算起
            ctx.beginPath()
            ctx.moveTo(this.radius + this.scaleSpace, 0)
            ctx.lineTo(this.radius + this.scaleSpace + this.scaleWidth, 0)
            ctx.lineWidth = 1
            ctx.strokeStyle = this.scaleColors[Math.round(i / 4)]
            ctx.stroke()
            ctx.restore()
        }
        ctx.restore()
    }

    //小圆点
    drawSmCircle(x, y, cxt) {
        cxt.save()
        cxt.beginPath()
        cxt.strokeStyle = '#fff'
        cxt.fillStyle = '#fff'
        cxt.arc(x, y, 4, 0, Math.PI * 2, false)
        cxt.fill()
        cxt.stroke()
        cxt.restore()
    }
    sector(cxt, endAngle) {
        cxt.save()
        cxt.beginPath()
        cxt.lineWidth = 14
        var linGrad = cxt.createLinearGradient(this.x - 120, this.y + 10, this.x, this.y)
        // cxt.shadowBlur=100;
        // cxt.shadowOffsetY=0;
        // cxt.shadowColor="#FFDAD7";
        linGrad.addColorStop('0', '#FF8C42') // 绿色
        // linGrad.addColorStop('0.50', '#E74949');     // 橙色
        linGrad.addColorStop('1', '#E74949') // 红色
        cxt.strokeStyle = linGrad
        cxt.lineCap = 'round'
        cxt.arc(this.x, this.y, this.radius, 0.75 * Math.PI, endAngle * (Math.PI / 180.0) + Math.PI * 0.75, false)
        cxt.stroke()
        cxt.restore()
    }

    render() {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    zoom: 0.33,
                    backgroundImage: 'linear-gradient(#fff,#f7f8f9)',
                }}
            >
                <canvas ref={this.canvas} className="circle"></canvas>
            </div>
        )
    }
}

export default Index
