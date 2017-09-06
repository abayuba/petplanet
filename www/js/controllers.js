angular.module('app.controllers', [])

.controller('AppCtrl', function($scope, $rootScope, $state, $ionicPlatform, $cordovaDialogs, $timeout, $ionicLoading, $ionicSideMenuDelegate, $state, WC, Shop, Dict, Language, AuthService){
  $scope.appname    = Shop.name;
  $scope.appversion = Shop.version;
  $scope.homeSlider = Shop.homeSlider;

  $rootScope.Dict = Dict[Language.getLang()];

	/* GET APP INFO */
    $ionicLoading.show();
	WC.api().get('', function(err, data, res){
        console.log(JSON.parse(res).store);
        $scope.store   = JSON.parse(res).store;
        $scope.format  = Shop.CurrencyFormat ? $scope.store.meta.currency_format : $scope.store.meta.currency;
        $scope.decimal = $scope.store.meta.price_num_decimals;
    });

	/* END APP INFO */

    /* RATE APP */
    $scope.rateApp = function(){
        document.addEventListener("deviceready", function () {
            AppRate.preferences.useLanguage = 'en';
            var popupInfo = {};
            popupInfo.title = Shop.name;
            popupInfo.message = "You like "+Shop.name+" We would be glad if you share your experience with others. Thanks for your support!";
            popupInfo.cancelButtonLabel = "No, thanks";
            popupInfo.laterButtonLabel = "Remind Me Later";
            popupInfo.rateButtonLabel = "Rate Now";
            AppRate.preferences.customLocale = popupInfo;

            AppRate.preferences.usesUntilPrompt = 1;
            AppRate.preferences.promptAgainForEachNewVersion = true;
            AppRate.preferences.openStoreInApp = true;
            AppRate.preferences.storeAppURL.ios = '849930087';
            AppRate.preferences.storeAppURL.android = 'market://details?id=ionstore.ionicpremium.app';

            AppRate.promptForRating(true);

        }, false);
    }

    /* END RATE APP */

	/* GET CATEGORY & SUB CATEGORY */
	var tmp = [];
	WC.api().get('products/categories', function(err, data, res){
		var p = JSON.parse(res).product_categories;
        //console.log(p);
		for(var i in p){
		    if(p[i].parent==0){
		        var items = [];
		        for(var y in p){
		            if(p[y].parent==p[i].id)
		                items.push({id: p[y].id, name: p[y].name, slug: p[y].slug, image: p[y].image, count: p[y].count});
		        }
		        tmp.push({id: p[i].id, name: p[i].name, slug: p[i].slug, image: p[i].image, items: items});
		    }
		}
        $ionicLoading.hide();
	})

	$scope.categories = tmp;

	/* END GET CATEGORY & SUB CATEGORY */

	$scope.updateCart = function(){
        var cart = window.localStorage.getItem(Shop.name+"-cart") ? JSON.parse(window.localStorage.getItem(Shop.name+"-cart")) :'';
        if(cart.length>0){
            $scope.totalCartItem = 0;
            for(var i in cart)
                $scope.totalCartItem += cart[i].qty;
        }else  $scope.totalCartItem = 0;
    };

	$scope.user = {
		id: AuthService.id(),
		username: AuthService.username(),
		email: AuthService.email(),
		name: AuthService.name(),
		isLogin: AuthService.isAuthenticated()
	};

    $scope.$on('$stateChangeSuccess', function() {
      $scope.updateCart();

      $scope.user = {
        id: AuthService.id(),
        username: AuthService.username(),
        email: AuthService.email(),
        name: AuthService.name(),
        isLogin: AuthService.isAuthenticated()
      };
    });

    $scope.showSuccess = function(x, time){
        var time = time ? time : 2000;
        $ionicLoading.show({
            template: '<div class="info"><i class="icon ok ion-ios-checkmark"></i></div><div>'+x+'</div>'
        });
        $timeout(function() {
            $ionicLoading.hide();
        }, time);
    };

    $scope.showError = function(x, time){
        var time = time ? time : 4000;
        $ionicLoading.show({
            template: '<div class="info"><i class="icon err ion-sad-outline"></i></div><div>'+x+'</div>'
        });
        $timeout(function() {
            $ionicLoading.hide();
        }, time);
    };

    $scope.doLogout = function(){
      AuthService.logout();
      $scope.user.isLogin = false;
      $ionicSideMenuDelegate.toggleLeft();
      $state.go("app.dash", {}, {reload: true});
    };

    $ionicPlatform.registerBackButtonAction(function(e) {
      e.preventDefault();
      if($state.is('app.dash') || $state.is('app.orders') || $state.is('app.login') || $state.is('app.about') || $state.is('app.faq') || $state.is('app.contact')) {
        e.stopPropagation();
        $cordovaDialogs.confirm($rootScope.Dict.TXT_EXIT, 'Exit '+Shop.name, [$rootScope.Dict.TXT_YES, $rootScope.Dict.TXT_NO])
          .then(function(buttonIndex) {
            // no button = 0, 'OK' = 1, 'Cancel' = 2
            var btnIndex = buttonIndex;
            if(btnIndex==1)
              ionic.Platform.exitApp();
            else
              return false;
          });
      }else
          navigator.app.backHistory();
    },100);

	$scope.toggleGroup = function(group) {
		if ($scope.isGroupShown(group)) {
		  $scope.shownGroup = null;
		} else {
		  $scope.shownGroup = group;
		}
	};

	$scope.isGroupShown = function(group) {
		return $scope.shownGroup === group;
	};

	ionic.material.ink.displayEffect();
})

