/**
 * 3dCraw
 */
var Craw3DHelper=(function () {

    /*鼠标响应处理对象*/
    var MouseHandler=function (handlerContext,wrapContainer) {
        this.wrapContainer=wrapContainer;
        this.handlerContext=handlerContext;
    };

    MouseHandler.prototype={
        constructor:MouseHandler,
        /*记录当前位置*/
        current:{x:0,y:0},
        /*记录前一个位置*/
        last:{x:0,y:0},
        /*记录位置差*/
        minus:{x:0,y:0},
        /*旋转值对象*/
        rotate:{x:-10,y:0},
        timer:0,
        /*标志是否已经启动*/
        started:false,
        /*当前事件处理方法的开关标志*/
        handlerStatus:{move:0,up:0,down:1},
        enableMouse:function(){
            this.handlerStatus.down=1;
        },
        disableMouse:function(){
            this.handlerStatus.down=0;
        },
        start:function () {
            if(this.started){
                /*已经开始过的直接重置参数即可*/
                this.wrapContainer.style.transform='none';
                this.timer&&clearTimeout(this.timer);
                this.current={x:0,y:0};
                this.last={x:0,y:0};
                this.minus={x:0,y:0};
                this.rotate={x:0,y:0};
                this.handlerStatus.move=0;
                this.handlerStatus.up=0;
                return;
            }

            /*绑定按下->移动->抬起模拟拖动事件的流程控制*/

            /*按下*/
            this.handlerContext.addEventListener("mousedown",(e)=>{

                if(!this.handlerStatus.down){
                    return;
                }

                /*鼠标按下的时候，给前一点坐标赋值，为了避免第一次相减的时候出错*/
                this.last.x=e.clientX;
                this.last.y=e.clientY;
                /*开启动作响应标志，开启新一轮拖动响应*/
                this.handlerStatus.move=true;
                this.handlerStatus.up=true;

                e.preventDefault();
                /*// e.stopPropagation();*/
            });

            /*移动*/
            this.handlerContext.addEventListener("mousemove",(e)=>{

                if(!this.handlerStatus.move){
                    return;
                }

                this.timer&&clearTimeout(this.timer);

                /* clientX 鼠标距离页面左边的距离*/
                this.current.x=e.clientX;
                /* clientY 鼠标距离页面顶部的距离*/
                this.current.y=e.clientY;

                /*计算偏移*/

                this.minus.x=this.current.x-this.last.x;
                this.minus.y=this.current.y-this.last.y;

                /*计算转角 更新wrap的旋转角度，拖拽越快-> minus变化大 -> roY变化大 -> 旋转快*/

                /*绕Y轴转补齐X轴的差距*/
                this.rotate.y+=this.minus.x*0.2;
                /*绕X轴转补齐Y轴的差距*/
                this.rotate.x-=this.minus.y*0.1;

                /*更新样式*/

                this.wrapContainer.style.transform='rotateX('+ this.rotate.x +'deg) rotateY('+ this.rotate.y +'deg)';

                /*更新前一个位置数据*/

                this.last.x=this.current.x;
                this.last.y=this.current.y;
            });

            /*抬起*/
            this.handlerContext.addEventListener("mouseup",()=>{
                if(!this.handlerStatus.up){
                    return;
                }
                /*mouseup时标志着一次拖动已经要完成，关闭事件响应标志*/
                this.handlerStatus.move=false;
                this.handlerStatus.up=false;

                /*使用setTimeout代替setInterval来避免interval方法的跳帧问题*/

                let timeHandler=()=>{
                    this.minus.x*=0.95;
                    this.minus.y*=0.95;

                    this.rotate.y+=this.minus.x*0.2;
                    this.rotate.x-=this.minus.y*0.1;

                    /*容器旋转结束点*/
                    if(Math.abs(this.minus.x)<0.1 && Math.abs(this.minus.y)<0.1){
                        clearTimeout(this.timer);
                    }

                    this.wrapContainer.style.transform='rotateX('+ this.rotate.x +'deg) rotateY('+ this.rotate.y +'deg)';

                };

                let timeRunning=()=>{
                    setTimeout(()=>{
                        timeHandler();
                        this.timer=setTimeout(timeHandler,15);
                    },15);
                };

                timeRunning();
            });

            this.started=true;
        }
    };

    var Craw3D=function (id,options) {
       this.wrapContainer=document.querySelector(id);
       /*绑定鼠标处理对象*/
       this.mouseHandler=new MouseHandler(options.handlerContext|| document,this.wrapContainer);
       var ots= this.options=options||{};
        /*容器上偏移大小*/
       ots.top=ots.top||180;
        /*中心半径方向偏移大小*/
       ots.radius=ots.radius||'350';
       ots.speed=ots.speed||100;

       this.init();
    };

    Craw3D.TEMPLATES={
        box3d:'<div class="wrap-item-back box-reflect"></div>\
            <div class="wrap-item-left"></div>\
            <div class="wrap-item-right"></div>\
            <div class="wrap-item-top"></div>\
            <div class="wrap-item-bottom"></div>'
    };

    Craw3D.prototype={
        constructor:Craw3D,
        ready:false,
        init:function () {
            if(this.ready){
                return;
            }
            var items= this.wrapItems = this.wrapContainer.querySelectorAll(".wrap-item");
            /*子项数*/
            var itemsLength = items.length;
            /*分布角度*/
            var Deg = 360 / itemsLength;

            var itemIndex=0;

            var transformOptions=' rotateX(-5deg) translateZ('+this.options.radius+'px)';

            /* 初始化分散布局所有项*/
            for (; itemIndex < itemsLength; itemIndex++) {
                items[itemIndex].style.transform='rotateY('+(itemIndex*Deg)+'deg)'+transformOptions;
                items[itemIndex].style.transition = 'transform 1s '+ ((itemsLength-1-itemIndex)*this.options.speed) +'ms';
            }

            /*调整整体位置*/
            this.rePosition();

            var $this=this;
            var oResize=window.onresize;
            /*浏览器窗口变化时重置位置*/
            window.onresize=function () {
                oResize&&oResize();
                $this.rePosition();
            };

            this.mouseHandler.start();

            this.ready=true;
        },
        rePosition:function () {
            /*当前客户界面高度。*/
            var wH = document.documentElement.clientHeight;
            this.wrapContainer.style.marginTop = (wH / 2 - this.options.top) + 'px';
            /*重启事件参数*/
            this.mouseHandler.start();
        },
        reInit:function () {
            this.ready=false;
            this.init();
        }
    };

    var helper= function (id,options) {
        return new Craw3D(id,options);
    };

    helper.builder=Craw3D;

    return helper;
}());
