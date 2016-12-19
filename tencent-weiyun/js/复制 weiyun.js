//整个js先用一个匿名函数包上，匿名函数自调用，保护函数内的代码
(function(){
	
//---------------------第一步：处理一下main自适应高度的问题-----------------------------------------
var main = tools.$("#main");
var headWrap = tools.$("#head_warp");

//封装一个函数，页面刚加载的时候直接调用，window.onresize的时候事件调用
function changeMainHeight(){
	var clientH = tools.view().H;//获取可视区域的高
	main.style.height = clientH - headWrap.offsetHeight + "px";//设置main的高度
}
//1-1 设置页面加载完成时默认的高度=可视区域的高-头部的高度(包括边框)
changeMainHeight();

//1-2 当浏览器改变尺寸的时候，main的高度要随着浏览器的高度改变
tools.addEvent( window,"resize",changeMainHeight);



//---------------第二步：渲染页面加载时的默认结构(包括文件区域/导航区域/菜单区域)------------------------------
//获取数据
var dataList = data.files;

//----------2-1 渲染文件初始化区域(默认显示4个文件夹，id=0)------
var fileBox = tools.$(".fileBox")[0];//获取文件区域的容器
//封装一个函数，每次只传入newBox元素，通过for循环生成一个str，然后赋给fileBox.innerHTML
function createFileHtml(data,id){
	var childs = handleData.getChildsById(data,id);
	var html = "";
	for (var i = 0; i < childs.length; i++) {
		html += template.createFileConstruction( childs[i] );//见template.js
	}
	return html
}
fileBox.innerHTML = createFileHtml(dataList,0);





//---------------2-2 渲染导航初始化区域(默认只有微云，微云的id=0)----
var pathNav = tools.$(".path_nav")[0];//获取导航容器
//封装一个函数，最后一个是span,前几个都是a(层级递减)
pathNav.innerHTML = template.createPathNavConstruction(dataList,0);//见template.js


//--------------2-3 渲染菜单初始化区域(最初显示微云，微云的父级id=-1,且三角形是折叠状态)----
var menu = tools.$(".menu")[0];
menu.innerHTML =  template.createTreeHtml(dataList,-1);//见template.js

//初始化默认微云身上有class = "tree_click showIco"
var prevId = 0; //微云的id=0
var menu = tools.$(".menu")[0];//菜单区域的最大父级
var fistrTree = tools.getTreeById("tree_title",prevId,menu)//通过匹配获取到微云
tools.addClass(fistrTree,"tree_click showIco");//给微云加上默认样式，tree_click负责加上背景和边框，showIco是让里面的三角形变成展开的


//----------------------------------渲染点击之后重新生成的文件/导航/菜单区域----
function afterEventCreateHtml(fileId){
	//点击哪个文件，就把它的id传入，createFileHtml根据传入的id找到第一层子节点，渲染结构
	fileBox.innerHTML = createFileHtml(dataList,fileId);
	icoBoxAddEvent();//给所有新生成的newBox里的span添加点击事件，不用给新生成的newBox添加移入移出事件，因为委托给fileBox了，只要在fileBox里的newBox，身上都有移入移出事件。
	
	//点击哪个文件，就把它的id传入，createPathNavConstruction根据传入的id，找到所有的祖先节点(包括自己)，渲染结构
	pathNav.innerHTML = template.createPathNavConstruction(dataList,fileId);
	
	
	var prevTree = tools.getTreeById("tree_title",prevId,menu);//获取上一个div
	var curTree = tools.getTreeById("tree_title",fileId,menu);//获取fileId对应的div
	//var curTreeChilds = handleData.getChildsById(dataList,fileId);//获取当前div的子节点
	
	tools.removeClass(prevTree,"tree_click");//上一个div的背景去掉
	//tools.removeClass(prevTree,"showIco");
	
	tools.addClass(curTree,"tree_click showIco");//给当前这个div加上背景，三角形展开
	
	var nextUl = curTree.nextElementSibling;
	
	if(nextUl){
		nextUl.style.display = "block";//下面的ul展开
	}
	
	
	/*if(curTreeChilds){//如果当前的div有子节点，让子节点显示出来，同时子节点的三角形是折叠的
		tools.addClass(curTreeChilds,"show foldIco");
	}*/
	//当前这个div里的三角形变成展开状态
	prevId = fileId;//给prevId重新赋值，也可以说记录下当前的fileIds
	
}



//-----------------------------------功能区域---------------------------------------

//封装一个数组，如果span打勾了，就把对应的newBox放到数组中，，这个函数不纯，只能放这里
var icoBoxs = tools.$(".icoBox");//获取所有的span
function whoSelect(){
var arr = [];
for( var i = 0; i < icoBoxs.length; i++ ){
    if( tools.hasClass( icoBoxs[i],"icoBoxChecked") ){
        arr.push(tools.parents(icoBoxs[i],".newBox") );//push的是newBox
    }
}
return arr;
}


//---------------newBox移入移出，加给父级fileBox身上，但是类名都在newBox身上加减-----------------
var newBoxs = tools.$(".newBox");//所有的newBox
var fileBox = tools.$(".fileBox")[0];//获取fileBox

//利用事件委托，把移入事件加给整个父级fileBox，但是类名却加在newBox身上
//doc身上没有移入移出事件，所以不用冒泡
tools.addEvent(fileBox,"mouseover",function(ev){
	var target = ev.target;//移入时获取事件源
	//如果事件源的某个身上有类名为fileBox的父级存在，那么就把移入事件添加在它身上
	if(tools.parents(target,".newBox")){
		target = tools.parents(target,".newBox");
		tools.addClass(target,"newBoxChecked");
	}
});
//利用事件委托，把移入事件加给整个父级fileBox，但是类名却从newBox身上删除
tools.addEvent(fileBox,"mouseout",function(ev){
	var target = ev.target;//移入时获取事件源
	//如果事件源的某个身上有类名为fileBox的父级存在，那么就把移入事件添加在它身上
	if(tools.parents(target,".newBox")){
		target = tools.parents(target,".newBox");//事件源变成newBox
		var curIcoBox = tools.$(".icoBox",target)[0];//获取当前事件源下的span
		//console.log(curIcoBox)
		if( !tools.hasClass(curIcoBox,"icoBoxChecked") ){//如果勾选了，移出时删除fileBoxChecked
			tools.removeClass(target,"newBoxChecked");
		}
	}
});

//--------------------------span单选--------------------------------  
var checkedAll = tools.$(".checkedAll")[0];//全选按钮

//icoBoxs在55行已获取
function icoBoxAddEvent(){//封装一个给所有的icoBox添加点击事件的函数
	for (var i = 0; i < icoBoxs.length; i++) {
		icoBoxClick(icoBoxs[i]);
	}
}
function icoBoxClick(obj){//这只是给一个icoBox添加点击事件的函数，想给单独某个添加，调用这个就可以
	tools.addEvent(obj,"click",function(ev){
		var hadClick = tools.toggleClass(this,"icoBoxChecked");//返回true说明之前没有，现在用toggle加上了
		if(hadClick){//为true，说明打勾了，看下打勾的数量
			//注意此处不能用selectArr，因为这个变量存的是页面刚加载时的值，现在要实时调用才能获取最新的值
			//console.log(whoSelect().length , icoBoxs.length)
			if( whoSelect().length === icoBoxs.length ){
				tools.addClass(checkedAll,"checkedAllChecked");//全选勾上
			}
		}else{
			tools.removeClass(checkedAll,"checkedAllChecked");//全选不勾上
		}
		ev.stopPropagation();//阻止click冒泡
	});
	tools.addEvent(obj,"mousedown",function(ev){
		ev.stopPropagation();//阻止obj身上的down事件冒泡
	});
	
};

icoBoxAddEvent();


//-------------------------------------点击全选------------------------------------------------

tools.addEvent(checkedAll,"click",function(){
	var hasClas = tools.toggleClass(checkedAll,"checkedAllChecked");//看经过toggle之后全选是否勾选
	if(hasClas){//如果有，说明全选勾选上了，此时下面所有的文件都要有样式且icoBox勾选上
		for (var i = 0; i < newBoxs.length; i++) {
			tools.addClass(newBoxs[i],"newBoxChecked");
			tools.addClass(icoBoxs[i],"icoBoxChecked");
		}
	}else{
		for (var i = 0; i < newBoxs.length; i++) {
			tools.removeClass(newBoxs[i],"newBoxChecked");
			tools.removeClass(icoBoxs[i],"icoBoxChecked");
		}
	}
	
})

tools.addEvent(checkedAll,"mousedown",function(ev){
	ev.stopPropagation();//阻止down冒泡
})

//------------------------------给文件/导航/菜单区域添加事件处理函数------------------------------------
//封装提示框函数                                         不太懂待研究
var fullTipBox = tools.$(".full-tip-box")[0];//最大的父级
var fullText = tools.$(".text",fullTipBox)[0];//显示编辑内容的元素

function fullTip(classNames,message){
    //先瞬间拉回到-32，在运动到0
    fullTipBox.style.transition = "none";
    fullTipBox.style.top = "-32px";
    
    setTimeout(function (){
       tools.addClass(fullTipBox,classNames);
        fullTipBox.style.transition = ".3s";
        fullTipBox.style.top = 0;     
    },0);

    fullText.innerHTML = message;
    clearTimeout(fullTipBox.timer);
    fullTipBox.timer = setTimeout(function (){
        fullTipBox.style.top = "-32px";   
    },2000);
}




//点击文件区域(给每个newBox添加点击处理函数，委托给fileBox)
tools.addEvent(fileBox,"click",function(ev){
	var target = ev.target;
	if(tools.parents(target,".newBox") ){
		target = tools.parents(target,".newBox");
		var fileId = target.dataset.fileId;
		afterEventCreateHtml(fileId);//重新渲染文件/导航区域/菜单区域背景换成当前点击的fileId对应的div
		
		//一旦点击，全选按钮不能勾选
		tools.removeClass(checkedAll,"checkedAllChecked");
		
		remindBlankFile();
	}
})
//----------------------------------------鼠标右键点击newBox文件时-----------------------------------
var rightBox = null;
tools.addEvent(fileBox,"contextmenu",function(ev){
	fileBox.isContextmenu = true;
	
	rightBox = null;
	ev.preventDefault();//阻止浏览器默认行为(鼠标右键默认出现菜单)
	var target = ev.target;
	if(tools.parents(target,".newBox") ){
		target = tools.parents(target,".newBox");
		tools.addClass(target,"newBoxChecked");
		var span = tools.$(".icoBox",target)[0];
		tools.addClass(span,"icoBoxChecked");
		
		//新建一个右键菜单
		rightBox = document.createElement("div");
		tools.addClass(rightBox,"rightBox");
		
		rightBox.style.left = ev.clientX + "px";
		
		rightBox.style.top = ev.clientY + "px";
		
		rightBox.style.zIndex = 2000000;
		
		rightBox.innerHTML = template.createRightBox();
		
		document.body.appendChild(rightBox);
		
		fileBox.isContextmenu = false;
		
		var links =tools.$(".link",rightBox);
		for (var i = 0; i < links.length; i++){
			
			tools.addEvent(links[i],"click",function(ev){
				if( tools.hasClass(this,"DL") ){
					dele();//程序触发删除点击事件
				}else if( tools.hasClass(this,"MT") ){
					 move();//程序触发移动点击事件
				}else if( tools.hasClass(this,"RC") ){
					rech();//程序触发重命名点击事件
				}
				
				document.body.removeChild(rightBox);//移出弹框
				ev.stopPropagation();//阻止冒泡
				
			});
			
			tools.addEvent(links[i],"mousedown",function(ev){
				ev.stopPropagation();//阻止冒泡
				
			});
			
		}
		
	}
})



//点击导航栏区域
tools.addEvent(pathNav,"click",function(ev){
	var target = ev.target;
	if(tools.parents(target,"a") ){
		target = tools.parents(target,"a");
		var fileId = target.dataset.fileId;
		afterEventCreateHtml(fileId);//重新渲染文件/导航区域/菜单区域背景换成当前点击的fileId对应的div
		
		//一旦点击，全选按钮不能勾选
		tools.removeClass(checkedAll,"checkedAllChecked");
	}
})

//点击菜单区域div
tools.addEvent(menu,"click",function(ev){
	var target = ev.target;
	if(tools.parents(target,".tree_title") ){//如果点击的是div
		target = tools.parents(target,".tree_title");
		var nextUl = target.nextElementSibling;
		
		if( tools.hasClass(target,"foldIco") ){
			tools.addClass(target,"showIco");//变成展开
			tools.removeClass(target,"foldIco");
			nextUl.style.display = "block";
		}
		var fileId = target.dataset.fileId;
		afterEventCreateHtml(fileId);//重新渲染文件/导航区域/菜单区域背景换成当前点击的fileId对应的div
		
		//一旦点击，全选按钮不能勾选
		tools.removeClass(checkedAll,"checkedAllChecked");
	}
})

var ico = tools.$(".ico",menu);//获取所有的ico
allIcoClick();
//给所有的ico添加点击事件
function allIcoClick(){
	var ico = tools.$(".ico",menu);//获取所有的ico
	for (var i = 0; i < ico.length; i++) {
		aloneIcoClick( ico[i] );
	}
}

//给单独某个ico添加点击事件
function aloneIcoClick(ico){
	if( ico ){
		ico.onclick = null;
		ico.onclick = function(ev){
			var tree = this.parentNode.parentNode;//获取div
			var nextUl = tree.nextElementSibling;//ul
			var expend = true;//默认true为折叠的
			
			if( tools.hasClass(tree,"foldIco") ){//如果是折叠的
				
				tools.removeClass(tree,"foldIco");
				tools.addClass(tree,"showIco");//变成展开
				nextUl.style.display = "block";//ul展开
				expend = false;
			}else{//如果是展开的
				
				tools.removeClass(tree,"showIco");
				
				tools.addClass(tree,"foldIco");//变成折叠
				
				nextUl.style.display = "none";//ul隐藏
				expend = true;
			}
			
			ev.stopPropagation();//阻止冒泡
		}
		//tools.addEvent(ico,"click",foldShow);
		
		/*tools.removeEventico,"click",foldShow);
		function foldShow(ev){
			var tree = this.parentNode.parentNode;//获取div
			var nextUl = tree.nextElementSibling;//ul
			var expend = true;//默认true为折叠的
			
			if( tools.hasClass(tree,"foldIco") ){//如果是折叠的
				console.log(tree)
				tools.removeClass(tree,"foldIco");
				tools.addClass(tree,"showIco");//变成展开
				nextUl.style.display = "block";//ul展开
				expend = false;
			}else{//如果是展开的
				console.log(tree)
				tools.removeClass(tree,"showIco");
				console.log(tree)
				tools.addClass(tree,"foldIco");//变成折叠
				console.log(tree)
				nextUl.style.display = "none";//ul隐藏
				expend = true;
			}
			
			ev.stopPropagation();//阻止冒泡
		}*/
	}
}


//让微云三角形展开，微云的第一级子节点展开
var wyIco = ico[0];
var tree = wyIco.parentNode.parentNode;//div
var nextUl = tree.nextElementSibling;//ul
//默认微云的三角形是展开的
tools.addClass(tree,"showIco");
tools.removeClass(tree,"foldIco");
//默认微云的ul是展开的
nextUl.style.display = "block";



//------------------点击新建,先走document.down，再走create.click--------------------------------------
var create = tools.$(".create")[0];//获取新建按钮

tools.addEvent(create,"click",function(){ 
//点击新建按钮的时候，先走document的down事件，doc.down的作用是：失去焦点时判断名称是否为空，是否重名，以上两种情况都不成立，说明新建成功，此时要把数据push到dataList中。。。。。看下面吧。

	if(create.isCreate){
		return;//点击新建的时候，如果此时为新建状态，就return，防止两个编辑状态的文件夹同时存在
	}
	create.isCreate = true;//true代表正在新建中。。。这里并没有在全局定义开关，在doc.down中最初开关为undefined
	
	//页面中有一个闪烁光标的文件夹出现，要先添加结构，我们才能看到,向函数中传一个对象，这个对象，设置好id的值
	
	var str = template.createFileConstruction( {id:tools.uuid()} );
	fileBox.innerHTML = str + fileBox.innerHTML;//不能用+=，那样新建的就放到后边去了，此时第一个元素创建成功了
	
	//获取此时编辑状态的文件夹中的input和p，input显示且有光标，p隐藏
	var firstChild = fileBox.firstElementChild;//正在新建的newBox
	var pTitle =tools.$("p",firstChild)[0];//p
	var inputText =tools.$("input",firstChild)[0];//input
	
	tools.addClass(pTitle,"hide");
	tools.removeClass(pTitle,"show");
	
	tools.addClass(inputText,"show");
	tools.removeClass(inputText,"hide");
	
	inputText.focus();
	
	//添加input onkeydown事件
	tools.addEvent(inputText,"keydown",function(ev){
		if(ev.keyCode == 13){
			var val = inputText.value;
			if(val === ""){//为空
				//啥也不干
			}else{
				var newBoxId = this.parentNode.dataset.fileId;
				var parentId = tools.$("strong",pathNav)[0].dataset.fileId;
				var val = this.value.trim();
				if( handleData.reNameWithoutSelf(dataList,parentId,val,newBoxId) ){//重名
					fullTip("warn","文件夹名有重复，请重新命名");
				}else{//成功
					pTitle.innerHTML = val;//给p赋值
				
					tools.addClass(pTitle,"show");
					tools.removeClass(pTitle,"hide");
					
					tools.addClass(inputText,"hide");
					tools.removeClass(inputText,"show");
					
					//当前newBox身上和span身上的样式清除
					var newBox = this.parentNode;
					var span = tools.$(".icoBox",newBox)[0];
					tools.removeClass(newBox,"newBoxChecked");
					tools.removeClass(span,"icoBoxChecked");
					
					var firstChild = fileBox.firstElementChild;
					var uuId = firstChild.dataset.fileId;
					//把数据push到总数据中
					var obj = {
						id:uuId,
						pid:parentId,
						title:val,
						type:"file"
					}
					dataList.push(obj);
					
					
		            fullTip("ok","新建文件夹成功");	//提醒
		           	tools.removeClass(fullTipBox,"ok");
		            
		            template.addNewLi(obj);//新建的li放到左侧菜单中的ul中
		            
		            allIcoClick();//获取页面所有的三角形，给三角形添加点击事件函数
		          	
		            
		            /*//此时dataList改变，重新渲染树菜单，就会把刚添加的obj渲染到数菜单中
		            menu.innerHTML =  template.createTreeHtml(dataList,-1);*/
		            
		           
		            //全选不能勾选
		            tools.removeClass(checkedAll,"checkedAllChecked");
					//给所有的checkbox添加事件处理，newBox移入移出不用加，已经委托给了fileBox
		           	icoBoxAddEvent();
		           	//新建完了，不在编辑状态了，此时开关改成fasle
		           	create.isCreate = false;
				}
			}
		}
		
		
		
	})
	
	//阻止input身上的click和down冒泡，编辑过程中，用户并不一定会一次性输入正确，此时如果修改，会点击input，不能冒泡到document.down身上
	tools.addEvent(inputText,"mousedown",function(ev){
		ev.stopPropagation();
	})
	tools.addEvent(inputText,"click",function(ev){
		ev.stopPropagation();
	})
	
})


//-------------------------局部doucment.down事件，用来为新建/重名命判断什么条件下成功------------------------------

tools.addEvent(document,"mousedown",function(ev){
	if(create.isCreate){    
		var firstChild = fileBox.firstElementChild;//正在新建的newBox
		var pTitle =tools.$("p",firstChild)[0];//p
		var inputText =tools.$("input",firstChild)[0];//input
		var inputValue = inputText.value.trim();//input的value
		
		var lastChild = tools.$("strong",pathNav)[0];//导航栏最后一个元素strong
		var parentId = lastChild.dataset.fileId;//获取strong的id
		
		if(inputValue === ""){
			fileBox.removeChild(firstChild)
			console.log(111)
		}else if(handleData.reName(dataList,parentId,inputValue)){//此时新建的数据不在dataList中,也就不用考虑自己
			fileBox.removeChild(firstChild);
			fullTip("warn","文件夹名有冲突，请重新命名");
		}else{//新建成功
			pTitle.innerHTML = inputValue;//给p赋值
			
			tools.addClass(pTitle,"show");
			tools.removeClass(pTitle,"hide");
			
			tools.addClass(inputText,"hide");
			tools.removeClass(inputText,"show");
			
			var uuId = firstChild.dataset.fileId;
			//把数据push到总数据中
			var obj = {
				id:uuId,
				pid:parentId,
				title:inputValue,
				type:"file"
			}
			dataList.push(obj);
			
			tools.removeClass(fullTipBox,"ok warn");
            fullTip("ok","新建文件夹成功");	//提醒
          
            
            template.addNewLi(obj);
            allIcoClick();
           
            //全选不能勾选
            tools.removeClass(checkedAll,"checkedAllChecked");
			//给所有的checkbox添加事件处理，newBox移入移出不用加，已经委托给了fileBox
           	icoBoxAddEvent();
           	
           	
		}
	}
	
	//不管新建成功与否，都要把开关改成false,防止走进开关为true的程序里(走进点一下就把第一个newBox删除)
	create.isCreate = false;
//-------------------------------------------------------------------------------------------	
	//重命名后，点击document的时候，判断输入的title是否正确
	if(rechristen.isClick){
		var newBox = whoSelect()[0];
		var pTitle = tools.$("p",newBox)[0];
		var inputText = tools.$("input",newBox)[0];
		var val = inputText.value.trim();
		
		if(val === pTitle.innerHTML || val === ""){
			//只让p显示input隐藏(代码在全局中)
		}else{
			var newBoxId = inputText.parentNode.dataset.fileId;//当前input的父级newBox的id
			var parentId = tools.$("strong",pathNav)[0].dataset.fileId;//当前对应的newBox的父级的id
			
			if( handleData.reNameWithoutSelf(dataList,parentId,val,newBoxId) ){//如果当前input的value和其他几个newBox的title重名了
				tools.removeClass(fullTipBox,"ok");
				fullTip("warn","文件夹名有冲突，请重新命名");
				
			}else{
				pTitle.innerHTML = val;
				
				fullTip("ok","更名成功")
				tools.removeClass(fullTipBox,"warn");
				
				//dataList要更改，同时菜单区域要根据新的dataList重新渲染
				var newBoxId = inputText.parentNode.dataset.fileId;
				
				handleData.getDataById(dataList,newBoxId).title = val;//更改数据中的title
				
				var tree = tools.getTreeById("tree_title",newBoxId,menu);//找到菜单区域对应的div
				
				var strong = tools.$(".ellipsis",tree)[0];//找到div对应的strong
				
				strong.innerHTML = val;
				//不需要重新渲染，数据一定不要忘记改。
			}
		}
		
	    tools.addClass(pTitle,"show");//p显示
		tools.removeClass(pTitle,"hide");
		tools.addClass(inputText,"hide");//input隐藏
		tools.removeClass(inputText,"show");
		
	}
	
	rechristen.isClick = false;//无论重命名是否成功，都改成false
	
	ev.stopPropagation();
})

//----------------------全局的documet.down的时候添加框选的move和up事件/剪影的的move和up事件--------------------
var newDiv = null;
var disX = disY = 0;//以下函数都要用，所以提升到上面来
var shadowTarget = null;//拖拽的目标
tools.addEvent(document,"mousedown",function(ev){
	var target = ev.target;
	if( tools.parents(target,".leftSideBar") ||  tools.parents(target,".menu") || tools.parents(target,".rightsideBar_header")  ||  icoBoxs.length === 0 ||deleteSome.deleteSome ||moveTo.isMove || fileBox.isContextmenu){
		return;
	}
    ev.preventDefault(); //阻止浏览器默认行为，必须写上面，防止下面代码中有return
    
    //down时候获取一个固定的值
    disX = ev.clientX;
    disY = ev.clientY;
	
	
	//添加剪影的move和up函数，只有目标源是newBox的时候，才产生剪影且剪影移动
	if(tools.parents(target,".newBox") ){
		tools.addEvent(document,"mousemove",shadowMoveFn);
		tools.addEvent(document,"mouseup",shadowUpFn);
		shadowTarget = tools.parents(target,".newBox");
		return; //暂时写上
	}
	
	//添加框选move和up函数
	tools.addEvent(document,"mousemove",moveFn);
	tools.addEvent(document,"mouseup",upFn);
	
	
	//删除newBox和span的样式
	for (var i = 0; i < newBoxs.length; i++){
		tools.removeClass(newBoxs[i],"newBoxChecked");
		tools.removeClass(icoBoxs[i],"icoBoxChecked");
   	}
	//全选不能勾选
    tools.removeClass(checkedAll,"checkedAllChecked");
    
    var rightBox = tools.$(".rightBox")[0];
    if(rightBox){
    	document.body.removeChild(rightBox);//删除右键弹框
    	
    }
    
	
})

//----------------------------------------剪影移动-----------------------------------------
var shadow = null;//剪影刚开始为null
var isDrag;//开关用来判断是否在拖拽，true是在拖
var passiveObj = null //声明一个对象，用来记录被碰撞的那个newBox
var tips = null;//存放div
function shadowMoveFn(ev){
	if(Math.abs(ev.clientX - disX) >10  || Math.abs(ev.clientY - disY) >10 ){
		isDrag = true;//此时正在拖拽
		
		if(!shadow){//如果shadow不存在，就创建一个
			shadow = template.moveFileShadow();//函数里已经加号类名设计好样式
			document.body.appendChild(shadow);
			shadow.style.display = 'block';
			//在newBox上up时，完成了newBox的click事件，所以不能在newBox上up，创建一个div，让鼠标在它身上up
			tips = document.createElement("div");
            tips.style.cssText = 'width:30px;height: 30px;position:absolute;left:0;top:0;z-index:1000;'
            document.body.appendChild(tips);
		}
		
		tips.style.left = ev.clientX + 'px';
        tips.style.top = ev.clientY + 'px';
        
		shadow.style.left = ev.clientX +8+ "px";
		shadow.style.top = ev.clientY +8+ "px";
		
		
		//如果从当前的newBox拖拽出剪影了，当前这个newBox要加上样式，如果有了就啥也不干，没有的时候加上，加之前清空所有
		var curIcoBox = tools.$(".icoBox",shadowTarget)[0];
		if(!tools.hasClass(curIcoBox,"icoBoxChecked")){
			//清空所有的，再给当前的加上样式
			for (var i = 0; i < newBoxs.length; i++) {
				tools.removeClass(newBoxs[i],"newBoxChecked");
				tools.removeClass(icoBoxs[i],"icoBoxChecked");
			}
			//给当前newBox和span加上样式
			tools.addClass(shadowTarget,"newBoxChecked");
			var icoBox = tools.$(".icoBox",shadowTarget)[0];
			tools.addClass(icoBox,"icoBoxChecked");
		}
		
		//计算拖拽时显示的数量
		var selectArr = whoSelect();//span勾选上的话，把对应的newBox放到这个数组中
		var sum = tools.$(".sum")[0];//获取计数的span
		var icons = tools.$(".icons")[0];//获取文件夹的父级,默认有一个文件夹
		
		sum.innerHTML = selectArr.length;
		//用JS渲染icons的结构
		var str = "";
		var len = selectArr.length > 4 ? 4 : selectArr.length; //文件夹的数量在小于4的情况下随着选中的newBox的数量改变而改变，但是newBox数量大于4的时候，不再增加文件夹。
		for (var i = 0; i < len; i++) {
			str += '<i class="icon icon'+i+' filetype icon-folder"></i> ';
		}
		icons.innerHTML = str;
		
		passiveObj = null;//清空上一次记录
		//shadowTarget碰撞到了非选中的newBox时，被碰的那个newBox背景改变,判断依据：碰到了且被碰到的那个newBox不在whoSelect()这个数组中。
		for (var i = 0; i < newBoxs.length; i++) 
		{
			if( tools.duang(tips,newBoxs[i]) && !tools.indexOf(selectArr,newBoxs[i]) ){//用shadow去碰撞
				tools.addClass(newBoxs[i],"newBoxblueBg");
				tools.removeClass(newBoxs[i],"newBoxChecked");
				//tools.removeClass(icoBoxs[i],"icoBox");
				passiveObj = newBoxs[i];//把当前被碰撞的newBox存在对象中，用于下面的判断
			}else{//没碰上要去掉样式
				tools.removeClass(newBoxs[i],"newBoxblueBg");
			}
		}
		
		
	}
	
}


function shadowUpFn(){
	isDrag = false;//此时拖拽完成
	tools.removeEvent(document,"mousemove",shadowMoveFn);
	tools.removeEvent(document,"mouseup", shadowUpFn);
	if(shadow){//让减影消失
		document.body.removeChild(shadow);
		shadow = null;
	}
	
	//如果被碰上的元素(passiveObj)存在，把选中的元素(whoSelect())对应的数据的pid变成被碰上的元素对应的id
	if(passiveObj){
		var selectArr = whoSelect();//存储被拖拽的newBox
		var passiveId = passiveObj.dataset.fileId;//获取被碰撞的newBox的id
		var children = handleData.getChildsById(dataList , passiveId);//获取被碰撞的所有第一级子节点
		
		for (var i = 0; i < selectArr.length; i++) {
			var dragId = handleData.getDataById(dataList,selectArr[i].dataset.fileId);//每次获取被拖拽的的newBox对应的数据{}
			var j = 0;
			for (;j<children.length;j++){//注意j拿出去的话，for()中要加个;
				if(dragId.title == children[j].title ){
					//提示：文件名重复，移入失败
					fullTip("warn","部分移动失败,重名了");
					break;
				}
			}
			
			if(j === children.length){//如果for循环结束还没找到，说明此时dragId和children中所有的都不相同，可以放进去
				dragId.pid = passiveId;//通过修改pid，就可以改变dataList
			}
		}
		
		//for循环后，dataList改变了，文件区域/菜单区域都要重新渲染，导航区域不变不用渲染(同级之间移动，最上面的最后一个显示他们的父级，且为灰色)
		var pathLastId = tools.$(".current_path",pathNav )[0].dataset.fileId;
		fileBox.innerHTML = createFileHtml(dataList,pathLastId);//文件区域
		menu.innerHTML =  template.createTreeHtml(dataList,-1);//菜单区域
		var curTree = tools.getTreeById("tree_title",pathLastId);//找到菜单里此时应该加样式的那一项
		tools.addClass(curTree,"tree_click showIco");//此时这项有背景且三角形展开
		passiveObj = null;
	}
}



//-----------------------------------框选的move和up函数----------------------------------------

function moveFn(ev){
	if(Math.abs(ev.clientX - disX) >10  || Math.abs(ev.clientY - disY) >10 ){
		if(!newDiv){//不存在的时候才创建，不然一旦move就创建，那样就创建了很多很多个
			newDiv = document.createElement("div");
			tools.addClass(newDiv,"dialog");
			newDiv.style.left = disX + "px";
			newDiv.style.top = disY + "px";
			document.body.appendChild(newDiv);
		}
		newDiv.style.width = Math.abs(ev.clientX - disX) + "px";
		newDiv.style.height = Math.abs(ev.clientY - disY) + "px";
		
		newDiv.style.left = Math.min ( disX , ev.clientX ) + "px";
		newDiv.style.top = Math.min ( disY , ev.clientY ) + "px";
		
		
		//move的时候如果碰到了newBox，就加样式，碰不到就不加样式
		for (var i = 0; i < newBoxs.length; i++) {
			if( tools.duang(newDiv,newBoxs[i]) ){
				tools.addClass(newBoxs[i],"newBoxChecked");
				tools.addClass(icoBoxs[i],"icoBoxChecked");
			}else{
				tools.removeClass(newBoxs[i],"newBoxChecked");
				tools.removeClass(icoBoxs[i],"icoBoxChecked");
			}
		}
		
	}
}

function upFn(){
	tools.removeEvent(document,"mousemove",moveFn);
	tools.removeEvent(document,"mouseup",upFn);
	var dialog = tools.$(".dialog")[0];
	//不能判断newDiv是否存在，因为dialog一旦存在，证明的确append body里了,newDiv不一定会append body中
	if(dialog){
		document.body.removeChild(newDiv);//删除框选
	}
	//注意，是在up的时候，全选打勾，不是move的时候，看清楚需求
	if(whoSelect().length === newBoxs.length){
		tools.addClass(checkedAll,"checkedAllChecked");
	}
	
	newDiv = null;//必须清空，否则下次使用会报错
}

//-------------------------------点击重命名----------------------------------------------
function rech(){
	var rechristen = tools.$(".rechristen")[0];//获取重命名按钮
	rechristen.click();
}

var rechristen = tools.$(".rechristen")[0];//获取重命名按钮
tools.addEvent(rechristen,"click",function(ev){
	rechristen.isClick = true;
	selectArr = whoSelect();//看此时勾选的文件夹的数量
	if(selectArr.length === 0){
		 fullTip("warn","请选择文件");	//提醒;
	}else if(selectArr.length > 1){
		 fullTip("err","只能针对一个文件夹重命名");	//提醒;
	}else{//重命名成功
		var newBox = selectArr[0];//因为重命名时只能选择一个，所以selectArr中此时只有一个newBox
		var pTitle = tools.$("p",newBox)[0];
		var inputText = tools.$("input",newBox)[0];
		
		tools.addClass(pTitle,"hide");//p隐藏
		tools.removeClass(pTitle,"show");
		
		tools.addClass(inputText,"show");//input显示
		tools.removeClass(inputText,"hide");
		
		inputText.value = pTitle.innerHTML;
		inputText.focus();//input获取光标
		inputText.select();//input的内容全部选中
		
		
		
		//input onkeydown的时候
		tools.addEvent(inputText,"keydown",function(ev){
			if(ev.keyCode == 13){
				var val = inputText.value.trim();
				if(val === ""){
					//此时onkeydown啥也不干
				}else if(val === pTitle.innerHTML){
						//p显示，input隐藏
						pTitle.innerHTML = val;
						tools.addClass(pTitle,"show");
						tools.removeClass(pTitle,"hide");
						tools.addClass(inputText,"hide");
						tools.removeClass(inputText,"show");
				}else {
					var newBoxId = this.parentNode.dataset.fileId;//当前input的父级newBox的id
					
					var parentId = tools.$("strong",pathNav)[0].dataset.fileId;//当前对应的newBox的父级的id
					
					if( handleData.reNameWithoutSelf(dataList,parentId,val,newBoxId) ){
						
						fullTip("warn","文件夹名有冲突，请重新命名");
						
					}else{
						pTitle.innerHTML = val;
						tools.addClass(pTitle,"show");
						tools.removeClass(pTitle,"hide");
						tools.addClass(inputText,"hide");
						tools.removeClass(inputText,"show");
						
						//提示
						fullTip("ok","更名成功")
						tools.removeClass(fullTipBox,"warn");
						
						//dataList要更改，同时菜单区域要根据新的dataList重新渲染
						var newBoxId = this.parentNode.dataset.fileId;
						
						handleData.getDataById(dataList,newBoxId).tilte = val;
						
						menu.innerHTML =  template.createTreeHtml(dataList,-1);//见template.js
						
					} 
				}
			}
		})
		
		//下一步，去document.onmousedown里做判断，看名称是否符合要求
		tools.addEvent(inputText,"mousedown",function(ev){
			ev.stopPropagation();
		})
		tools.addEvent(inputText,"click",function(ev){
			ev.stopPropagation();
		})
	}
	
	ev.stopPropagation();//阻止冒泡
	
})

//-----------------------------------------点击删除-----------------------------------------
function dele(){
	var deleteSome = tools.$(".deleteSome")[0];
	deleteSome.click();//程序触发事件
}

var deleteSome = tools.$(".deleteSome")[0];
tools.addEvent(deleteSome,"click",function(){
	deleteSome.deleteSome = true;
	var selectArr = whoSelect();
	if(selectArr.length === 0){
		fullTip("warn","请选择文件");
	}else{
		//弹框(包含遮罩)出现，调用dialog函数，传参(参数为一个对象)
		dialog({
			title:"删除文件",
			content:template.moveDialogHtmlDelete(),
			okFn:function(){
				var idArr = [];
				for (var i = 0; i < selectArr.length; i++) {
					fileBox.removeChild(selectArr[i]);//从结构中删除这个文件夹
					fullTip("ok","文件删除成功");
					var fileId = selectArr[i].dataset.fileId;//获取当前删除文件夹的id
					var tree =  tools.getTreeById("tree_title",fileId,menu);//通过id找到菜单栏中这个div
					tree.parentNode.parentNode.removeChild(tree.parentNode);//ul中删除li
					idArr.push(fileId);
				}
					
				handleData.batchDelect(dataList,idArr);//批量删除数据
				tools.removeClass(checkedAll,"checkedAllChecked");//全选不打勾
				
				
				deleteSome.deleteSome = false;
				remindBlankFile();
				return deleteSome.deleteSome;
			},
			closeFn:function(){
				deleteSome.deleteSome = false;
			},
			cancelFn:function(){
				deleteSome.deleteSome = false;
			}
		})
	}
})

//-------------------------------------点击移动--------------------------------------
/*
 按照3-1,3-2,3-3去阅读代码
不能移动的情况有三个：
	1.不能移动到被移动元素的这堆元素的父级上(因为它的父级下存在它自己)，如果发生，直接在error中红字提示
	2.不能移动到自己和自己的子孙文件夹下，如果发生，直接在error中红字提示
	3.可以移动，但是被移入的文件夹中有和移动的这个文件重名，此时不在error中提示，而是在点击confirm后在okFn中判断，然后用FullTip提示。
	 

*/
function move(){
	var moveTo = tools.$(".moveTo")[0];
	moveTo.click();
}


var moveTo = tools.$(".moveTo")[0];
tools.addEvent(moveTo,"click",function(ev){
	var selectArr = whoSelect();
	if(selectArr.length === 0){
		fullTip("warn","请选择文件");		
	}else{//移动一个或多个
		//出现弹框
		moveTo.isMove = true;//设置一个开关，用来判断当前状态，true代表正在移动，false代表移动完成
		var movedId = 0; //用来保存被移入文件的id
		var canMove = true;//为true默认不可以移动，为false是可以移动
		
		//点击按钮confirm的时候，才调用弹框这个函数，传入一个对象，对象里的key/value都是自定义的
		dialog({
			title:"选择存储位置",
			content:template.moveDialogHtmlMove(),
			okFn:function(){
				//3-2
				if(!canMove){
					//这里判断的是第3中情况，被移动的文件的title和被移入的文件夹里的第一级子节点的tilte重名，此时不可以移动会在error直接提示，而是等点击了confirm按钮后，在FullTip()中弹出提示。
					var children = handleData.getChildsById(dataList,moveId);//获取被点击的tree第一级子节点
					var onOff = true;
					for (var i = 0; i < selectArr.length; i++){
						var curData = handleData.getDataById(dataList,selectArr[i].dataset.fileId);
						for(var j = 0; j<children.length; j++){
							if(curData.title ==children[j].title ){
								fullTip("warn","(1051),文件名重复");
								onOff = false;
								break;
							}
						}
					}
					//for循环结束之后,还要一个循环，可以把多个移动
					for (var i = 0; i < selectArr.length; i++) {
						var curData = handleData.getDataById(dataList,selectArr[i].dataset.fileId);
						if(onOff){//如果为true，此时可以移动了
							curData.pid = moveId;
							
							//重新渲染文件区域
							var parentId =  tools.$(".current_path")[0].dataset.fileId;
							fileBox.innerHTML = createFileHtml(dataList,parentId);
							
							
							//pathNav上最后一个就是菜单栏中要定位的那个
							var tree = tools.getTreeById("tree_title",parentId,menu);//找到应该定位的那个div
							tools.addClass(tree,"tree_click");//加样式
							//从父级删除被移动的元素
							
							var div = tools.getTreeById("tree_title",curData.id,menu);//被移动的那个元素
							var divParent = div.parentNode;
							
							
							var divTarget = tools.getTreeById("tree_title",moveId,menu);//被移入的文件中的div
							var nextUl = divTarget.nextElementSibling;//被移入文件中的ul
							
							nextUl.appendChild(divParent);//被移动的li移入到当前的ul中
							nextUl.style.display = "block";//当前的ul显示
							//显示三角形
							tools.addClass(divTarget,"showIco");
							tools.removeClass(divTarget,"noIco");
						}
					}
					
				}
				//移动完成，开关改过来
				moveTo.isMove = false;
				tools.removeClass(checkedAll,"checkedAllChecked");
				
				remindBlankFile();
				return canMove;//此时canMove为true
			},
			closeFn:function(){
				moveTo.isMove  = false;
			},
			cancelFn:function(){
				moveTo.isMove  = false;
			}
		});
		
		//填写弹框中动态生成的内容
		var fullPop = tools.$(".full-pop")[0];//在dialog的行53,获取弹框的父级
		var fileName = tools.$(".file-name",fullPop)[0];
		var fileNum = tools.$(".file-num",fullPop)[0];
		//选择的第一个文件夹的名称就是当前显示的名称
		var selectFirstId = selectArr[0].dataset.fileId;
		
		fileName.innerHTML = handleData.getDataById( dataList,selectFirstId ).title;//获取当前的数据的title
		//数字只要在移动的文件夹数量大于等于2的时候，才会显示
		if(selectArr.length >=2){
			fileNum.innerHTML = '等'+selectArr.length+'个文件';
		}
		
		
		//渲染弹框中的数型菜单区域(content里的数型结构)
		var dirTree = tools.$(".dirTree")[0];//在template行94
		dirTree.innerHTML = template.createTreeHtml(dataList,-1);//重新开始渲染数菜单
		
		var allChildren = handleData.getChildsAll(dataList,-1);//包含自己和所有的子孙节点
		for (var i = 0; i < allChildren.length; i++) {
			tools.addClass(allChildren[i],"tree_title");			
		}
		
		
		var prevId = 0;//用来记录上一个被点击的div(tree)的id
		
		//点击数菜单中每个div(tree)时，利用事件委托给它们的父级dirTree
		tools.addEvent(dirTree,"click",function(ev){
			var target = ev.target;
			if( tools.parents(target,".tree_title") ){
				
				target = tools.parents(target,".tree_title");//target由原来的小目标源变成当前的div
				
				canMove = false;//false代表可以移动，只有点击数菜单中某一项，点击confirm才可以判断开关
				
				//给当前被点击的div加上样式，同时删除上一个div身上的样式
				var prevTree = tools.getTreeById ("tree_title",prevId,dirTree);//上一个有样式的div
				tools.removeClass(prevTree,"tree_click");//删除样式
				
				var clickId = target.dataset.fileId;//获取当前被点击div身上的id
				tools.addClass(target,"tree_click");
				
				prevId = clickId;//及时记录
				
				//错误信息提示
        		var error = tools.$(".error",fullPop)[0];
        		error.innerHTML = "";
        		
        		//3-1 文件移入到的文件夹就是它的父级时，不能移动且error提示
        		
        		var firstSelectId = selectArr[0].dataset.fileId;//这个目前是确定的，通过它可以获取父级
        		var parent = handleData.getParent(dataList,firstSelectId);//获取移动元素的父级
        		
				if(clickId == parent.id ){//如果被点击的元素就是移动元素的父级
					error.innerHTML = "文件已经在当前文件夹下";
					canMove = true;//true代表不能移动
				}
				
				//3-2 元素被移动到它自己和它的子孙身上时，不能移动且error报错
				for (var i = 0; i < selectArr.length; i++){
					var selectId = selectArr[i].dataset.fileId;
					var children = handleData.getChildsAll(dataList,selectId);//包含自己和所有的子孙节点
					for (var j = 0; j < children.length; j++) {
						if(clickId == children[j].id){
							error.innerHTML = "不能移动到自身或其子文件夹下";
							canMove = true;//true代表不能移动
							break;
						}
					}
				}
				moveId = clickId;//把点击的div的id存在moveId里
			}
		})
	}
	
	ev.stopPropagation();//阻止冒泡
	tools.addEvent(moveTo,"mousedown",function(ev){
		ev.stopPropagation();//阻止冒泡
	});
})










//-----------------一旦文件区域的文件夹数量为0，就显示空白文件提醒---------------------------------

function remindBlankFile(){
	var newBoxs = tools.$(".newBox",fileBox);
	var gEmpty = null;//空白区域的父级
	if(newBoxs.length === 0){
		gEmpty = document.createElement("div");
		tools.addClass(gEmpty,"g-empty");
		gEmpty.innerHTML = template.createEmptyHtml();
		fileBox.appendChild(gEmpty);
		gEmpty.style.dislay = "block";
	}else{
		gEmpty=tools.$(".g-empty")[0];
		if(gEmpty){
			fileBox.removeChild(gEmpty);
		}
		
	}
}


































//最后添加辅助功能一：点击右上角的切换按钮，让菜单区域显示隐藏
var chooseMenu = tools.$(".chooseMenu")[0];
var box = tools.$(".box")[0];
tools.addEvent(chooseMenu,"click",function(){
	tools.toggleClass(menu,"hide");//点击一下，菜单区域隐藏显示交替变换
	tools.toggleClass(box,"boxMoveLeft");//box的padding-left值在12和184之间切换
});


}())




































		
		
