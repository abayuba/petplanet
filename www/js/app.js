angular.module('app', ['ionic', 'app.controllers', 'app.services', 'ngCordova', 'angularMoment', 'topscroller'])

.run(function($ionicPlatform, Shop) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    var notificationOpenedCallback = function(jsonData) {
      console.log('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
    };

    document.addEventListener("deviceready", function(){
      window.plugins.OneSignal.init(Shop.OneSignalAppID,
                                   {googleProjectNumber: Shop.GCM_SenderID},
                                   notificationOpenedCallback);
      // Show an alert box if a notification comes in when the user is in your app.
      window.plugins.OneSignal.enableInAppAlertNotification(true);
    }, false);
  });
})

.config(function($stateProvider, $httpProvider, $urlRouterProvider, $ionicConfigProvider) {

  $ionicConfigProvider.navBar.alignTitle('center');

  $ionicConfigProvider.backButton.text('');
  $ionicConfigProvider.backButton.previousTitleText(false);

  $stateProvider.state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  // HOME

  .state('app.dash', {
      url: '/dash',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html',
          controller: 'HomeCtrl'
        }
      }
    })

  .state('quicksearch', {
    cache: false,
    url: '/quicksearch',
    templateUrl: 'templates/modal-search.html',
    controller: 'QuickSearchCtrl'

  })

  .state('app.faq', {
      url: '/faq',
      views: {
        'menuContent': {
          templateUrl: 'templates/faq.html'
        }
      }
    })

  .state('app.about', {
      url: '/about',
      views: {
        'menuContent': {
          templateUrl: 'templates/about.html'
        }
      }
    })

  .state('app.contact', {
      url: '/contact',
      views: {
        'menuContent': {
          templateUrl: 'templates/contact.html',
          controller: 'ContactCtrl'
        }
      }
    })

  .state('app.login', {
      url: '/login',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/login.html',
          controller: 'LoginCtrl'
        }
      }
    })

  .state('app.register', {
      url: '/register',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/register.html',
          controller: 'RegisterCtrl'
        }
      }
    })

  .state('app.cart', {
    cache: false,
      url: '/cart',
      views: {
        'menuContent': {
          templateUrl: 'templates/cart.html',
          controller: 'CartCtrl'
        }
      }
    })

  .state('app.account', {
    cache: false,
      url: '/account',
      views: {
        'menuContent': {
          templateUrl: 'templates/account.html',
          controller: 'AccountCtrl'
        }
      }
    })

  .state('app.editaccount', {
    cache: false,
      url: '/editaccount',
      views: {
        'menuContent': {
          templateUrl: 'templates/edit-account.html',
          controller: 'EditAccountCtrl'
        }
      }
    })

  .state('app.editbilling', {
    cache: false,
      url: '/editbilling',
      views: {
        'menuContent': {
          templateUrl: 'templates/edit-billing.html',
          controller: 'EditBillingCtrl'
        }
      }
    })

  .state('app.editshipping', {
    cache: false,
      url: '/editshipping',
      views: {
        'menuContent': {
          templateUrl: 'templates/edit-shipping.html',
          controller: 'EditShippingCtrl'
        }
      }
    })

  .state('app.orders', {
    cache: false,
      url: '/orders',
      views: {
        'menuContent': {
          templateUrl: 'templates/orders.html',
          controller: 'OrdersCtrl'
        }
      }
    })

  .state('app.order-detail', {
      cache: false,
      url: '/orders/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/order-detail.html',
          controller: 'OrderDetailCtrl'
        }
      }
    })

  .state('app.checkout', {
      url: '/checkout',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/checkout.html',
          controller: 'CheckoutCtrl'
        }
      }
    })

  .state('app.confirm', {
      url: '/confirm',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/confirm.html',
          controller: 'ConfirmCtrl'
        }
      }
    })

  .state('app.thanks', {
      url: '/thanks/:id/:total/:payment',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/thanks.html',
          controller: 'ThanksCtrl'
        }
      }
    })

  .state('app.category', {
      url: '/category/:id/:title/:slug',
      views: {
        'menuContent': {
          templateUrl: 'templates/category.html',
          controller: 'CategoryCtrl'
        }
      }
    })

  .state('app.product', {
      url: '/product/:category/:id',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/product.html',
          controller: 'ProductCtrl'
        }
      }
    })

  .state('app.wish', {
    cache: false,
        url: '/wish',
        views: {
          'menuContent': {
            templateUrl: 'templates/wish.html',
            controller: 'WishCtrl'
          }
        }
      })

  .state('app.blog', {
      url: '/blog',
      views: {
        'menuContent': {
          templateUrl: 'templates/blog.html',
          controller: 'BlogCtrl'
        }
      }
    })

  .state('app.blog-detail', {
      url: '/blog/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/blog-detail.html',
          controller: 'BlogDetailCtrl'
        }
      }
    })

  .state('app.settings', {
      url: '/settings',
      views: {
        'menuContent': {
          templateUrl: 'templates/settings.html',
          controller: 'SettingsCtrl'
        }
      }
    })

  $urlRouterProvider.otherwise('/app/dash');
});
