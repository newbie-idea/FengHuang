jQuery(function($) {'use strict',

	//#main-slider
	$(function(){
		$('#main-slider.carousel').carousel({
			interval: 8000
		});
	});


	// accordian
	$('.accordion-toggle').on('click', function(){
		$(this).closest('.panel-group').children().each(function(){
		$(this).find('>.panel-heading').removeClass('active');
		 });

	 	$(this).closest('.panel-heading').toggleClass('active');
	});

	//Initiat WOW JS
	new WOW().init();

	// portfolio filter
	$(window).load(function(){'use strict';
		var $portfolio_selectors = $('.portfolio-filter >li>a');
		var $portfolio = $('.portfolio-items');
		$portfolio.isotope({
			itemSelector : '.portfolio-item',
			layoutMode : 'fitRows'
		});

		$portfolio_selectors.on('click', function(){
			$portfolio_selectors.removeClass('active');
			$(this).addClass('active');
			var selector = $(this).attr('data-filter');
			$portfolio.isotope({ filter: selector });
			return false;
		});
	});

	// Contact form
	var form = $('#main-contact-form');
	form.submit(function(event){
		event.preventDefault();
		var form_status = $('<div class="form_status"></div>');
		$.ajax({
			url: $(this).attr('action'),

			beforeSend: function(){
				form.prepend( form_status.html('<p><i class="fa fa-spinner fa-spin"></i> Email is sending...</p>').fadeIn() );
			}
		}).done(function(data){
			form_status.html('<p class="text-success">' + data.message + '</p>').delay(3000).fadeOut();
		});
	});


	//goto top
	$('.gototop').click(function(event) {
		event.preventDefault();
		$('html, body').animate({
			scrollTop: $("body").offset().top
		}, 500);
	});

	//Pretty Photo
	$("a[rel^='prettyPhoto']").prettyPhoto({
		social_tools: false
	});
});