.controller('HomeCtrl', function($scope, $timeout, $ionicSlideBoxDelegate, $ionicLoading, $ionicScrollDelegate, $rootScope, Dict, WC, Shop, Language, Data){
	$scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        viewData.enableBack = false;
    });

    $scope.more = false;
	var page = 1;

	$ionicLoading.show();

    if(Shop.homeSlider){
        Data.get('/api/slides.php')
        .then(function(x){
            $scope.slides = x;
            $ionicSlideBoxDelegate.update();
        }, function(x){
            $scope.showError($rootScope.Dict.TXT_CHECK_CONNECT);
        });
    }

    $scope.doRefresh = function(){
        page = 1;
    	WC.api().get('products?page='+page+'&fields=id,title,price,regular_price,on_sale,in_stock,featured_src', function(err, data, res){
    		if(err) console.log(err);
    		$scope.products = JSON.parse(res).products;
    		if(JSON.parse(res).products.length >= 10) $scope.more = true;
    		$ionicLoading.hide();
            $ionicScrollDelegate.resize();
            $scope.$broadcast('scroll.refreshComplete');
    	})
    }

    $scope.doRefresh();

	$scope.loadMore = function(){
		page++;
		WC.api().get('products?page='+page+'&fields=id,title,price,regular_price,on_sale,in_stock,featured_src', function(err, data, res){
            $timeout(function(){
                if(JSON.parse(res).products.length < 10)
                    $scope.more = false;
  			   $scope.products = $scope.products.concat(JSON.parse(res).products);
  			   $scope.$broadcast('scroll.infiniteScrollComplete');
            });
    	})
	}

  ionic.material.ink.displayEffect();
})

.controller('QuickSearchCtrl', function($scope, $timeout, $ionicLoading, $ionicScrollDelegate, WC){

    $scope.pro = '';

    $scope.onSwipe = function() {
        cordova.plugins.Keyboard.close();
    };

    //cordova.plugins.Keyboard.show();

    if (window.cordova && window.cordova.plugins.Keyboard)
        cordova.plugins.Keyboard.show();

    $scope.clearSearch = function(){
        $scope.pro = '';
        $ionicScrollDelegate.scrollTop();
        if (window.cordova && window.cordova.plugins.Keyboard)
            cordova.plugins.Keyboard.close();
    };

    $scope.search = function(){
        if($scope.search.q){
            $scope.quickSearch();
        }else
            return false;
    };

    /*WC.api().get('products?fields=id,title', function(err, data, res){
        $scope.dataSearch = JSON.parse(res).products;
    });*/

    $scope.$watch('pro', function(newValue) {
      if(newValue) {
          $scope.dataSearch = '';
          WC.api().get('products?filter[q]='+newValue+'&fields=id,title', function(err, data, res){
              $timeout(function(){
                $scope.dataSearch = JSON.parse(res).products;
              })
          });
      }
    })

    ionic.material.ink.displayEffect();
})

.controller('WishCtrl', function($scope, $cordovaToast, $rootScope, Dict, Shop){
  $scope.wish = window.localStorage.getItem(Shop.name+'-wish') ? JSON.parse(window.localStorage.getItem(Shop.name+'-wish')) : [];

  $scope.data = {
    showDelete: false
  }

  console.log($scope.wish);

  $scope.removeWish = function(i, x){
    $scope.wish.splice(i, 1);
    window.localStorage.setItem(Shop.name+"-wish", JSON.stringify($scope.wish));
    $cordovaToast.showLongBottom($rootScope.Dict.WISH_REMOVE).then(function(){}, function(){});
  }

  ionic.material.ink.displayEffect();
})

