angular.module('app.services',[])

.service('WC', function(Shop){
    return {
        api: function(){
            var Woocommerce = new WooCommerceAPI.WooCommerceAPI({
                url           : Shop.URL,
                queryStringAuth: true,
                consumerKey   : Shop.ConsumerKey,
                consumerSecret: Shop.ConsumerSecret
            });
            return Woocommerce;
        }
	}
})

.service('Blog', function($http, $q) {
  var get = function(url){
    return $q(function(resolve, reject){
      $http.get(url).success(function(x){
        resolve(x);
      }).error(function(err){
        reject(err);
      });
    })
  };

  return {
    get: get
  };
})

.factory('Data', function($http, $q, Shop) {
  return {
      send: function(data, url){
        return $q(function(resolve, reject){             
            $http({
              method: 'POST',
              url: url,
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              transformRequest: function(obj) {
                  var p, str;
                  str = [];
                  for (p in obj) {
                      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
                  }
                  return str.join('&');
              },
              data: data
            })
            .success(function(x){
              //if(x.status)
                resolve(x);
              //else
                //reject(x);                        
            })
            .error(function(err){
              reject(err);
            });
        })
      },
      get: function(x){
        return $q(function(resolve, reject){
          $http.get(Shop.URL+x).success(function(x){
            resolve(x);
          }).error(function(err){
            reject(err);
          });
        })
      }
    }
})

.service('Razor', function($http, $q, Shop){
  return {
      capture: function(payment_id, total){
        return $q(function(resolve, reject){

            var url = 'https://'+Shop.RazorKeyId+':'+Shop.RazorSecretKey+'@api.razorpay.com/v1/payments/'+payment_id+'/capture';

            $http({
              method: 'POST',
              url: url,
              headers: {
                'Content-Type'   : 'application/x-www-form-urlencoded'
               },
              transformRequest: function(obj) {
                  var p, str;
                  str = [];
                  for (p in obj) {
                      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
                  }
                  return str.join('&');
              },
              data: {amount: parseInt(total)}
            })
            .success(function(x){
              resolve(x);
            })
            .error(function(err){
              reject(err);
            });
        })
      }
    }
})

.service('PaypalService', ['$q', '$ionicPlatform', 'Shop', '$filter', '$timeout', function ($q, $ionicPlatform, Shop, $filter, $timeout) {
      var init_defer;
      /**
       * Service object
       * @type object
       */
      var service = {
          initPaymentUI: initPaymentUI,
          createPayment: createPayment,
          configuration: configuration,
          onPayPalMobileInit: onPayPalMobileInit,
          makePayment: makePayment
      };

      /**
       * @ngdoc method
       * @name initPaymentUI
       * @methodOf app.PaypalService
       * @description
       * Inits the payapl ui with certain envs. 
       *
       * 
       * @returns {object} Promise paypal ui init done
       */
      function initPaymentUI() {

          init_defer = $q.defer();
          $ionicPlatform.ready().then(function () {

              var clientIDs = {
                  "PayPalEnvironmentProduction": Shop.payPalLiveClientID,
                  "PayPalEnvironmentSandbox": Shop.payPalSandboxClientID
              };
              PayPalMobile.init(clientIDs, onPayPalMobileInit);
          });

          return init_defer.promise;

      }


      /**
       * @ngdoc method
       * @name createPayment
       * @methodOf app.PaypalService
       * @param {string|number} total total sum. Pattern 12.23
       * @param {string} name name of the item in paypal
       * @description
       * Creates a paypal payment object 
       *
       * 
       * @returns {object} PayPalPaymentObject
       */
      function createPayment(total, name, currency) {
              
          // "Sale  == >  immediate payment
          // "Auth" for payment authorization only, to be captured separately at a later time.
          // "Order" for taking an order, with authorization and capture to be done separately at a later time.
          var payment = new PayPalPayment("" + total, currency, "" + name, "Sale");
          return payment;
      }
      /**
       * @ngdoc method
       * @name configuration
       * @methodOf app.PaypalService
       * @description
       * Helper to create a paypal configuration object
       *
       * 
       * @returns {object} PayPal configuration
       */
      function configuration() {
          // for more options see `paypal-mobile-js-helper.js`
          var config = new PayPalConfiguration({merchantName: Shop.name, merchantPrivacyPolicyURL: null, merchantUserAgreementURL: null});
          return config;
      }

      function onPayPalMobileInit() {
          $ionicPlatform.ready().then(function () {
              // must be called
              // use PayPalEnvironmentNoNetwork mode to get look and feel of the flow
              PayPalMobile.prepareToRender(Shop.payPalEnv, configuration(), function () {
                  $timeout(function () {
                      init_defer.resolve();
                  });

              });
          });
      }

      /**
       * @ngdoc method
       * @name makePayment
       * @methodOf app.PaypalService
       * @param {string|number} total total sum. Pattern 12.23
       * @param {string} name name of the item in paypal
       * @description
       * Performs a paypal single payment 
       *
       * 
       * @returns {object} Promise gets resolved on successful payment, rejected on error 
       */
      function makePayment(total, name, currency) {
          var defer = $q.defer();
          total = $filter('number')(total, 2);
          $ionicPlatform.ready().then(function () {
              PayPalMobile.renderSinglePaymentUI(createPayment(total, name, currency), function (result) {
                  $timeout(function () {
                      defer.resolve(result);
                  });
              }, function (error) {
                  $timeout(function () {
                      defer.reject(error);
                  });
              });
          });

          return defer.promise;
      }

      return service;
  }])
    
