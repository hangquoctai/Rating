
	var mainUrl = 'https://product-reviews.apps.f1gen.com'; 
	var objConfig = null;
	var orgidShop = null;

	/* Get Config and ShopID First */
	$.get('{{shop.url}}/meta.json').done(function (data) {
		orgidShop = parseInt(data.id);
		$.ajax({
			url: `${mainUrl}/admin/api/config/list?orgid=${data.id}`,
			type: "GET",
			crossDomain: true,
			beforeSend: function(req) {
				//req.setRequestHeader("User-Agent", "chrome extension");
				req.setRequestHeader("x-amazon-user-agent", "chrome extension");
			},
			contentType: 'application/json',
			dataType: "json",
			success: function (response) {
				objConfig = response.data;
				$('.boxReview').before(`<h2 class="titleBoxReview">${objConfig.headTitle}</h2>`);
				$('.selectReview i').removeClass('fa-star').addClass(`fa-${objConfig.imgReview}`)
				!objConfig.isUploadImg ? $('#selectedFileReview').parents('li').remove() : '';
				!objConfig.isAvatar ? $('.hasAvatar').removeClass('hasAvatar flexCenter').addClass('flexCenterAll').find('.uploadAvatar').remove() : '';
				if(objConfig.requireName >= 0){
					$('#nameReview').attr({
						'placeholder':objConfig.nameMemberReview,
						'required':objConfig.requireName==0?false:true,
					})
				}else{
					$('#nameReview').parents('div.item').hide();
				}
				if(objConfig.requireEmail >= 0){
					$('#emailReview').attr({
						'placeholder':objConfig.emailMemberReview,
						'required':objConfig.requireEmail==0?false:true,
					})
				}else{
					$('#emailReview').parents('div.item').hide();
				}
				if(objConfig.requirePhone >= 0){
					$('#phoneReview').attr({
						'placeholder':objConfig.phoneMemberReview,
						'required':objConfig.requirePhone==0?false:true,
					})
				}else{
					$('#phoneReview').parents('div.item').hide();
				}
				if(objConfig.useBanner){
					$('.boxReview').wrap('<div class="wrapConfigImage"></div>');
					$('.boxReview').after(`<img class="stickyImage" src="${mainUrl}/static/${objConfig.bannerImage}" alt="Banner Review">`);
				}else $('.pagination').removeClass('hasBanner');
			}
		})
	})
	$(document).ready(function () {
		$(".fancybox").fancybox();
		$('#selectedFileReview').imageUploader({
			imagesInputName: 'selectedFile',
			maxSize: 1 * 1024 * 1024,
			maxFiles: 3,
			label:"Upload Image"
		});
		$('#selectedFileAvatar').imageUploader({
			imagesInputName: 'selectedFile',
			label:"Upload Avatar"
		});
		function getName(string) {
			var names = string.split(' '),
					initials = names[0].substring(0, 1).toUpperCase();

			if (names.length > 1) {
				initials += names[names.length - 1].substring(0, 1).toUpperCase();
			}
			return initials;
		};
		function getData(ajaxurl) {
			return $.ajax({
				url: ajaxurl,
				type: 'GET',
				crossDomain: true,
				contentType: 'application/json',
				dataType: "json",
			});
		};
		function getPage(total, object) {
			$(object).html('');
			var htmlPae = '';
			for (var i = 1; i <= total; i++) {
				htmlPae += `<li><a href="javascript:void(0);" data-href=${mainUrl}/admin/api/review/list/{{product.id}}?orgid=${orgidShop}&page=${i}&size=${objConfig.numberPaginate}>${i}</a></li>`;
			}
			$(object).append(htmlPae);
		}
		function dataRender(res) {
			$('.boxReviewItem').html('');
			let dataNew = res.data;
			let dataPage = res.pages;
			$.each(dataNew, function (i, v) {
				if(v.status > 0){
					var options2 = {
						//weekday: "short",
						year: "numeric",
						month: "2-digit",
						day: "2-digit",
					};
					let dateString = new Date(v.createdAt).toLocaleString('vi-vn',options2);
					let html = ''
					if(v.fileImage && v.fileImage[0] != undefined) html += `<div class="row item"><div class="col-lg-2"><div class="text-center"><a class="fancybox avatarResult" data-fancybox href="${mainUrl}/static/${v.fileImage[0]}"><img width="100" src="${mainUrl}/static/${v.fileImage[0]}" alt="${v.title}"/></a><p class="margin-0"><strong>${v.name}</strong></p><p class="margin-0">${dateString}</p></div></div>`;
					else html += `<div class="row item"><div class="col-lg-2"><div class="text-center"><div class="flagUser">${getName(v.name)}</div><p class="margin-0"><strong>${v.name}</strong></p><p class="margin-0">${dateString}</p></div></div>`;
					html += `<div class="col-lg-10"><div class="reviewStarCount" data-count="${v.starCount}">`;
					for (var i = 0; i < 5; i++) {
						html += `<i class="fa disable fa-${objConfig.imgReview}"></i>`;
					}
					html += `<span style="margin-left:10px;font-size:15px;"><strong>${v.title == undefined ? '' : v.title}</strong></span></div>`;
					html += `<div><img width="15" src="https://frontend.tikicdn.com/_desktop-next/static/img/icons/guarantee.png" alt=""/><small style="color:rgb(92, 184, 92); margin-left:5px">Đã mua hàng</small></div>`;
					html += `<p>${v.description}</p>`;
					v.fileImage ? $.each(v.fileImage, function(index, data){
						index > 0 ? html += `<a class="fancybox imageReview" data-fancybox href="${mainUrl}/static/${data}"><img width="150" style="margin:0px 15px 10px 0px;" src="${mainUrl}/static/${data}" alt="${v.title}"/></a>` : '';
					}) : '';
					objConfig.isReply ? html += `<div><a class="replyReview">Trả lời</a>` : '';
					objConfig.isShare ? html += `<a class="shareReview">Chia sẻ Facebook</a></div>` : '';
					html += `<div id="replyMain">`
					v.reply ? $.each(v.reply, function(index, reply){
						let dateStringReply = new Date(reply.created).toLocaleString('vi-vn',options2);
						html += `<div class="replyItem"><p>- ${reply.description}</p><div class="flexCenterReply"><img style="margin-right:5px" width="20px" src="{{ 'favicon.png' | asset_url }}"><h4>${reply.title} <span style="margin-left:10px">${dateStringReply}</span></h4></div></div>`
					}) : '';
					html += `</div></div></div>`;
					/*objConfig.isGoodAnswer ? html += `<a class="goodReview">Nhận xét này hữu ích với bạn?</a>` : '';*/
					$('.boxReviewItem').append(html);
				}
				getPage(dataPage, '.pagination ul');
			});
			$('.boxReviewItem .item').each(function (i, v) {
				var flagLengthReview = $(this).find('.reviewStarCount').attr('data-count');
				$(this).find(`.reviewStarCount i:nth-child(-n+${flagLengthReview})`).removeClass('disable').css('color', `${objConfig.colorImgReview}`);
			})
		}
		function dataCheckStar(res) {
			let dataNew = res.data[0];
			if(dataNew != null){ 
				let averageRound = Math.floor(dataNew.ratingAverage);
				$('.filterReview').show();
				$('.pointReview').html(`${dataNew.ratingAverage}/5`);
				let flagStar = '';
				for (var i = 0; i < 5; i++) {
					flagStar += `<i class="fa fa-${objConfig.imgReview}"></i>`;
				}
				flagStar += `<div>(${dataNew.ratingCount} nhận xét)</div>`
				$('.starPoint').html(flagStar);
				if (dataNew.ratingAverage % 1 == 0){
					$(`.starPoint i:nth-child(-n+${dataNew.ratingAverage})`).css('color',`${objConfig.colorImgReview}`)
				}else{
					$(`.starPoint i:nth-child(-n+${averageRound})`).css('color',`${objConfig.colorImgReview}`)
					$(`.starPoint i:nth-child(${averageRound + 1})`).addClass('half')
					$("head").append(`
<style>
.starPoint i.activeOk{
color: ${objConfig.colorImgReview};
}
.starPoint i.half:after{
content: '${objConfig.imgReview == 'star' ? '\\f005' : '\\f004'}';
color: ${objConfig.colorImgReview};
position: absolute;
margin-left: ${objConfig.imgReview == 'star' ? '-19px' : '-20px'};
width: 10.5px;
overflow: hidden;	
}
	</style>`);
				}
				$('.onePoint').html(`<span>1 </span><i class="fa disable fa-${objConfig.imgReview}"></i><div class="percentFull"><span style="width:${dataNew.onePercent}%"></span></div><span>${dataNew.onePercent}%</span>`);
				$('.twoPoint').html(`<span>2 </span><i class="fa disable fa-${objConfig.imgReview}"></i><div class="percentFull"><span style="width:${dataNew.twoPercent}%"></span></div><span>${dataNew.twoPercent}%</span>`);
				$('.threePoint').html(`<span>3 </span><i class="fa disable fa-${objConfig.imgReview}"></i><div class="percentFull"><span style="width:${dataNew.threePercent}%"></span></div><span>${dataNew.threePercent}%</span>`);
				$('.fourPoint').html(`<span>4 </span><i class="fa disable fa-${objConfig.imgReview}"></i><div class="percentFull"><span style="width:${dataNew.fourPercent}%"></span></div><span>${dataNew.fourPercent}%</span>`);
				$('.fivePoint').html(`<span>5 </span><i class="fa disable fa-${objConfig.imgReview}"></i><div class="percentFull"><span style="width:${dataNew.fivePercent}%"></span></div><span>${dataNew.fivePercent}%</span>`);
				$('.filterRating[data-filter="starCount=1"]').html(`1 <i class="fa disable fa-star"></i> (${dataNew.fiveStar})`).attr('data-count',`${dataNew.fiveStar}`); 
				$('.filterRating[data-filter="starCount=2"]').html(`2 <i class="fa disable fa-star"></i> (${dataNew.fourStar})`).attr('data-count',`${dataNew.fourStar}`);
				$('.filterRating[data-filter="starCount=3"]').html(`3 <i class="fa disable fa-star"></i> (${dataNew.threeStar})`).attr('data-count',`${dataNew.threeStar}`);
				$('.filterRating[data-filter="starCount=4"]').html(`4 <i class="fa disable fa-star"></i> (${dataNew.twoStar})`).attr('data-count',`${dataNew.twoStar}`);
				$('.filterRating[data-filter="starCount=5"]').html(`5 <i class="fa disable fa-star"></i> (${dataNew.oneStar})`).attr('data-count',`${dataNew.oneStar}`);
				/*$('.filterImage').html(`Có hình ảnh (${haveImage})`).attr('data-count',`${haveImage}`);*/
			}else{
				$('.pointReview').html('0/5');
				let flagStar = '';
				for (var i = 0; i < 5; i++) {
					flagStar += `<i class="fa fa-${objConfig.imgReview}"></i>`;
				}
				flagStar += `<div>(0 nhận xét)</div>`
				$('.starPoint').html(flagStar);
				$('.percentReview').html('<h4 class="text-center">Hiện sản phẩm này chưa có đánh giá nào hết, hãy là người đầu tiên đánh giá sản phẩm này</h4>')
			}
		}
		var initApp = setInterval(myApp, 500);
		function myApp() {
			if(objConfig != null){
				getData(`${mainUrl}/admin/api/review/list/{{product.id}}?orgid=${orgidShop}&page=1&size=${objConfig.numberPaginate}`).then(function (res) {   
					dataRender(res);
				})
				getData(`${mainUrl}/admin/api/product/list/{{product.id}}?orgid=${orgidShop}`).then(function (res) {
					dataCheckStar(res);
				});
				clearInterval(initApp);
			}

		}
		setTimeout(function(){
			clearInterval(initApp);
		},5000)
		$(document).on('click', '.pagination ul li a', function () {
			getData($(this).data('href')).then(function (res) {
				dataRender(res);
			})
		})
		$(document).on('click', '.writeReviewButton:not(.active)', function () {
			$('.formReview').slideToggle();
		});
		let flagActiveOk = $('.selectReview i.activeOk').length;
		$('.selectReview i').mouseover(function (e) {
			let flagTarget = e.target.getAttribute('number');
			$('.selectReview i').removeClass('activeOk');
			$(`.selectReview i:nth-child(-n + ${flagTarget})`).removeClass('disable').addClass('active').css('color',`${objConfig.colorImgReview}`)
		})
		$('.selectReview i').mouseout(function (e) {
			let flagTarget = e.target.getAttribute('number');
			$('.selectReview i').removeClass('active').addClass('disable');
			$(`.selectReview i:nth-child(-n + ${flagActiveOk})`).addClass('activeOk');
		})
		$(document).on('click', '.selectReview i', function (e) {
			let flagTarget = e.target.getAttribute('number');
			$(`.selectReview i:nth-child(-n + ${flagTarget})`).addClass('activeOk');
			flagActiveOk = flagTarget;
		})
		$(document).on('click', '.filterRating', function () {
			var flagQuery = $(this).attr('data-filter');
			var flagCheck = $(this).attr('data-count');
			if(flagCheck > 0){
				getData(`${mainUrl}/admin/api/reviews/search/starCount?${flagQuery}&page=1&size=${objConfig.numberPaginate}`).then(function (res) {
					dataRender(res);
				});
			}else{
				swal("Oh no", "Kết quả tìm kiếm không có!", "error");
			}
		})
		$('#uploadReview').submit(function (e) {
			e.preventDefault();
			$('#errorList').html('');
			let parseProductId = parseInt('{{product.id}}')
			let formData = new FormData(this);
			formData.append('orgid', orgidShop)
			formData.append('productId', parseProductId)
			formData.append('productName', '{{product.title}}')
			formData.append('productImage', '{{ product.featured_image | product_img_url : "large"}}')
			formData.append('productUrl', '{{shop.url}}{{product.url}}')
			formData.append('name', $(this).find('input#nameReview').val() != '' ? $(this).find('input#nameReview').val() : 'Khách hàng')
			formData.append('email', $(this).find('input#emailReview').val() != '' ? $(this).find('input#emailReview').val() : 'support@f1gen.com')
			formData.append('phone', $(this).find('input#phoneReview').val() != '' ? $(this).find('input#phoneReview').val() : '0972340417')
			formData.append('title', $(this).find('input#titleReview').val())
			formData.append('description', $(this).find('textarea#descriptionReview').val())
			/*for(var x = 0; x < $('#selectedFileReview input').prop('files').length; x++) {
							debugger;
        			formData.append('selectedFile', $('#selectedFileReview input').prop('files')[x]);
    				}*/
			//formData.append('selectedFile', ( != undefined ? $('input#selectedFileReview').prop('files') : File))
			formData.append('status', objConfig.checkStatus ? -1 : 1)  
			formData.append('starCount', $(`#uploadReview i.fa.fa-${objConfig.imgReview}.activeOk`).length)
			if($(`#uploadReview i.fa.fa-${objConfig.imgReview}.activeOk`).length > 0){
				$.ajax({
					type: "POST",
					url: `${mainUrl}/admin/api/review/create`,
					data: formData,
					contentType: false,
					processData: false,
					success: function (data) {
						swal("Good!", "Đánh giá của bạn đã được đăng và chờ duyệt bởi quản trị viên!", "success");
					},
					error: function (e) {
						swal("Oh no!", "Vui lòng kiểm tra đầy đủ lại các trường thông tin!", "error");
						$.each(e.responseJSON.errors,function(i, v){
							$('#errorList').append(`<p style="color:red">* ${v.msg}</p>`) 
						})
					}
				});
			}else{
				swal("Oh no", "Vui lòng kiểm tra đầy đủ lại các trường thông tin!", "error");
			}
		})
	});