.controller('BlogCtrl', function($scope, $ionicScrollDelegate, $ionicLoading, $rootScope, Dict, Blog, Shop){
    $scope.more = false;
    var page = 1;
    $ionicLoading.show();
    $scope.doRefresh = function(){
        Blog.get(Shop.URL+'/api/get_recent_posts/?page=1')
        .then(function(x){
            if(x.status!='ok'){
                $scope.showError($rootScope.Dict.TXT_CHECK_CONNECT);
                return false;
            }
            $scope.blog = x.posts;
            if(x.pages>1) $scope.more = true;
            $ionicScrollDelegate.resize();
            $scope.$broadcast('scroll.refreshComplete');
            $ionicLoading.hide();
        }, function(err){
            console.log(err);
        });
    };

    $scope.doRefresh();

    $scope.loadMore = function(){
        page++;
        Blog.get(Shop.URL+'/api/get_recent_posts/?page='+page)
        .then(function(x){
            if(x.count==0) $scope.more = false;
            $scope.blog.concat(x.posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }, function(err){
            $scope.showError($rootScope.Dict.TXT_CHECK_CONNECT);
        });
    };

    ionic.material.ink.displayEffect();
})

.controller('BlogDetailCtrl', function($scope, $stateParams, $ionicLoading, $state, $rootScope, Dict, Shop, Blog){
    $ionicLoading.show();
    Blog.get(Shop.URL+'/api/get_post?id='+$stateParams.id)
        .then(function(x){
            $scope.data = x.post;
            $ionicLoading.hide();
        }, function(err){
            $scope.showError($rootScope.Dict.TXT_CHECK_CONNECT);
        });

    ionic.material.ink.displayEffect();
})

.controller('ProductCtrl', function($scope, $state, $timeout, $filter, $cordovaToast, $cordovaSocialSharing, $window, $ionicModal, $ionicLoading, $ionicSlideBoxDelegate, $ionicScrollDelegate, $stateParams, $rootScope, Dict, WC, Shop){
  var wish = window.localStorage.getItem(Shop.name+'-wish');

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        viewData.enableBack = true;
    });

	var id = $stateParams.id;

	$ionicLoading.show();

	WC.api().get('products/'+id+'?fields=id,title,permalink,featured_src,attributes,description,images,on_sale,price,regular_price,in_stock,related_ids,sale_price,short_description,total_sales,variations', function(err, data, res){
		if(err) console.log(err);
		$timeout(function(){
      $scope.product = JSON.parse(res).product;
      $ionicLoading.hide();
  		$ionicSlideBoxDelegate.update();
    });
	});

	$scope.setVariation = function(x){
		$scope.product.id = x.id;
        $scope.product.price = x.price;
        $scope.product.regular_price = x.regular_price;
        $scope.product.on_sale = x.on_sale;
        if(x.image)
            $scope.product.images = x.image;
        $scope.product.name = x.attributes[0].name;
        $scope.product.option = x.attributes[0].option;
        $scope.product.in_stock = x.in_stock;

        $ionicSlideBoxDelegate.update();
        $ionicScrollDelegate.scrollTop();
    };

    $scope.addItem = function(x, qty){
        var cart = window.localStorage.getItem(Shop.name+"-cart");
        if(cart){
            var exist = false;
            cart = JSON.parse(cart);
            for(i in cart){
                if(cart[i].id == x.id){
                    exist = true;
                    cart[i].qty = cart[i].qty+qty;
                    window.localStorage.setItem(Shop.name+"-cart", JSON.stringify(cart));
                    $scope.showSuccess($rootScope.Dict.PRODUCT_ADDED);
                    $scope.updateCart();
                    break;
                }
            }
            if(!exist){
                if(x.option)
                    cart.push({id: x.id,title: x.title, price: x.price, img: x.featured_src, qty: 1, variations: {name: x.name, option: x.option}});
                else
                   cart.push({id: x.id,title: x.title, price: x.price, img: x.featured_src, qty: 1});
                window.localStorage.setItem(Shop.name+"-cart", JSON.stringify(cart));
                $scope.showSuccess($rootScope.Dict.PRODUCT_ADDED);
            }
        }else{
            var tmp = [];
            if(x.option)
                tmp.push({id: x.id,title: x.title, price: x.price, img: x.featured_src, qty: 1, variations: {name: x.name, option: x.option}});
            else
                tmp.push({id: x.id,title: x.title, price: x.price, img: x.featured_src, qty: 1});
            window.localStorage.setItem(Shop.name+"-cart", JSON.stringify(tmp));
            $scope.showSuccess($rootScope.Dict.PRODUCT_ADDED);
        }

        $scope.updateCart();
    };

    $scope.zoomMin = 1;

    $scope.screenHeight =  $window.innerHeight;

    $scope.showImages = function(index) {
        $scope.activeSlide = index;
        $scope.showModal('templates/product-zoom.html');
    };

    $scope.showModal = function(templateUrl) {
        $ionicModal.fromTemplateUrl(templateUrl, {
          scope: $scope
        }).then(function(modal) {
          $scope.modal = modal;
          $scope.modal.show();
        });
    }

    $scope.closeModal = function() {
        $scope.modal.hide();
        $scope.modal.remove();
    };

    if(wish){
      tmp = JSON.parse(wish);
      for(var i in tmp){
        if(tmp[i].id == id){
          $scope.isWishlist = true;
          break;
        }
      }
    }

    $scope.toWishlist = function(x){
        var wish = window.localStorage.getItem(Shop.name+"-wish");
        if(wish){
            var tmp = JSON.parse(wish);
            if($scope.isWishlist){
                for(var i in tmp){
                    if(tmp[i].id == x.id){
                        tmp.splice(i, 1);
                        break;
                    }
                }
                $scope.isWishlist = false;
                $cordovaToast.showLongBottom('Product has been removed from Wishlist').then(function(success) {}, function (error) {});
            }else{
                tmp.push({id: x.id,title: x.title, price: x.price, img: x.featured_src});
                $scope.isWishlist = true;
                $cordovaToast.showLongBottom('Product has been added successfully into Wishlist').then(function(success) {}, function (error) {});
            }
        }else{
            var tmp = [];
            tmp.push({id: x.id,title: x.title, price: x.price, img: x.featured_src});
            $scope.isWishlist = true;
            $cordovaToast.showLongBottom('Product has been added successfully into Wishlist').then(function(success) {}, function (error) {});
        }
        window.localStorage.setItem(Shop.name+"-wish", JSON.stringify(tmp));
        $scope.updateCart();
    };

    $scope.share = function(x){
        $ionicLoading.show();
        $cordovaSocialSharing
            .share("Sell "+x.title+" for only "+$filter('currency')(x.price, $scope.format+' ', 0)+", for more details check this out.", x.title, x.featured_src, x.permalink)
            .then(function(result) {
                $ionicLoading.hide();
            }, function(err) {
                $scope.showSuccess(err);
            });
    };
})