.factory('AuthService', function($q, $http, WC, Shop) {
  var LOCAL_TOKEN_KEY = Shop.name+"-user";
  var id = '';
  var username = '';
  var email = '';
  var name = '';

  var isAuthenticated = false;
  var role = '';
  var authToken;

  function loadUserCredentials() {
    var user = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if (user) {
      useCredentials(JSON.parse(user));
    }
  }

  function storeUserCredentials(user) {
        window.localStorage.setItem(LOCAL_TOKEN_KEY, JSON.stringify(user));
        useCredentials(user);
  }

  function useCredentials(user) {
    id       = user.id;
    username = user.username;
    email    = user.email;
    name     = user.firstname+' '+user.lastname;

    isAuthenticated = true;
    authToken = JSON.stringify(user);
    //$http.defaults.headers.common['X-Auth-Token'] = JSON.stringify(user);
  }

  function destroyUserCredentials() {
    authToken = undefined;

    id       = '';
    username = '';
    email    = '';
    name     = '';

    isAuthenticated = false;
    //$http.defaults.headers.common['X-Auth-Token'] = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
  }

  var login =  function(x){
    return $q(function(resolve, reject){
      $http.get(Shop.URL+'/api/user/generate_auth_cookie/?username='+x.user+'&password='+x.pass+'&insecure=cool')
        .success(function(x){
          if(x.status=='ok'){
            storeUserCredentials(x.user);
            resolve(x.user);
          }else
            reject(x.error);
        })
        .error(function(err){
          reject('Error in connection');
        });
    });
  };

  var logout = function(id, os) {
    destroyUserCredentials();
    //$http.get(API+'logout.php?id='+id+'&os='+os, null, function(){});
  };

  var isAuthorized = function(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
  };

  loadUserCredentials();

  return {
    login: login,
    logout: logout,
    isAuthorized: isAuthorized,
    isAuthenticated: function() {return isAuthenticated;},
    id: function() {return id;},
    name: function() {return name;},
    username: function() {return username;},
    email: function() {return email;},
    authToken: function() {return authToken;},
    role: function() {return role;}
  };
})

.factory('Language', function($state, $rootScope, Shop) {
  return {
    saveLang: function(x) {
      window.localStorage.setItem(Shop.name+"-lang", x);
    },
    getLang: function() {
      if(window.localStorage.getItem(Shop.name+"-lang"))
        return window.localStorage.getItem(Shop.name+"-lang");
      else
        return 'en';      
    }
  };
})
