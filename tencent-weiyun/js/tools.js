

var tools = (function(){
	var toolsObj = {
		$:function(selector,context){
			/*
				selector有可能等于：#id /.class /li / .class li / #id li
				通过审查字符串，返回不同的值
				
			*/
			/*||的时候想下电路图
					context为真(存在)，就能走通，就为真，直接返回
			 		context为假(不存在)，要看document是啥，所以返回document
			*/
			context = context || document;
			if(selector.indexOf(" ") !== -1 ){//说明css选择器存在
				return context.querySelectorAll(selector);//获取的是一个类数组
			}else if (selector.charAt(0) === "#"){
				return document.getElementById(selector.slice(1));
			}else if (selector.charAt(0) === "."){
				return context.getElementsByClassName(selector.slice(1));
			}else{
				return context.getElementsByTagName(selector);
			}
		},
		getStyle:function(obj, attr){
			if(obj.currentStyle) {
				return obj.currentStyle[attr];
			} else {
				return getComputedStyle(obj)[attr];
			}
		},
		getRect:function (obj){
			return obj.getBoundingClientRect();
		},
		view:function (){
			return {
				W:document.documentElement.clientWidth,
				H:document.documentElement.clientHeight
			}	
		},
		addEvent:function(obj,evName,fnName){
			obj.addEventListener(evName,fnName,false);
		},
		removeEvent:function(obj,evName,fnName){
			obj.removeEventListener(evName,fnName,false);
		},
		duang:function(obj1,obj2){
			var obj1Info = tools.getRect(obj1);	
			var obj2Info = tools.getRect(obj2);	
		
			//obj1的上下左右
		
			var obj1L = obj1Info.left;
			var obj1R = obj1Info.right;
			var obj1T = obj1Info.top;
			var obj1B = obj1Info.bottom;
		
			//obj2的上下左右
			var obj2L = obj2Info.left;
			var obj2R = obj2Info.right;
			var obj2T = obj2Info.top;
			var obj2B = obj2Info.bottom;
		
			//排除掉没碰上的区域
		
			if( obj1R < obj2L || obj1L > obj2R || obj1B < obj2T || obj1T > obj2B){
				return false;
			}else{
				return true;
			}
		},
		MTween:function (obj,attrObj,duration,fx,callBack){
			var newObj = {}
			for( var attr in attrObj ){
				newObj[attr] = {};
			}
			for( var attr in attrObj ){
				newObj[attr].b = parseFloat(getComputedStyle(obj)[attr]);
				newObj[attr].c = attrObj[attr] - newObj[attr].b;
			}
			var current = new Date().getTime();
			var d = duration;
			fx = fx || "linear";
			clearInterval(obj.timer);
			obj.timer = setInterval(function (){
				var t = new Date().getTime() - current;
				if( t >= d ){
					clearInterval(obj.timer);
					obj.timer = null;
					t = d;	
				}
		
				for( var attr in attrObj ){
					var value = Tween[fx](t, newObj[attr].b, newObj[attr].c, d);
					if( attr === "opacity" ){
						obj.style[attr] = value;
					}else{
						obj.style[attr] = value + "px";
					}
				}
				if( t === d ){
					 typeof callBack === "function" && callBack();
				}
		
			},16)
			
			var Tween = {
				linear: function (t, b, c, d){  //匀速
					return c*t/d + b;
				},
				easeIn: function(t, b, c, d){  //加速曲线
					return c*(t/=d)*t + b;
				},
				easeOut: function(t, b, c, d){  //减速曲线
					return -c *(t/=d)*(t-2) + b;
				},
				easeBoth: function(t, b, c, d){  //加速减速曲线
					if ((t/=d/2) < 1) {
						return c/2*t*t + b;
					}
					return -c/2 * ((--t)*(t-2) - 1) + b;
				},
				easeInStrong: function(t, b, c, d){  //加加速曲线
					return c*(t/=d)*t*t*t + b;
				},
				easeOutStrong: function(t, b, c, d){  //减减速曲线
					return -c * ((t=t/d-1)*t*t*t - 1) + b;
				},
				easeBothStrong: function(t, b, c, d){  //加加速减减速曲线
					if ((t/=d/2) < 1) {
						return c/2*t*t*t*t + b;
					}
					return -c/2 * ((t-=2)*t*t*t - 2) + b;
				},
				elasticIn: function(t, b, c, d, a, p){  //正弦衰减曲线（弹动渐入）
					if (t === 0) { 
						return b; 
					}
					if ( (t /= d) == 1 ) {
						return b+c; 
					}
					if (!p) {
						p=d*0.3; 
					}
					if (!a || a < Math.abs(c)) {
						a = c; 
						var s = p/4;
					} else {
						var s = p/(2*Math.PI) * Math.asin (c/a);
					}
					return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
				},
				elasticOut: function(t, b, c, d, a, p){    //正弦增强曲线（弹动渐出）
					if (t === 0) {
						return b;
					}
					if ( (t /= d) == 1 ) {
						return b+c;
					}
					if (!p) {
						p=d*0.3;
					}
					if (!a || a < Math.abs(c)) {
						a = c;
						var s = p / 4;
					} else {
						var s = p/(2*Math.PI) * Math.asin (c/a);
					}
					return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
				},    
				elasticBoth: function(t, b, c, d, a, p){
					if (t === 0) {
						return b;
					}
					if ( (t /= d/2) == 2 ) {
						return b+c;
					}
					if (!p) {
						p = d*(0.3*1.5);
					}
					if ( !a || a < Math.abs(c) ) {
						a = c; 
						var s = p/4;
					}
					else {
						var s = p/(2*Math.PI) * Math.asin (c/a);
					}
					if (t < 1) {
						return - 0.5*(a*Math.pow(2,10*(t-=1)) * 
								Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
					}
					return a*Math.pow(2,-10*(t-=1)) * 
							Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
				},
				backIn: function(t, b, c, d, s){     //回退加速（回退渐入）
					if (typeof s == 'undefined') {
					   s = 1.70158;
					}
					return c*(t/=d)*t*((s+1)*t - s) + b;
				},
				backOut: function(t, b, c, d, s){
					if (typeof s == 'undefined') {
						s = 3.70158;  //回缩的距离
					}
					return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
				}, 
				backBoth: function(t, b, c, d, s){
					if (typeof s == 'undefined') {
						s = 1.70158; 
					}
					if ((t /= d/2 ) < 1) {
						return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
					}
					return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
				},
				bounceIn: function(t, b, c, d){    //弹球减振（弹球渐出）
					return c - Tween['bounceOut'](d-t, 0, c, d) + b;
				},       
				bounceOut: function(t, b, c, d){
					if ((t/=d) < (1/2.75)) {
						return c*(7.5625*t*t) + b;
					} else if (t < (2/2.75)) {
						return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
					} else if (t < (2.5/2.75)) {
						return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
					}
					return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
				},      
				bounceBoth: function(t, b, c, d){
					if (t < d/2) {
						return Tween['bounceIn'](t*2, 0, c, d) * 0.5 + b;
					}
					return Tween['bounceOut'](t*2-d, 0, c, d) * 0.5 + c*0.5 + b;
				}
			}
				
		},
		//给元素添加类名，先判断元素身上是否有这个类名，只有在没有的情况下，才添加
		addClass:function (element,clsNames){
			if( typeof clsNames === "string" ){
				if(!tools.hasClass(element,clsNames)){
					element.className += " "+clsNames;
				}
			}
		},
	//把元素身上某个类名删除掉，判断元素身上是否有这个类名，如果有才删除.比如elment身上的className = "a b c d" 想删除b这个类名
		removeClass:function (element,clsNames){
			var classNameArr = element.className.split(" ");//classNameArr=["a","b","c","d"]
			for( var i = 0; i < classNameArr.length; i++ ){
				if( classNameArr[i] === clsNames ){
					classNameArr.splice(i,1);
					i--;//数组少了一个对象，i要减1，i在0和-1之间不断取值，循环每次都删除数组的第一个元素，这样就不会落掉
				}
			}
			//for循环之后
			element.className = classNameArr.join(" ");//最终element的className = "a c d"
		},
		//判断一个函数身上是否有某个类名，用法是返回值为true说没有，false说明没有
		hasClass:function(ele,classNames){
			var classNameArr = ele.className.split(" ");//把ele的className用空字符串分割成一个数组
			for( var i = 0; i < classNameArr.length; i++ ){//循环这个数组
				if( classNameArr[i] === classNames ){
					return true;
				}
			}
			return false;
		},
		//开关class,元素身上有这个类名就删除，没有就加上(有两个用处)
		toggleClass:function (ele,classNames){
			if( tools.hasClass(ele,classNames) ){
				tools.removeClass(ele,classNames);
				return false;
			}else{
				tools.addClass(ele,classNames);
				return true;
			}
		},
		//作用是找到元素身上有selector这个选择器的祖先节点(元素身上的祖先节点很多，最高的是document))
		//&&，前后都是真，结果才为真，有一个是false,结果就是false,用到&&，返回值是布尔值
		parents:function (element,selector){
			var first = selector.charAt();
			if( first === "#" ){
				selector = selector.slice(1); 
				//while循环是当()中条件成立，就循环，条件不成立，循环结束,当前元素不为document且当前元素身上的id不为selector(去掉#后的，此时元素是原来元素的父级，继续循环，直到找到，此时1.element就是身上有selector的某个祖先节点。当ele为document，&&前面是false，直接跳出循环，走到return里，return里如果是doc，返回null  2.此时ele不是document,但是元素身上有id，说明找到了,&&后边是false，直接跳出for循环，走return,此时ele不是doc，所以返回ele 3.&&前和后都是false，程序不会允许这两个都是false才跳出循环，只要&&前面是false，就立刻跳出循环)
				while(element.nodeType != 9 && element.id != selector){  //当前这个元素的id不为box
					element = element.parentNode;
				}
			}else if(first === "."){
				selector = selector.slice(1); 
				while(element.nodeType != 9 && !tools.hasClass(element,selector)){//当前这个元素的className不为box
					element = element.parentNode;
				}
			}else {
				while(element.nodeType != 9 && element.nodeName.toLowerCase() != selector){  //当前这个元素的标签不为box
					element = element.parentNode;
				}
			}
			//总结:找到了就找到了这个父级,找不到就返回document(其实是null)
			return element.nodeType === 9 ? null : element;
		},
		//
		getTreeById:function (classNams,id,parents){
		   var classElement = tools.$("."+classNams,parents);//从父级parent下获取类名为classNams的元素组成的数组
		   for( var i = 0; i < classElement.length; i++ ){//循环这个数组
		     if( classElement[i].dataset.fileId == id ){
		        return  classElement[i];//找到了，就返回这个对象
		     }
		   }
		   return null;//找不到就返回null
		},
		uuid:function (){
			return new Date().getTime();//随便获取一个数
		},
		alert:function(obj){
			tools.MTween(obj,{top:0},200,"linear",function(){
				setTimeout(function(){
					tools.MTween(obj,{top:-32},400,"linear");
				},1200)
			});
		},
		indexOf: function(arr,item){
	        for( var i = 0; i < arr.length; i++ ){
	            if( arr[i] === item ){
	            return true;
	            }
	        }  
	
	        return false;
	    }
		
	}
	//不要忘记return
	return toolsObj;
}())


















/*
	MTween 作用，做运动
		参数说明：
			1. obj 要运动的元素
			2. attr 要运动属性
			3. duration 持续时间
			4. target 目标值
			5. fx     运动形式
			6. callBack 可选参数 回调函数 是在运动完成之后执行
*/



/*
* t : time 已过时间
* b : begin 起始值
* c : count 总的运动值
* d : duration 持续时间
* */

//http://www.cnblogs.com/bluedream2009/archive/2010/06/19/1760909.html

//Tween.linear();