.controller('CategoryCtrl', function($scope, $timeout, $ionicLoading, $ionicScrollDelegate, $stateParams, WC){
	$scope.more = false;
	var page = 1;
	var category = $stateParams.slug.replace("-", " ");
	$scope.title = $stateParams.title;

	$ionicLoading.show();
    $scope.doRefresh = function(){
        page = 1;
    	WC.api().get('products?filter[category]='+category+'&page='+page+'&fields=id,title,price,regular_price,on_sale,in_stock,featured_src', function(err, data, res){
    		if(err) console.log(err);
    		//console.log(JSON.parse(res));
    		$scope.products = JSON.parse(res).products;
    		if(JSON.parse(res).products.length >= 10) $scope.more = true;
    		$ionicLoading.hide();
            $ionicScrollDelegate.resize();
            $scope.$broadcast('scroll.refreshComplete');
    	})
    }

    $scope.doRefresh();

	$scope.loadMore = function(){
		//$ionicLoading.show();
		page++;
		WC.api().get('products?filter[category]='+category+'&page='+page+'&fields=id,title,price,regular_price,on_sale,in_stock,featured_src', function(err, data, res){
			//console.log(JSON.parse(res));
      $timeout(function(){
      	if(JSON.parse(res).products.length < 10)
            $scope.more = false;
  			$scope.products = $scope.products.concat(JSON.parse(res).products);
  			$scope.$broadcast('scroll.infiniteScrollComplete');
      });
			//$ionicLoading.hide();
		})
	}
})

