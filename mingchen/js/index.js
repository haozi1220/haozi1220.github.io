/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2017-06-22 21:45:05
 * @version $Id$
 */
(function(){
	$("document").ready(function(){
		$('.nav1').load("./page/nav.html");
		$(".footer1").load("./page/footer.html");
		/*顶部轮播图*/
		var len = $(".banner_list li").size();
		var bodyWidth = $("body").outerWidth(true);
		var allLi = $(".banner_list li");
		$(allLi).each(function(index, el) {
			$(this).width(bodyWidth)
		});
		var liWidth = allLi.width();
		var n = 0;
		$(".banner_list").width(liWidth*len);
		timer=setInterval(function(){
			n++;
			$(".banner_list").animate({
				left: -n*liWidth
			},1000, function() {
				if(n===len-1){
					console.log(n)
					n=0;
					$(".banner_list").css({
						left: -n*liWidth
					});
				}
			});
		},2000)
		/*service animate*/
		$('.service_list .shadow2').mouseover(function(event) {
			var _index = $('.service_list .shadow2').index(this);
			$('.service_list .shadow').eq(_index).stop().animate({width: "100%"}, "linear")
		});
		$('.service_list .shadow2').mouseout(function(event) {
			var _index = $('.service_list .shadow2').index(this);
			$('.service_list .shadow').eq(_index).stop()
			.animate({width: "0"}, "linear")
		});
		/*sevice list and dynamic list*/
		//argument1,argument2 must be classname and string
		function showHide(argument1,argument2){
			var aDynamicBtn = $(argument1);
			var aDynamicContent = $(argument2);
			var prev = 0;
			aDynamicBtn.click(function(event) {
				var _index = aDynamicBtn.index(this);
				if( prev != _index ){
					aDynamicBtn.each(function(index, el) {
						$(this).removeClass('active');
						$(this).siblings('div').children('p').hide('slow');
					});
				}
				aDynamicBtn.eq(_index).toggleClass('active');
				aDynamicContent.eq(_index).slideToggle("slow");
				prev = _index;
			});
		};
		showHide(".dynamic_btn",".dynamic_content");
		showHide(".history_btn",".history_content");
		/*case*/
		$(".case_list li").hover(function() {
			var _index = $(".case_list li").index(this);
			$(".shadow_wrapper").eq(_index).stop().animate({top:"0"}, 500);
		}, function() {
			var _index = $(".case_list li").index(this);
			$(".shadow_wrapper").eq(_index).stop().animate({top:"-100%"}, 500);
		})
	});
})()

	