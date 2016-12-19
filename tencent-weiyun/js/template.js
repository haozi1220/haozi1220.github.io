var template = (function(){
	return {
		//根据数据，生成一个newBox的结构
		createFileConstruction:function (obj){
			var html = '<div class="newBox" data-file-id="'+obj.id+'">'
							+'<span class = "icoBox"></span>'
							+'<span class="flieBg"></span>'
							+'<p class="show">'+obj.title+'</p>'
							+'<input type="text" class="hide inputTitle"/>'
						+'</div>';
	
			return html;
		},
		createPathNavConstruction:function (data,id){
			var parents = handleData.getAllParentById(data,id).reverse();//传入自己的id,获取自己和所有祖先节点的数组
			var html = "";
			var zdex = parents.length+10;
			for (var i = 0; i < parents.length-1; i++) {//for循环的同时，层级递减
				html += '<a href="#" data-file-id = "'+parents[i].id+'"  class="wy_bg" style = "z-index:'+(zdex--)+';">'
							+'<span>'+parents[i].title+'</span>'
						+'</a>';
			}
			
			html += '<strong class="wy_bg  current_path"  style = "z-index : '+zdex+'"  data-file-id = "'+parents[parents.length-1].id+'">'
						+'<em>'+parents[parents.length-1].title+'</em>'
					+'</strong>';
					
			return html;	
			
		},
		//封装两个函数，用来渲染结构
		createTreeHtml:function (data,id){
			//通过id获取该元素的第一层子节点
			var childs = handleData.getChildsById(data,id);
			var html = "<ul>";
			for (var i = 0; i < childs.length; i++) {//中间通过for循环不断生成N个li
				html += template.createTreeLiConstruction( data,childs[i] );
			}
			html += "</ul>";
			
			
			return html;
		},
		//data是总数据，childs是createTreeHtml函数中for循环里的对象
		createTreeLiConstruction:function (data,child){
			//获取当前传入的childs[i]和它所有祖先节点的数组的长度，用来计算div的padding-left
			var grade = handleData.getLevel(data,child.id);
			//判断当前传入的元素childs[i]是否有子节点，如果有，就生成三角形，没有就算了。true代表有子节点，false代表没有
			var IfhasChild = handleData.hasChilds(data,child.id);//判断child孩子的数量的长度，如果有值说明有孩子
			//是否有三角形,根据加的类名来看，且类名加在div身上
			var ClassIco  = IfhasChild ? "foldIco " : "noIco";
			
			var html = "<li>";//给div设置自定义属性/加类名/设置padding-left
			html += '<div data-file-id = "'+child.id+'"class="tree_title '+ClassIco+' " style = "padding-left:'+ grade*14 +'px;">'
						+'<span>'
							+'<strong class="ellipsis">'+child.title+'</strong>'
							+'<i class="ico"></i>'
						+'</span>'
					+'</div>';
			//if(IfhasChild){
				/*var children = handleData.getChildsById(data,child.id);
				html += '<ul>';
				for (var i = 0; i < children.length; i++) {
					html += createTreeLiConstruction(data,children[i])
				}
				html += '</ul>';*/
				html += template.createTreeHtml(data,child.id);//这句话等于上面隐藏的一堆，用来生成当前child的孩子
			//}
			
			html += "</li>";
			
			return html;
		},
		//创造一个剪影
        moveFileShadow:function (){
            var newDiv = document.createElement("div");
            newDiv.className = 'drag-helper ui-draggable-dragging';

            var html = '<div class="icons">'
                            +'<i class="icon icon0 filetype icon-folder"></i>'  
                        +'</div>'
                        +'<span class="sum">1</span>';

            newDiv.innerHTML = html;
            return newDiv;
        },
        //生成弹框的中间区域content里的结构，这个是移动的
        moveDialogHtmlMove:function (){
            var html = '<p class="dir-file">\
			                <span class="file-img"></span>\
			                <span class="file-name"></span>\
			                <span class="file-num"></span>\
			            </p>\
			            <div class="dir-box">\
			                <div class="cur-dir">\
			                    <span>移动到：</span><span class="fileMovePathTo"></span>\
			                </div>\
			                <div class="dirTree"></div>\
			            </div>';

            return html;

        },
        //生成弹框的中间区域content里的结构，这个是删除的
        moveDialogHtmlDelete:function (){
            var html = '<span class="deIco"></span>'
           				 +'<p class="warn">确定要删除这个文件夹吗?</p>'
           				 +'<p class="remark">已删除的文件可以在回收站找到</p>';
						
            return html;
        },
        createEmptyHtml:function(){
        	var html = '<div class="empty-box">'
	                        +'<div class="ico"></div>'
	                        +'<p class="title">暂无文件</p>'
	                        +'<p class="upClick">请点击左上角的“上传”按钮添加</p>'
	                    +'</div>';
        	
        	return html;
        },
        createRightBox:function(){
        	var html = '<ul>\
							<li class="link dL">\
								<a href="#">下载</a>\
							</li>\
							<li class="link DL">\
								<a href="javascript:;">删除</a>\
							</li>\
							<li class="link MT">\
								<a href="javascript:;">移动到</a>\
							</li>\
							<li class="link  RC">\
								<a href="javascript:;">重命名</a>\
							</li>\
							<li class="uniq"></li>\
							<li class="link SH">\
								<a href="javascript:;" class="last"><span class="share"></span>分享</a>\
							</li>\
						</ul>';
        	
        	return html;
        },
        addNewLi:function(obj){   //obj是dataList中新增加的对象
        	var pathNav = tools.$(".path_nav")[0];
        	var menu = tools.$(".menu")[0];
        	var dataList = data.files;
        	
        	var parentId = tools.$(".current_path",pathNav)[0].dataset.fileId;//导航区域最后一个元素的id,即左侧菜单栏的父id
            //通过父id找到当前的div，然后找到当前的li，再找到li的子级ul，往ul里放一个li(新建的li)
            
            var tree = tools.getTreeById("tree_title",parentId,menu);//获取到div
            var parentLi = tree.parentNode;//获取div的父级li
            var nextUl = null;
            
            if(tree.nextElementSibling){//如果tree的兄弟节点ul存在
            	nextUl = tree.nextElementSibling;
            }else{//如果tree的兄弟节点ul不存在
            	nextUl = document.createElement("ul");
            	parentLi.appendChild(nextUl);
            }
            
           	var newLi = template.createTreeLiConstruction(dataList,obj);//根据新增加的obj生成一个li字符串
           	
        	nextUl.innerHTML += newLi;
        	
        	nextUl.style.display = "block";
        	
            tools.removeClass(tree,"noIco");// 新增后,parentLi有了子集nextUl,此时div中要显示展开的三角形
            
            var span = tools.$(".ico",tree)[0];//获取当前的按钮
            
           
        }
        
	}
}())







