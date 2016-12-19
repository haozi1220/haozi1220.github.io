


//需要弹框时，直接调用即可
function dialog(options){
	options = options || {};
	var defaults = {
		title:options.title || '这是一个弹框',
		content:options.content || '这是一个弹框,请写内容',
		okFn:options.okFn || function(){},
		cancelFn:options.cancelFn || function(){},
		closeFn:options.closeFn || function(){}
	}
	var dialogObj = {//定义对象和一些函数及绑定事件
		move:function (options){
			options = options || {};
			var defaults = {
				dragObj:options.dragObj,//h3
				moveObj:options.moveObj//整个框
			}
			defaults.dragObj.onmousedown  =function (ev){
				var disX = ev.clientX - defaults.moveObj.offsetLeft;
				var disY = ev.clientY - defaults.moveObj.offsetTop;

				document.onmousemove = function (ev){
					defaults.moveObj.style.left = ev.clientX - disX + "px";
					defaults.moveObj.style.top = ev.clientY - disY + "px";	
				};
				document.onmouseup = function (ev){
					document.onmousemove = document.onmouseup = null;	
				};

			};

		},	
		fullDiv:null,
		html:function (){
			var newDiv = document.createElement("div");

			var html  ='<h3>'
							+'<p class="title">'+defaults.title+'</p>'
							+'<a href="javascript:void(0);" class="close" title="关闭">×</a>'
					  +'</h3>'
					  +'<div class="content">'
						//自定义的内容
					  +'</div>'
					  +'<div class="pop-btns">'
							+'<span class="error"></span>'
							+'<a href="javascript:void(0)" class="confirm">确定</a>'
							+'<a href="javascript:void(0)" class="cancel">取消</a>'
						+'</div>';
						
			newDiv.className = 'full-pop';
			newDiv.innerHTML = html;
			
			
			return newDiv;
		},
		view:function (){
			return {
				W: document.documentElement.clientWidth,
				H: document.documentElement.clientHeight
			}	
		},
		setPosition:function (){
			dialogObj.fullDiv.style.left = (dialogObj.view().W - dialogObj.fullDiv.offsetWidth)/2 + 'px';	
			dialogObj.fullDiv.style.top = (dialogObj.view().H - dialogObj.fullDiv.offsetHeight)/2 + 'px';
		},
		mask : null,//提升为全局
		init:function (){
			var fullDiv = dialogObj.html();//整个框
			document.body.appendChild(fullDiv);
			
			//创建遮罩
			mask = document.createElement("div");
			tools.addClass(mask,"mask");
			mask.style.height = Math.max (document.documentElement.clientHeight,document.body.clientHeight) + "px";
			document.body.appendChild(mask);

			var content = fullDiv.getElementsByClassName("content")[0];//弹框中间的最大容器
			content.innerHTML = defaults.content;

			dialogObj.fullDiv = fullDiv;


			//定位
			dialogObj.setPosition();
			//添加事件处理
			dialogObj.addEvent();

			var h3 = fullDiv.getElementsByTagName("h3")[0];
			//做拖拽的
			dialogObj.move({//调用传入实参
				dragObj:h3,
				moveObj:fullDiv
			})


		},
		addEvent:function (){
			window.addEventListener("resize",dialogObj.setPosition,false);

			//关闭
			var closes = dialogObj.fullDiv.getElementsByClassName("close")[0];
			closes.onclick = function (){
				document.body.removeChild(dialogObj.fullDiv);
				document.body.removeChild(mask);
				//回调,用来把删除的开关改为false
				defaults.closeFn();
			};
			
			
			//取消
			var cancel = dialogObj.fullDiv.getElementsByClassName("cancel")[0];
			cancel.onclick = function (){
				document.body.removeChild(dialogObj.fullDiv);
				document.body.removeChild(mask);
				//回调，用来把删除的开关改为false,此时点击取消按钮的时候，相当于点击document，走doc中else里去掉newBox的的样式
				defaults.cancelFn();
			};			
						
						
			//确定
			var confirm = dialogObj.fullDiv.getElementsByClassName("confirm")[0];
			confirm.onclick = function (ev){
				var bl = defaults.okFn();//既调用okFn,又把okFn的返回值存在bl中
				//true 不允许删除false 允许删除
				if( !bl ){
					document.body.removeChild(dialogObj.fullDiv);
					document.body.removeChild(mask);
				}
				
				ev.stopPropagation()//阻止冒泡，点击confirm时相当于点击doc
			};
			
			confirm.onmousedown = function (ev){
				ev.stopPropagation()//阻止冒泡，点击confirm时相当于点击doc
			}

		}

	}

	//初始化
	dialogObj.init();//调用行65	
}