// import Stately from 'stately.js'
/**
 * 一个轮播组件
 *
 * @export
 * @class Slide
 */
export default class Slide {
    constructor({
        container = '',
        list = '',
        item = '',
        footer = '',
        direction = 'h',
        auto = false,
        touch = true,
        time = 2000,
        infinite = true,
        width,
        isOnePageScroll = false,
        verticalH
    }) {
        if (!container || !list || !item) {
            throw new Error('container/list/item should not be null')
        }
        //容器
        this.container = document.getElementById(container)
        //需要控制的ul列表
        this.list = this.container.getElementsByClassName(list)[0];
        //只有一页的时候是否轮播
        if(this.list.children.length==0 || this.list.children.length==1 && !isOnePageScroll)
            return 
        //拖动页面数量
        this.len = this.container.getElementsByClassName(item).length;
        //需要控制的小方块
        this.tags = footer && this.container.getElementsByClassName(footer) || [];
        this.footerName = footer
        //小方块的数量
        this.tagsLen = this.tags.length
        //轮播页面数量
        this.fakeLen = infinite ? this.len + 2 : this.len + 1;
        //是否自动播放
        this.auto = auto;
        //是否已创建假节点
        this.createNode = false;
        //水平或垂直
        this.direction = direction;
        //对于垂直方向需要设定一个固定高度
        this.fixedH = verticalH || parseInt(this.list.children[0].clientHeight)
        //是否循环滑动
        this.infinite = infinite
        //后续需要控制的属性
        this.attr = direction === 'h' ? 'translateX' : 'translateY'
        //开始位置
        this.startX = 0;
        //当前的page index
        this.n = infinite ? 1 : 0;
        //一个page的长/宽
        this.pWidth = width || (direction === 'h' ?
            this.container.clientWidth :
            this.fixedH);
        this.dx = 0;
        //是否可拖动
        this.touch = touch;
        //自动轮播的duration
        this.time = time;
         //list的初始位置
        this.origin = infinite ? -this.pWidth : 0
        //如果循环滑动就创建两个假节点
        infinite && this.autoCreate()
        //如果自动播放就创建一个假节点
        auto && this.autoCreate()
        //不自动播放就设置inline style
        !auto && this.setAttr();

        //定时器的timer
        this.timer = null
        //
        this.slideTimer = null
        var that = this
        this.state = Stately.machine({
            'Idle': { //待机状态
                onEnter() {
                    that.auto ? this.Idle.autoPlay.apply(this) :
                        this.Idle.touchMove.apply(this)
                },
                autoPlay() { //自动播放
                    this.setMachineState(this.Auto)
                },
                touchMove() { //手势滑动
                    this.setMachineState(this.Move)
                },
            },
            'Move': { //手势滑动状态
                touchStart(e){
                    that.startX = e.touches[0].clientX
                    that.left = parseInt(that.list.style.transform.match(/\-?\d+px/)[0], 10)
                },
                touchMoving(e) {
                    //控制滑动
                    that.transitionChange(false)
                    //停止自动播放
                    clearTimeout(that.timer)
                    //获取开始的位置
                    let x = e.touches[0].clientX;
                    let startX = that.startX || x
                    //计算差值和当前的marginleft
                    let dx = parseInt(x - startX);
                    let edge = -that.pWidth * (that.len - 1)
                    // let left = that.direction === 'h' ?
                    //     parseInt(that.list.style.marginLeft, 10) :
                    //     parseInt(that.list.style.marginTop, 10);
                    let left = that.left || 0
                        // console.log("left:"+left)
                    if (!that.infinite){
                        if(left >= edge && left <= that.origin) {
                            //防止超出边界值, 用于infinite为false的情况
                            let sum = Math.round(left + dx)
                            sum > 0 ? sum = 0 : sum
                            sum < edge ? sum = edge : sum
                            // that.list.style[that.attr] = sum + 'px';
                            that.list.style.transform = `${that.attr}(${sum}px)`
                        }

                    }
                    else{//在infinite为true的情况下切换至首页或末页
                        let sum = Math.round(left + dx)
                        that.list.style.transform = `${that.attr}(${sum}px)`

                    }
                    // console.log('edge:'+edge)
                    // console.log(x, that.startX, dx)
                    if(that.startX == 0){
                        that.startX = startX
                        this.Move.touchEnd.call(this, e)
                    }
                },
                touchEnd(e) {
                    //切换页面
                    // console.log('end：'+e.touches[0].clientX)
                    that.dx = that.startX - (e.changedTouches[0] || e.touches[0]).clientX//手势
                    // console.log('dx:'+that.dx)
                    that.startX = 0;
                    that.transitionChange(true)
                    // console.log('this.n:'+that.n)
                    this.setMachineState(this.ChangingManual)
                }
            },
            'Auto': { //自动播放状态
                onEnter() {
                    // console.log('auto')
                    this.Auto.play.apply(this)
                },
                play() {

                    clearTimeout(that.timer)
                    that.transitionChange(true)
                    //到达最后一张
                    // console.log('autoplay n:'+that.n)
                    if (that.fakeLen-1 === that.n) {
                        this.setMachineState(this.ChangingAuto)

                    } else {
                        that.timer = setTimeout(() => {
                            this.setMachineState(this.ChangingAuto)

                        }, that.time);
                    }
                },
                touchMove() { //手势滑动
                    this.setMachineState(this.Move)
                },
            },
            'ChangingAuto': { //切换页面状态
                onEnter() {
                    this.ChangingAuto.autoChange.call(this, -60.11)
                },
                autoChange(dx = that.dx) { //自动播放下切换页面
                    if (dx === -60.11) { //自动播放
                        // console.log(that.pWidth, that.n)
                        if(that.fakeLen-1 === that.n){
                            // that.list.style[that.attr] = -that.pWidth * (that.n) + 'px'
                            that.list.style.transform = `${that.attr}(${-that.pWidth * (that.n)}px)`

                            that.tags.length && that.changeColor()
                            return
                        }
                        // that.list.style[that.attr] = -that.pWidth * (++that.n) + 'px'

                        that.list.style.transform = `${that.attr}(${-that.pWidth * (++that.n)}px)`
                        that.tags.length && that.changeColor()
                        this.setMachineState(this.Idle)
                    }
                    //不处理点击事件
                },
                changeToIdle(){
                    this.setMachineState(this.Idle)
                }
            },
            'ChangingManual': { //切换页面状态
                onEnter() {
                    this.ChangingManual.manualChange.call(this, that.dx)
                },
                manualChange(dx = that.dx) { //手动切换页面
                    if(that.slideTimer)
                        return 
                    // console.log('changing dx:'+dx)
                    if (dx < 0) {//左滑
                        if(that.infinite)
                            that.n == 0 ? that.n :that.n--
                        else
                            that.n > 0 ? that.n-- : that.n
                    } else if (dx > 0) {//右滑
                        if(that.infinite)
                            that.n == that.fakeLen-1 ? that.n : that.n++
                        else
                            that.n < that.len - 1 ? that.n++ : that.n
                    } else {
                        return this.setMachineState(this.Idle)
                    }
                    that.list.style.transform = `${that.attr}(${-that.pWidth * that.n}px)`
                    //小图标变色
                    that.dx && that.tags.length && that.changeColor()
                    this.setMachineState(this.Idle)

                },
                changeToIdle(){
                    this.setMachineState(this.Idle)

                }
            }
        })
        //去吧皮卡丘！！！
        this.init();
    }
    init() {
        //监听transitionend事件
        this.addTransitionendListener()
        if (!this.touch) { //如果不允许拖动
            this.auto && this.state.autoPlay()
            return;
        }
        // debugger
        this.transitionChange(true)

        //touchmove事件监听
        this.list.addEventListener('touchstart', e=>{
            this.state.touchMove()
            this.state.touchStart.call(this, e)
        })
        this.list.addEventListener('touchmove', e => {
            this.state.touchMoving(e)
        })
        this.list.addEventListener('touchend', e => {
            this.state.touchEnd(e)
        })
        this.auto && this.state.autoPlay();
    }
    addTransitionendListener(){
        //浏览器兼容
        let arr = ['transitionend','webkitTransitionEnd','mozTransitionEnd','oTransitionEnd']
        arr.forEach(item=>{
            this.list.addEventListener(item, ()=>{
                if(this.fakeLen-1 === this.n){
                    this.transitionChange(false);
                    // that.list.style[that.attr] = '0px'
                    this.list.style.transform = `${this.attr}(${this.origin}px)`

                    this.n = this.infinite ? 1 : 0;
                    setTimeout(()=>{
                        this.transitionChange(true)
                        this.state.changeToIdle()

                    },10)
                }
                //判断是否infinite&&在第一和最后一张，迅速切换
                if(this.infinite && (this.n<1 || this.n==this.fakeLen-1)){
                    this.transitionChange(false)
                    this.n<1 ? this.n = this.len : this.n = 1
                    this.list.style.transform = `${this.attr}(${-this.pWidth * this.n}px)`

                    setTimeout(()=>{
                        this.transitionChange(true)
                        this.state.changeToIdle()
                    },50)
                }
            })
        })
    }
    autoCreate(infinite = this.infinite) { //拷贝列表
        if (this.createNode){
            return;
        }
        this.setAttr('fake')
        let len = this.list.children.length
        const firstNode = this.list.children[len-1].cloneNode(true)
        const lastNode = this.list.children[0].cloneNode(true)
        this.list.appendChild(lastNode);
        if(infinite){
            this.list.insertBefore(firstNode, this.list.children[0])
        }
        this.createNode = true;
    }
    setAttr() { //设置style属性
        let str = this.infinite ? this.fakeLen : this.len;
        this.container.setAttribute('style', `
        position:relative;
        overflow:hidden;
        `)
        this.list.setAttribute('style', `
            display: flex;
            flex-wrap: no-wrap;
            -webkit-overflow-scrolling: touch;
            transform: ${this.attr}(${this.origin}px);
            transition-property: none;
            transition-duration: .25s;
            transition-timing-function: ease;
            ${this.direction == 'h' ? `display: flex;
            flex-wrap: no-wrap;` : ''}
            -webkit-backface-visibility: hidden;
            -webkit-perspective: 1000;
            ${this.direction === 'h' ? 
                'width' : 
                'height'}
                :
            ${this.direction === 'h' ? 
                str+'00%' : 
                str*this.fixedH+'px'}`)
    }
    transitionChange(state = true) { //过渡动画更改
        this.list.style.transitionProperty = state ? 'all' : 'none';
    }
    changeColor() { //小方块换色
        Array.from(this.tags).map((item) => {
            let classname = item.getAttribute('class')
            //删除active class
            classname = classname.replace(`${this.footerName}--active`, '')
            item.setAttribute('class', classname)

        })
        let len = this.tagsLen
        let n
        if(this.infinite){
            n = this.n==this.fakeLen - 1 ? 0 : (this.n==0 ? len-1 : this.n-1)
        }
        else
            n = this.n === this.fakeLen - 1 ? 0 : (this.n === this.fakeLen ? 1 : this.n)
        
        this.tags[n].className += ` ${this.footerName}--active`
    }

}