$(function(){
	var g = {};
	g.phone = "";
	g.imgCodeId = "";
	g.sendCode = false;
	g.sendCode2 = false;
	g.sendTime = 60;
	g.username = Base.userName;
	g.token = Utils.offLineStore.get("token",false);
	g.page = Utils.getQueryString("p") - 0;
	g.totalPage = 1;
	g.currentPage = 1;
	g.paseSize = 20;
	g.httpTip = new Utils.httpTip({});
	g.listdata = [];
	g.userprofile = Utils.offLineStore.get("login_userprofile",false) || "";
	//验证登录状态
	g.loginStatus = Utils.getUserInfo();
	g.reserveStatus = false;
	if(g.loginStatus && g.userprofile !== ""){
		var obj = JSON.parse(g.userprofile);
		var name = obj.realName || "";
		var mobile = obj.mobile || "";
		if(name !== "" && mobile !== ""){
			//允许预约
			g.reserveStatus = true;
		}
		else{
			g.reserveStatus = false;
		}
		$("#name").val(name);
		$("#phone").val(mobile);

		$("#name2").val(name);
		$("#phone2").val(mobile);

		getImgCode();
		getImgCode2();
	}

	$("#phone").bind("blur",getImgCode);
	$("#imgcodebtn").bind("click",getImgCode);
	$("#getcodebtn").bind("click",getValidCode);
	$("#reservebtn").bind("click",reserverBtnUp);

	$("#phone2").bind("blur",getImgCode2);
	$("#imgcodebtn2").bind("click",getImgCode2);
	$("#getcodebtn2").bind("click",getValidCode2);
	$("#reservebtn2").bind("click",reserverBtnUp2);

	$("#provId").bind("change",getProvCity);
	$("#provId2").bind("change",getProvCity2);

	getAppointCategory();
	getProv();
	getPackages();
	function getProvCity(){
		var id = $(this).val();
		getCity(id,1);
	}
	function getProvCity2(){
		var id = $(this).val();
		getCity(id,2);
	}
	//获取字典
	function getAppointCategory(){
		var url = Base.categoryUrl + "/appoint";
		g.httpTip.show();
		$.ajax({
			url:url,
			data:{},
			type:"GET",
			dataType:"json",
			context:this,
			global:false,
			success: function(data){
				console.log("getAppointCategory",data);
				var status = data.status || "";
				if(status == "OK"){
					changeSelectHtml("typeid",data.result || []);
					changeSelectHtml("typeid2",data.result || []);
				}
				else{
					Utils.alert("预约类别获取失败");
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
	function getProv(){
		var url = Base.cityUrl + "/PROV";
		g.httpTip.show();
		$.ajax({
			url:url,
			data:{},
			type:"GET",
			dataType:"json",
			context:this,
			global:false,
			success: function(data){
				console.log("getProv",data);
				var status = data.status || "";
				if(status == "OK"){
					changeSelectHtml("provId",data.result || []);
					changeSelectHtml("provId2",data.result || []);
					var id = data.result[0].id;
					getCity(id,0);
				}
				else{
					Utils.alert("城市获取失败");
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
	function getCity(id,b){
		var url = Base.subareasUrl + "/" + id;
		g.httpTip.show();
		$.ajax({
			url:url,
			data:{},
			type:"GET",
			dataType:"json",
			context:this,
			global:false,
			success: function(data){
				console.log("getCity",data);
				var status = data.status || "";
				if(status == "OK"){
					switch(b){
						case 0:
							changeSelectHtml("cityId",data.result || []);
							changeSelectHtml("cityId2",data.result || []);
						break;
						case 1:
							changeSelectHtml("cityId",data.result || []);
						break;
						case 2:
							changeSelectHtml("cityId2",data.result || []);
						break;
					}
				}
				else{
					Utils.alert("城市获取失败");
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
	function changeSelectHtml(domid,data){
		var option = [];
		for(var i = 0,len = data.length; i < len; i++){
			var id = data[i].id || "";
			var name = data[i].name || "";
			option.push('<option value="' + id + '"' + ( i == 0 ? "selected" : "") + '>' + name + '</option>');
		}
		$("#" + domid).html(option.join(''));
	}


	//获取图形验证码
	function getImgCode(evt){
		var phone = $("#phone").val() || "";
		if(phone !== ""){
			console.log(phone);
			g.imgCodeId = phone;
			$("#imgcodebtn").attr("src",Base.imgCodeUrl + "?id=" + g.imgCodeId);
		}
	}

	function getImgCode2(evt){
		var phone = $("#phone2").val() || "";
		if(phone !== ""){
			console.log(phone);
			g.imgCodeId = phone;
			$("#imgcodebtn2").attr("src",Base.imgCodeUrl + "?id=" + g.imgCodeId);
		}
	}

	//获取验证码
	function getValidCode(evt){
		//var ele = evt.currentTarget;
		//$(ele).removeClass("curr");
		//if(!this.moved){}
		var p = $("#phone").val() || "";
		var imgCode = $("#inputImgCode3").val() || "";
		if(p !== ""){
			var reg = /^1[3,5,7,8]\d{9}$/g;
			if(reg.test(p)){
				if(imgCode !== ""){
					g.phone = p;
					if(!g.sendCode){
						sendGetCodeHttp(imgCode);
					}
				}
				else{
					Utils.alert("输入图形验证码");
					$("#inputImgCode3").focus();
				}
			}
			else{
				Utils.alert("手机输入不合法");
				$("#phone").focus();
			}
		}
		else{
			Utils.alert("请输入手机号");
			$("#phone").focus();
		}
	}

	function getValidCode2(evt){
		var ele = evt.currentTarget;
		//$(ele).removeClass("curr");
		//if(!this.moved){}
		var p = $("#phone2").val() || "";
		var imgCode = $("#inputImgCode32").val() || "";
		if(p !== ""){
			var reg = /^1[3,5,7,8]\d{9}$/g;
			if(reg.test(p)){
				if(imgCode !== ""){
					g.phone = p;
					if(!g.sendCode){
						sendGetCodeHttp2(imgCode);
					}
				}
				else{
					Utils.alert("输入图形验证码");
					$("#inputImgCode32").focus();
				}
			}
			else{
				Utils.alert("手机输入不合法");
				$("#phone2").focus();
			}
		}
		else{
			Utils.alert("请输入手机号");
			$("#phone2").focus();
		}
	}

	//重新获取验证码
	function resetGetValidCode(){
		g.sendTime = g.sendTime - 1;
		if(g.sendTime > 0){
			$("#getcodebtn").html(g.sendTime + "秒后重新发送");
			setTimeout(function(){
				resetGetValidCode();
			},1000);
		}
		else{
			$("#getcodebtn").html("重新发送");
			g.sendTime = 60;
			g.sendCode = false;

			//重新获取图形验证码,1分钟有效
			getImgCode();
			$("#inputImgCode3").val("");
			$("#inputImgCode3").focus();
		}
	}

	function resetGetValidCode2(){
		g.sendTime = g.sendTime - 1;
		if(g.sendTime > 0){
			$("#getcodebtn2").html(g.sendTime + "秒后重新发送");
			setTimeout(function(){
				resetGetValidCode2();
			},1000);
		}
		else{
			$("#getcodebtn2").html("重新发送");
			g.sendTime = 60;
			g.sendCode2 = false;

			//重新获取图形验证码,1分钟有效
			getImgCode2();
			$("#inputImgCode32").val("");
			$("#inputImgCode32").focus();
		}
	}

	function reserverBtnUp(){
		if(g.loginStatus){
			if(!g.reserveStatus){
				//没有添加真实姓名,引导去填写
				alert("个人资料不完善,无法预约");
				location.href = "c_my.html?token=" + g.token + "&p=1";
				return;
			}
			var condi = {};
			/*
			token:用户凭据
			typeId:预约类别（字典类型名称：appoint）
			cityId:城市id，通过area相关接口获取
			mobile:电话号码，暂时这个字段不需要传，会默认使用用户绑定手机号码
			realName:用户真实姓名
			validater:根据用户绑定手机号码，发送的短信验证码
			*/
			condi.token = g.token;
			condi.typeId = $("#typeid").val() || "";
			condi.cityId = $("#cityId").val() || "";
			condi.realName = $("#name").val() || "";
			condi.mobile = $("#phone").val() || "";
			condi.captcha = $("#inputImgCode3").val() || "";
			condi.validater = $("#msgcode").val() || "";

			if(condi.name !== ""){
				if(condi.mobile !== ""){
					var reg = /^1[3,5,7,8]\d{9}$/g;
					if(reg.test(condi.mobile)){
						if(condi.captcha !== ""){
							if(condi.msgcode !== ""){
								sendAppointHttp(condi);
							}
							else{
								Utils.alert("输入短信验证码");
								$("#msgcode").focus();
							}
						}
						else{
							Utils.alert("输入图形验证码");
							$("#inputImgCode3").focus();
						}
					}
					else{
						Utils.alert("手机输入不合法");
						$("#phone").focus();
					}
				}
				else{
					Utils.alert("请输入手机号");
					$("#phone").focus();
				}
			}
			else{
				Utils.alert("请输入姓名");
				$("#name").focus();
			}
		}
		else{
			location.href = "login.html";
		}
	}

	function reserverBtnUp2(){
		if(g.loginStatus){
			if(!g.reserveStatus){
				//没有添加真实姓名,引导去填写
				alert("个人资料不完善,无法预约");
				location.href = "c_my.html?token=" + g.token + "&p=1";
				return;
			}
			var condi = {};
			/*
			token:用户凭据
			typeId:预约类别（字典类型名称：appoint）
			cityId:城市id，通过area相关接口获取
			mobile:电话号码，暂时这个字段不需要传，会默认使用用户绑定手机号码
			realName:用户真实姓名
			validater:根据用户绑定手机号码，发送的短信验证码
			*/
			condi.token = g.token;
			condi.typeId = $("#typeid2").val() || "";
			condi.cityId = $("#cityId2").val() || "";
			condi.name = $("#name2").val() || "";
			condi.mobile = $("#phone2").val() || "";
			condi.captcha = $("#inputImgCode32").val() || "";
			condi.validater = $("#msgcode2").val() || "";

			if(condi.name !== ""){
				if(condi.mobile !== ""){
					var reg = /^1[3,5,7,8]\d{9}$/g;
					if(reg.test(condi.mobile)){
						if(condi.captcha !== ""){
							if(condi.msgcode !== ""){
								sendAppointHttp2(condi);
							}
							else{
								Utils.alert("输入短信验证码");
								$("#msgcode2").focus();
							}
						}
						else{
							Utils.alert("输入图形验证码");
							$("#inputImgCode32").focus();
						}
					}
					else{
						Utils.alert("手机输入不合法");
						$("#phone2").focus();
					}
				}
				else{
					Utils.alert("请输入手机号");
					$("#phone2").focus();
				}
			}
			else{
				Utils.alert("请输入姓名");
				$("#name2").focus();
			}
		}
		else{
			location.href = "login.html";
		}
	}


	//请求验证码
	function sendGetCodeHttp(imgCode){
		var url = Base.getCodeUrl;
		var condi = {};
		condi.mobile = g.phone;
		condi.captcha = imgCode;
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			global:false,
			success: function(data){
				console.log(data);
				var status = data.status || "";
				if(status == "OK"){
					g.sendCode = true;
					$("#getcodebtn").html("60秒后重新发送");
					setTimeout(function(){
						resetGetValidCode();
					},1000);
				}
				else{
					alert("验证码获取失败");
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function sendGetCodeHttp2(imgCode){
		var url = Base.getCodeUrl;
		var condi = {};
		condi.mobile = g.phone;
		condi.captcha = imgCode;
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			global:false,
			success: function(data){
				console.log(data);
				var status = data.status || "";
				if(status == "OK"){
					g.sendCode2 = true;
					$("#getcodebtn2").html("60秒后重新发送");
					setTimeout(function(){
						resetGetValidCode2();
					},1000);
				}
				else{
					alert("验证码获取失败");
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}


	function sendAppointHttp(condi){
		var url = Base.appointUrl;
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			global:false,
			success: function(data){
				console.log("sendAppointHttp",data);
				var status = data.status || "";
				if(status == "OK"){
					Utils.alert("预约服务成功");
				}
				else{
					Utils.alert("预约服务失败");
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function sendAppointHttp2(condi){
		var url = Base.appointUrl;
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			global:false,
			success: function(data){
				console.log("sendAppointHttp2",data);
				var status = data.status || "";
				if(status == "OK"){
					Utils.alert("预约服务成功");
				}
				else{
					Utils.alert("预约服务失败");
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}


	function getPackages(){
		var url = Base.packagesUrl;
		var condi = {};
		condi.token = g.token;
		condi.page = 1;
		condi.size = 10;
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"GET",
			dataType:"json",
			context:this,
			global:false,
			success: function(data){
				console.log("getPackages",data);
				var status = data.status || "";
				if(status == "OK"){
					changePackageList(data.result.result);
				}
				else{
					Utils.alert("套餐列表获取失败");
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function changePackageList(data){
		var html = [];

		html.push('<div class="center wow fadeInDown">');
		html.push('<h2>家装套餐 <span style="font-size:24px">Home Renovation Packages</span></h2>');
		html.push('<p class="lead">2015年6月10日上午10时开放，首期2000套，先到先得。简装、精装、旧居智能改造全系优惠</p>');
		html.push('</div>');

		html.push('<div class="row">');

		for(var i = 0,len = data.length; i < len; i++){
			var obj = data[i];
			var id = obj.id || "";
			var price = obj.price || "";
			var decorate = obj.decorate || "";
			var description = obj.description || "";
			var status = obj.status || "";
			var inStock = obj.inStock - 0 || 0;
			var saleNumber = obj.saleNumber - 0 || 0;
			var scrambleStartTime = obj.scrambleStartTime || "";
			var scrambleEndTime = obj.scrambleEndTime || "";
			var hasAppointed = obj.hasAppointed || false;
			//status = "SCRAMBLE";
			html.push('<div class="col-md-4 col-sm-6 wow fadeInDown" data-wow-duration="1000ms" data-wow-delay="600ms">');
			html.push('<div class="feature-wrap" style="height:240px;">');
			html.push('<h3>');
			html.push('<span style="font-weight:600;color:#666">RMB</span>&nbsp;&nbsp;');
			html.push('<span style="color:#000;font-size:24px;font-weight:600">' + price + '</span>');
			html.push('<span style="color:#000;font-weight:800;">元/平米</span>');
			html.push('<span style="font-weight:800;color:#000">【' + decorate + '】</span>');
			html.push('</h3>');
			html.push('<h3 style="margin:-5px 0 0 0;">');
			html.push('<span style="color:#999;font-size:14px;line-height:12px;">' + description + '</span>');
			html.push('</h3>');
			html.push('<div style="margin:20px 0 10px 70px;">');

			if(status == "PREPARE"){
				html.push('<div style="height:45px;width:160px;background:none;border:1px solid #ccc;-moz-border-radius:7px;-webkit-border-radius:7px;border-radius:7px;">');
				html.push('<a href="javascript:void(0);">');
				html.push('<div style="text-align:center;line-height:45px;font-size:16px;color:#000;">即将开始</div>');
				html.push('</a>');
				html.push('</div>');

				html.push('</div>');
				html.push('<div style="text-align:center;line-height:14x;font-size:14px;color:#000;">');
				html.push('<span style="color:#999">抢购开始时间：</span>' + scrambleStartTime);
				html.push('</div>');
			}
			else if(status == "SCRAMBLE" && inStock > saleNumber){
				html.push('<div style="height:45px;width:160px;background:orange;-moz-border-radius:7px;-webkit-border-radius:7px;border-radius:7px;">');
				if(hasAppointed){
					html.push('<a href="javascript:miaoSha(\'' + id + '\')">');
				}
				else{
					if(g.loginStatus){
						var page = price + ".html?id=" + id;
						html.push('<a href="javascript:alert(\'你还没有预约\');location.href=\'' + page + '\'">');
					}
					else{
						var page = "login.html";
						html.push('<a href="javascript:alert(\'请先登录\');location.href=\'' + page + '\'">');
					}
				}
				html.push('<div style="text-align:center;line-height:45px;font-size:16px;color:#000;">立即抢购</div>');
				html.push('</a>');
				html.push('</div>');

				html.push('</div>');
				html.push('<div style="text-align:center;line-height:14x;font-size:14px;color:#000;">');
				html.push('<span style="color:#999">剩余数量：</span>' + saleNumber + '套 / 共' + inStock + '套');
				html.push('</div>');
			}
			else{
				html.push('<div style="height:45px;width:160px;background:none;border:1px solid #ccc;-moz-border-radius:7px;-webkit-border-radius:7px;border-radius:7px;">');
				html.push('<a href="javascript:void(0);">');
				html.push('<div style="text-align:center;line-height:45px;font-size:16px;color:#000;">已抢完</div>');
				html.push('</a>');
				html.push('</div>');

				html.push('</div>');
				html.push('<div style="text-align:center;line-height:14x;font-size:14px;color:#000;">');
				html.push('<span style="color:#999">下次开放时间：</span>2015年6月20日上午10时');
				html.push('</div>');
			}


			html.push('</div>');
			html.push('<div style="height:240px;width:360px;">');
			if(price == 499){
				html.push('<img src="images/u_1.jpg" width=360 height=240>');
			}
			else if(price == 699){
				html.push('<img src="images/u_2.jpg" width=360 height=240>');
			}
			else{
				html.push('<img src="images/u_3.jpg" width=360 height=240>');
			}
			html.push('</div>');
			html.push('</div>');
		}

		$("#packagelist").html(html.join(''));
		$("#packagelist").show();
	}

	function miaoSha(id){
		var url = Base.scramble;
		var condi = {};
		condi.token = g.token;
		condi.id = id;
		condi.caseId = "";
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			global:false,
			success: function(data){
				console.log("miaoSha",data);
				var status = data.status || "";
				if(status == "OK"){
					Utils.alert("抢购成功");
					var orderId = data.result.id;
					location.href = "orderback_paysel.html?id=" + orderId;
				}
				else{
					Utils.alert("抢购失败");
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	window.miaoSha = miaoSha;
});