.controller('CartCtrl', function($scope, $ionicModal, $ionicLoading, $state, AuthService, Shop){
	$scope.cart = JSON.parse(window.localStorage.getItem(Shop.name+"-cart"));

	$scope.data = {
        showDelete: false
    };

    $scope.addItem = function(x, qty){
        for(i in $scope.cart){
            if($scope.cart[i].id == x.id){
                exist = true;
                $scope.cart[i].qty = $scope.cart[i].qty+qty;

                if($scope.cart[i].qty==0){
                    $scope.cart.splice(i, 1);
                }
                break;
            }
        }
        window.localStorage.setItem(Shop.name+"-cart", JSON.stringify($scope.cart));
        $scope.updateCart();
    };

    $scope.getCartItems = function(){
    	var tmp=0;
        for(i in $scope.cart)
            tmp+=$scope.cart[i].qty;
        return tmp;
    }

    $scope.getCartTotal=function(){
        var tmp=0;
        for(i in $scope.cart)
            tmp+=$scope.cart[i].qty*$scope.cart[i].price;
        return tmp;
    };

    $scope.removeCart = function(i, x){
        $scope.cart.splice(i, 1);
        window.localStorage.setItem(Shop.name+"-cart", JSON.stringify($scope.cart));
        $scope.updateCart();
    }

    $scope.goCheckout = function(){
        if($scope.user.isLogin)
            $state.go("app.checkout");
        else{
            $ionicModal.fromTemplateUrl("templates/modal-login.html", {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }
    };

    $scope.closeModal = function(){
        $scope.modal.hide();
    };

    $scope.guestCheckout = function(){
        $scope.closeModal();
        $state.go("app.checkout");
    };

    $scope.u = {
        user: '',
        pass: ''
    };

    $scope.doLogin = function(){
        $ionicLoading.show();
        AuthService.login($scope.u).then(function(x){
            $ionicLoading.hide();
            $scope.closeModal();
            $state.go("app.checkout");
        }, function(err){
            $ionicLoading.hide();
            $scope.message = err;
        });
    };

    ionic.material.ink.displayEffect();
})

.controller('CheckoutCtrl', function($scope, $state, $ionicModal, $http, $ionicLoading, $rootScope, Dict, WC, Shop){
    //console.log($scope.user.shipping);

    $scope.ship = {
        first_name: '',
        last_name: '',
        email: '',
        country: '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        postcode: ''
    };

    $scope.billing = {
        phone: '',
        email: ''
    };

    $scope.tmp = {
        note: '',
        country: '',
        coupon: ''
    };

    if($scope.user.isLogin){
        $ionicLoading.show();
        WC.api().get('customers/'+$scope.user.id, function(err, data, res){
            if(err) console.log(err);
            var user = JSON.parse(res).customer;
            $scope.billing  = user.billing_address;
            $scope.ship     = user.shipping_address;

            if($scope.ship.country){
                $scope.tmp.country = $rootScope.Dict.TXT_LOADING + ' ...'
                $http.get("https://api.theprintful.com/countries").success(function(x){
                    var tmp = x.result;
                    for(var i in tmp){
                        if(tmp[i].code==$scope.ship.country)
                            $scope.tmp.country = tmp[i].name
                    }
                    $ionicLoading.hide();
                }).error(function(err){ $scope.tmp.country = ''; });
            }

            $ionicLoading.hide();
        })
    }

    $scope.shipping_lines = {
        method_id: '',
        method_title: '',
        total: 0
    };

    $scope.payment_details = {
        method_id: '',
        method_title: '',
        paid: false
    };

    $scope.showCountry = function(){
        $ionicLoading.show();
        $http.get("https://api.theprintful.com/countries").success(function(x){
            $scope.countries = x.result;
            $ionicLoading.hide();
        }).error(function(err){
            $ionicLoading.hide();
            $scope.showError($rootScope.Dict.TXT_CHECK_CONNECT);
        });

        $ionicModal.fromTemplateUrl("templates/modal-country.html", {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };

    $scope.shipping = Shop.shipping;
    $scope.payment  = Shop.payment;

    $scope.setCountry = function(x){
        $scope.ship.country = x.code;
        $scope.tmp.country = x.name;
        $scope.closeModal();
    }

    $scope.setShip = function(x){
        $scope.shipping_lines = [{
            method_id: x.id,
            method_title: x.name,
            total: x.cost
        }];
    }

    $scope.setPayment = function(x){
        $scope.payment_details = {
            method_id: x.id,
            method_title: x.name,
            paid: false
        };
    }

    $scope.getCoupon = function(){
      $ionicLoading.show();

      var cart = JSON.parse(window.localStorage.getItem(Shop.name+"-cart"));
      var total = 0;
      for(var i in cart)
          total += cart[i].qty*cart[i].price;

      WC.api().get('coupons/code/'+$scope.tmp.coupon, function(err, data, res){
        var x = JSON.parse(res);
        if(err){
            $scope.showError($rootScope.Dict.TXT_CHECK_CONNECT);
            return false;
        }

        if(x.errors){
          $scope.showError(x.errors[0].message, 2000);
          $scope.tmp.coupon = '';
        }else if(x.coupon.type == 'fixed_product' || x.coupon.type == 'percent_product'){
            $scope.showError($rootScope.Dict.TXT_COUPON_NOT_SUPPORT, 2000);
            $scope.tmp.coupon = '';
        }else{
          if(x.coupon.expiry_date && new Date(x.coupon.expiry_date).getTime() < new Date().getTime()){
            $scope.showError($rootScope.Dict.TXT_COUPON_EXP, 3000);
            $scope.tmp.coupon = '';
          }else if(x.coupon.minimum_amount>0 && x.coupon.maximum_amount>0 && (total<x.coupon.minimum_amount || total>x.coupon.maximum_amount)){
            $scope.showError($rootScope.Dict.TXT_COUPON_MIN_MAX+ ' > '+$filter('currency')(x.coupon.minimum_amount, $scope.format, $scope.decimal)+' & < '+$filter('currency')(x.coupon.maximum_amount, $scope.format, $scope.decimal), 3000);
            $scope.tmp.coupon = '';
          }else if(x.coupon.minimum_amount>0 && total<x.coupon.minimum_amount>0){
            $scope.showError($rootScope.Dict.TXT_COUPON_MIN_MAX+ ' > '+$filter('currency')(x.coupon.minimum_amount, $scope.format, $scope.decimal), 3000);
            $scope.tmp.coupon = '';
          }else if(x.coupon.maximum_amount>0 && total>x.coupon.maximum_amount>0){
            $scope.showError($rootScope.Dict.TXT_COUPON_MIN_MAX+ ' < '+$filter('currency')(x.coupon.maximum_amount, $scope.format, $scope.decimal), 3000);
            $scope.tmp.coupon = '';
          }else{
            $scope.coupon_lines = {
              code: x.coupon.code,
              amount: x.coupon.amount,
              type: x.coupon.type,
              desc: x.coupon.description
            };

            $scope.showSuccess(x.coupon.description, 2000);
          }
        }
 
      })
    }

    $scope.cancelCoupon = function(){
      $scope.tmp.coupon = '';
      $scope.coupon_lines = '';
    }

    $scope.closeModal = function(){
        $scope.modal.hide();
    }

    $scope.doConfirm = function(){
        var order = {
            payment_details  : $scope.payment_details,
            shipping_address : $scope.ship,
            billing_address  : $scope.billing,
            shipping_lines   : $scope.shipping_lines,
            customer_id      : $scope.user.id,
            note             : $scope.tmp.note,
            coupon_lines     : $scope.coupon_lines
        }
        window.localStorage.setItem(Shop.name+"-order", JSON.stringify(order));
        $state.go("app.confirm");
    }

})

.controller('AccountCtrl', function($scope, $ionicLoading, $state, $rootScope, Dict, WC){
    $ionicLoading.show();

    WC.api().get('customers/'+$scope.user.id, function(err, data, res){
        if(err){
            $ionicLoading.hide();
            $scope.showError($rootScope.Dict.TXT_CHECK_CONNECT);
            return false;
        }
        var x = JSON.parse(res).customer;

        $scope.data = {
            first_name: x.first_name,
            last_name: x.last_name,
            email: x.email,
            username: x.username
        }

        $ionicLoading.hide();
    })
})

.controller('EditBillingCtrl', function($scope, $http, $ionicModal, $ionicLoading, $state, $rootScope, Dict, WC){
    $scope.u = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        country: '',
        address_1: '',
        address_2: '',
        city: '',
        postcode: ''
    }

    $scope.tmp = {
        country: ''
    }

    $ionicLoading.show();

    WC.api().get('customers/'+$scope.user.id, function(err, data, res){
        if(err){
            $ionicLoading.hide();
            $scope.showError($rootScope.Dict.TXT_CHECK_CONNECT);
            return false;
        }
        $scope.u = JSON.parse(res).customer.billing_address;
        $scope.tmp = {
            country: $scope.u.country
        }

        console.log($scope.u);
        $ionicLoading.hide();
    })

    $scope.showCountry = function(){
        $ionicLoading.show();
        $http.get("https://api.theprintful.com/countries").success(function(x){
            $scope.countries = x.result;
            $ionicLoading.hide();
        }).error(function(err){
            $ionicLoading.hide();
            $scope.showError($rootScope.Dict.TXT_CHECK_CONNECT);
        });

        $ionicModal.fromTemplateUrl("templates/modal-country.html", {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };

    $scope.setCountry = function(x){
        $scope.u.country = x.code;
        $scope.tmp.country = x.name;
        $scope.closeModal();
    }

    $scope.closeModal = function(){
        $scope.modal.hide();
    }

    $scope.doUpdate = function(){
        var data = {
          customer: {
            billing_address: $scope.u
          }
        };

        WC.api().put('customers/'+$scope.user.id, data, function(err, data, res){
            console.log(JSON.parse(res));

            if(err){
                $ionicLoading.hide();
                $scope.showError($rootScope.Dict.TXT_CHECK_CONNECT);
                return false;
            }else
                $state.go("app.account");
        });
    }
})

.controller('EditShippingCtrl', function($scope, $http, $ionicModal, $ionicLoading, $state, $rootScope, Dict, WC){
    $scope.u = {
        first_name: '',
        last_name: '',
        country: '',
        address_1: '',
        address_2: '',
        city: '',
        postcode: ''
    }

    $scope.tmp = {
        country: ''
    }

    $ionicLoading.show();

    WC.api().get('customers/'+$scope.user.id, function(err, data, res){
        if(err){
            $ionicLoading.hide();
            $scope.showError("Error in connection. Please try again.");
            return false;
        }
        $scope.u = JSON.parse(res).customer.shipping_address;
        $scope.tmp = {
            country: $scope.u.country
        }

        console.log($scope.u);
        $ionicLoading.hide();
    })

    $scope.showCountry = function(){
        $ionicLoading.show();
        $http.get("https://api.theprintful.com/countries").success(function(x){
            $scope.countries = x.result;
            $ionicLoading.hide();
        }).error(function(err){
            $ionicLoading.hide();
            $scope.showError($rootScope.Dict.TXT_CHECK_CONNECT);
        });

        $ionicModal.fromTemplateUrl("templates/modal-country.html", {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };

    $scope.setCountry = function(x){
        $scope.u.country = x.code;
        $scope.tmp.country = x.name;
        $scope.closeModal();
    }

    $scope.closeModal = function(){
        $scope.modal.hide();
    }

    $scope.doUpdate = function(){
        var data = {
          customer: {
            shipping_address: $scope.u
          }
        };

        console.log($scope.u);

        WC.api().put('customers/'+$scope.user.id, data, function(err, data, res){
            console.log(JSON.parse(res));

            if(err){
                $ionicLoading.hide();
                $scope.showError($rootScope.Dict.TXT_CHECK_CONNECT);
                return false;
            }else
                $state.go("app.account");
        });
    }
})

.controller('EditAccountCtrl', function($scope, $ionicLoading, $state, $rootScope, Dict, WC){
    $scope.u = {
        first_name: '',
        last_name: '',
        email: ''
    }

    $ionicLoading.show();
    WC.api().get('customers/'+$scope.user.id, function(err, data, res){
        if(err){
            $ionicLoading.hide();
            $scope.showError($rootScope.Dict.TXT_CHECK_CONNECT);
            return false;
        }
        var x = JSON.parse(res).customer;

        $scope.u = {
            first_name: x.first_name,
            last_name: x.last_name,
            email: x.email
        }

        console.log($scope.u);
        $ionicLoading.hide();
    })

    $scope.doUpdate = function(){
        $ionicLoading.show();

        var data = {
          customer: $scope.u
        };

        WC.api().put('customers/'+$scope.user.id, data, function(err, data, res){
            console.log(JSON.parse(res));

            if(err){
                $ionicLoading.hide();
                $scope.showError($rootScope.Dict.TXT_CHECK_CONNECT);
                return false;
            }else
                $state.go("app.account");
        });

    }
})

.controller('OrdersCtrl', function($scope, $ionicLoading, $state, $rootScope, Dict, WC){
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        viewData.enableBack = false;
    });

    if(!$scope.user.isLogin)
        $state.go("app.login");

    $scope.doRefresh = function(){
        page = 1;
        $ionicLoading.show();
        WC.api().get('customers/'+$scope.user.id+'/orders?page='+page+'&fields=id,created_at,total,line_items,status', function(err, data, res){
            if(err){
                $ionicLoading.hide();
                $scope.showError($rootScope.Dict.TXT_CHECK_CONNECT);
                return false;
            }
            $scope.orders = JSON.parse(res).orders;
            $ionicLoading.hide();
        })
    }
    $scope.doRefresh();
})

.controller('OrderDetailCtrl', function($scope, $stateParams, $ionicLoading, $state, $rootScope, Dict, WC){
    $scope.id = $stateParams.id;
    $ionicLoading.show();
    WC.api().get('orders/'+$stateParams.id, function(err, data, res){
        if(err){
            $scope.showError($rootScope.Dict.TXT_CHECK_CONNECT);
            $ionicLoading.hide();
            return false;
        }
        $scope.order = JSON.parse(res).order;
        $ionicLoading.hide();
    })
})

.controller('ConfirmCtrl', function($scope, $state, $ionicLoading, $timeout, $http, $rootScope, PaypalService, Dict, WC, Shop, Razor){
    var order = JSON.parse(window.localStorage.getItem(Shop.name+"-order"));
    var cart = JSON.parse(window.localStorage.getItem(Shop.name+"-cart"));
    var line_items = [], subtotal = 0;

    $scope.shipmethod    = order.shipping_lines[0].method_title;
    $scope.paymentmethod = order.payment_details.method_title;

    for(var i in cart){
        subtotal += cart[i].price * cart[i].qty;
        if(cart[i].variations){
            line_items.push({
                product_id: cart[i].id,
                quantity: cart[i].qty,
                variations: {
                    //name: cart[i].variations.name,
                    //option: cart[i].variations.option
                    [cart[i].variations.name]: cart[i].variations.option
                }
            });
        }
        else line_items.push({product_id: cart[i].id, quantity: cart[i].qty});
    }

    $scope.discAmount = 0;
    $scope.subtotal = subtotal;
    $scope.shipcost = order.shipping_lines[0].total;    

    order.line_items = line_items;

    if(order.coupon_lines){
      order.fee_lines = [];

      var amount = (order.coupon_lines.type=='percent') ? ($scope.subtotal * order.coupon_lines.amount/100) : order.coupon_lines.amount;
      order.fee_lines.push({title: order.coupon_lines.desc, total: parseInt(amount*-1)});

      order.coupon_lines = [{
        code: order.coupon_lines.code,
        amount: amount
      }];
      
      $scope.discAmount = amount;
    }

    $scope.total  = ($scope.subtotal-$scope.discAmount) + $scope.shipcost;

    function resetCache(){
        window.localStorage.removeItem(Shop.name+"-cart");
        window.localStorage.removeItem(Shop.name+"-order");
    }

    $scope.createOrder = function(){
        $ionicLoading.show();
        var data = {order: order};
        WC.api().post('orders', data, function(err, data, res){
            var q = JSON.parse(res);

            if(err){
                $ionicLoading.hide();
                $scope.showError($rootScope.Dict.TXT_CHECK_CONNECT);
                return false;
                $state.go("app.checkout");
            }

            var order = JSON.parse(res).order;

            if(order.payment_details.method_id=='paypal'){
                PaypalService.initPaymentUI().then(function () {
                    PaypalService.makePayment(order.total, "Total", $scope.store.meta.currency).then(function(x){
                        console.log(x);
                        resetCache();
                        WC.api().put('orders/'+order.id, {order: {status: 'completed'}}, function(err, data, res){
                            $ionicLoading.hide();
                            $state.go('app.thanks', {id: order.id, total: order.total, payment: $scope.paymentmethod});
                        });
                    }, function(e){
                        console.log(e);
                        $scope.showError(e);
                    });
                }, function(e){
                    console.log(e);
                    $scope.showError(e);
                });
                
            }else if(order.payment_details.method_id=='razor'){
                var options = {
                  order_id      : order.id,
                  description   : Shop.RazorYourShopDescription,
                  image         : Shop.RazorYourLogoURL,
                  currency      : $scope.store.meta.currency, // ONLY INR is supported
                  key           : Shop.RazorKeyId,
                  amount        : parseInt(order.total),
                  name          : Shop.name,
                  prefill: {
                    email   : order.billing_address.email,
                    contact : order.billing_address.phone,
                    name    : order.customer.first_name + ' ' + order.customer.last_name
                  },
                  theme: {
                    color: Shop.RazorThemeColor
                  }
                }

                var successCallback = function(payment_id) {
                  console.log(payment_id);

                  Razor.capture(payment_id, order.total).then(function(x){
                    // PAYMENT SUCCESS
                    resetCache();
                    WC.api().put('orders/'+order.id, {order: {status: 'completed'}}, function(err, data, res){
                        $state.go('app.thanks', {id: order.id, total: order.total, payment: $scope.paymentmethod});
                    });
                  }, function(err){
                    console.log(err);
                    $scope.showError($rootScope.Dict.TXT_CHECK_CONNECT);
                  });

                  $ionicLoading.hide();
                }

                var cancelCallback = function(error) {                  
                  $scope.showError("You close the payment, you can retry by clicking Pay button below.", 3000);
                  console.log(error);
                  $ionicLoading.hide();
                }

                document.addEventListener("deviceready", function(){
                    RazorpayCheckout.open(options, successCallback, cancelCallback);
                });

            }else{
                // PAYMENT SUCCESS
                resetCache();
                $ionicLoading.hide();
                WC.api().put('orders/'+order.id, {order: {status: 'on-hold'}}, function(err, data, res){});
                $state.go('app.thanks', {id: order.id, total: order.total, payment: $scope.paymentmethod});
            }
        })
    }

})

.controller('ThanksCtrl', function($scope, $stateParams){
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        viewData.enableBack = false;
    });

    $scope.id      = $stateParams.id;
    $scope.total   = $stateParams.total;
    $scope.payment = $stateParams.payment;
})

.controller('LoginCtrl', function($scope, $ionicLoading, $state, AuthService){
    $scope.u = {
        user: '',
        pass: ''
    };

    $scope.doLogin = function(){
        $ionicLoading.show();
        AuthService.login($scope.u).then(function(x){
            $ionicLoading.hide();
            $state.go("app.dash");
        }, function(err){
            $ionicLoading.hide();
            $scope.message = err;
        });
    };

    ionic.material.ink.displayEffect();
})

.controller('ContactCtrl', function($scope, $cordovaSocialSharing, Shop){
    $scope.email = function(){
        var message = "Dear "+Shop.name+", Thanks for great apps. It is very easy to use. Simple and elegant. <br><br>-----------<br>Appname: "+Shop.name+" "+Shop.version+"<br>Platform: "+ionic.Platform.platform()+" v"+ionic.Platform.version();
        var subject = 'Support';
        var to = Shop.EMAIL; // replace this with your own email
        //var cc = 'info@ionicpremium.com';  // replace this with your own email
        $cordovaSocialSharing
            .shareViaEmail(message, subject, to, null, null, null)
            .then(function(result) {
              // Success!
            }, function(err) {
              // An error occurred. Show a message to the user
            });
    };

    ionic.material.ink.displayEffect();
})

.controller('RegisterCtrl', function($scope, $ionicLoading, $http, $state, $rootScope, Dict, AuthService, Shop){
    $scope.u = {
        username: '',
        pass: '',
        email: '',
    };

    $scope.doRegister = function(){
        $ionicLoading.show();
        $http.get(Shop.URL+"/api/get_nonce/?controller=user&method=register")
            .success(function(x){
                if(x.nonce){
                    //console.log($scope.u);
                    $http.get(Shop.URL+"/api/user/register/?username="+$scope.u.username+"&nonce="+x.nonce+"&email="+$scope.u.email+"&first_name="+$scope.u.first_name+"&last_name="+$scope.u.last_name+"&user_pass="+$scope.u.pass+"&insecure=cool&display_name="+$scope.u.first_name+" "+$scope.u.last_name)
                        .success(function(y){
                            if(y.status=='ok'){
                                var login = {
                                    user: $scope.u.username,
                                    pass: $scope.u.pass,
                                }
                                AuthService.login(login)
                                    .then(function(z){
                                        $ionicLoading.hide();
                                        $state.go("app.dash", {}, {reload: true});
                                    }, function(err){
                                        $ionicLoading.hide();
                                        $scope.message = err;
                                    });
                            }else{
                                $ionicLoading.hide();
                                $scope.message = y.error;
                            }
                        })
                        .error(function(err){
                            $ionicLoading.hide();
                            $scope.message = err.error;
                        });
                }else{
                    $ionicLoading.hide();
                    $scope.message = x.error;
                }
            })
            .error(function(err){
                $ionicLoading.hide();
                $scope.message = $rootScope.Dict.TXT_CHECK_CONNECT;
            });
        }

    ionic.material.ink.displayEffect();
})

.controller('SettingsCtrl', function($scope, $window, $rootScope, listLang, Dict, Language){
    $scope.data = listLang;
    $scope.lang = Language.getLang();

    $scope.setLang = function(x){
        Language.saveLang(x);
        $rootScope.Dict = Dict[Language.getLang()];
    }
});
