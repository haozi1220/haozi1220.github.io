


var handleData = (function(){
	return {
		//1.输入总数据和元素的id，找到子节点放到数组中(pid=元素id的第一级子节点，并不是所有的子节点)，只包括孩子，不包括自己
		getChildsById:function(data,id){
			var arr = [];
			for (var i = 0; i < data.length; i++) {
				if(data[i].pid == id){
					arr.push(data[i] )
				}
			}
			return arr;
		},
		/*
		2.输入总数据和元素的id，找到自己和所有的祖先节点
			举例：输入发如雪的id，递归依次找到发如雪->周杰伦->我的音乐->微云
				但是递归返回的时候是按照下面的顺序，这几个返回值之间没任何关系，需要通过数组的方法concat连接起来
					倒数第一层：空数组(找不到微云的pid，声明的arr最终结果是[])
					倒数第二层：微云
					倒数第三层：我的音乐
					倒数第四层：周杰伦
					倒数第五层：发如雪
			
			最终找到的数组顺序和样式是：["发如雪","周杰伦","我的音乐","微云",[]]
		*/
		getAllParentById:function(data,id){
			var arr = [];
			for (var i = 0; i < data.length; i++) {
				if(data[i].id  == id ){
					arr.push(data[i]);//找到自己发如雪
					/*递归返回的时候，里层返回的数组和外层的arr没有关系，如果不concat，最后返回的是最先找到的那个对象，
					 参考递归理解(笔记/递归理解)*/
					arr = arr.concat(handleData.getAllParentById(data, data[i].pid) );
				}
			}
			return arr;
		},
		//3.输入总数据和当前这个元素的id,先通过函数2获取当前这个元素和所有的祖先节点组成的父级的数组，然后获取数组的长度
		getLevel:function (data,id){  
	    	return handleData.getAllParentById(data,id).length;
	    },
	    //4.输入总数据和当前这个元素的id,通过函数1获取这个元素下的所有一级子节点放到数组中，然后获取数组的长度，长度有值返回true，长度为0返回false
		hasChilds:function (data,id){
	    	return !!handleData.getChildsById(data,id).length;
	    },
	    //5.输入总数据/当前这个元素的pid/一个title,通过函数1输入当前元素的pid(相当于父级的id)，找到这个元素下面所有一级子节点存在变量childs中,循环匹配childs，返回trur/false    reName重名
	    reName:function (data,id,title){
	    	var childs = handleData.getChildsById(data,id);
	    	for( var i = 0; i < childs.length; i++ ){
	    		if( childs[i].title === title ){
	    			return true;
	    		}
	    	}
	    	return false;
	    },
	    reNameWithoutSelf:function (data,id,title,newBoxId){
	    	var childs = handleData.getChildsById(data,id);//包括当前的div
	    	for( var i = 0; i < childs.length; i++ ){
	    		if( childs[i].title === title && childs[i].fileId !== newBoxId ){
	    			return true;
	    		}
	    	}
	    	return false;
	    },
	    
	    //6.输入总数据和一个充满id的数组idArr，如果匹配到了，就把这条数据删除
	    deleteDataById:function (data,idArr){
	    	for( var i = 0; i < data.length; i++ ){
	    		for( var j = 0; j < idArr.length; j++ ){
	    			if( data[i].id == idArr[j] ){
	    				data.splice(i,1);
	    				i--;
	    				break;//break只能跳出当前的for循环，即小循环，大循环继续进行,continue是跳出当次for循环，下次小循环仍然继续，这里没必要用continue
	    			}
	    		}
	    	}	
	    },
	    //7.作用:找到指定id的所有的子孙数据，与函数2刚好相反，包括自己
	    getChildsAll:function (data,id){
            //通过循环数据，找到指定id的那条数据
            var arr = [];
            for( var i = 0; i < data.length; i++ ){
                if( data[i].id == id ){
                    arr.push(data[i]);//先找到指定id对应的元素
                    //在通过找到的这个对象，找到它下面所有的一级子节点
                    var childs = handleData.getChildsById(data,data[i].id);
                    //循环输入一级子节点的id，调用递归函数，先找到一级子节点，再找到一级子节点下面的子节点，依次递归
                    for( var j = 0; j < childs.length; j++ ){
                       arr = arr.concat(handleData.getChildsAll(data,childs[j].id));
                    }
                }
            }
            return arr;    
        },
        //8.传入所有数据，批量删除指定id下面的所有的子级     batchDelect  批量删除
        batchDelect:function (data,idArr){
            for( var i = 0; i < idArr.length; i++ ){
                var childsAll = handleData.getChildsAll(data,idArr[i]);
                for( var j = 0; j < childsAll.length; j++ ){
                    for( var k = 0; k < data.length; k++ ){
                        if( data[k].id == childsAll[j].id ){
                            data.splice(k,1);
                            break;//这里break后，跳出小循环，此时大循环继续循环的时候，小循环k从0开始，同时idArr.length自动减少1
                        }
                    }
                }

            } 
        },
        //9.通过id找到这个元素，找不到就返回null
        getDataById:function (data,id){
        	for( var i = 0; i < data.length; i++ ){
        		if( data[i].id == id ){
        			return data[i];
        		}
        	}

        	return null;
        },
        //10.输入所有数据和父级Id，获取父级
        getParent:function (data,id){
        	var parents = handleData.getAllParentById(data,id);//通过id找到自己和所有的祖先节点
        	return parents[1];//返回数组中第二个，数组中的第一个是自己
        },
        setDivPaddingLeft:function(moveDiv){
        	var dataList = data.files;
        	var menu = tools.$(".menu")[0];
        	
        	//获取自己和所有的子孙节点(children是一个数组，数组里都是对象)
        	var children = handleData.getChildsAll(dataList,moveDiv.id);
        	
        	for (var i = 0; i < children.length; i++) {
        		var tree = tools.getTreeById("tree_title",children[i].id,menu);//被移入的文件div
        		tree.style.paddingLeft = handleData.getLevel(dataList,children[i].id)*14 + "px";
        	}
        }
        
        
        
	}
}())





	

