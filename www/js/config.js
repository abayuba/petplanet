angular.module('app')

.constant('Shop', {
  version                             : '2.1.5 beta',
  name                                : 'Petplanet Veterinaria',
  URL                                 : 'http://petplanet.aplicacionesmoviles.uy',
  EMAIL                               : 'abayuba1@gmail.com',
  ConsumerKey                         : 'ck_3057f12185a7a1cd380b09b8d97ceed6d30a7801', // Get this from your WooCommerce
  ConsumerSecret                      : 'cs_58afc39b888e4c66203da1e7250d3a8dbf5f4bd8', // Get this from your WooCommerce

  homeSlider                          : true, // If you dont want to use home slider, set it to FALSE
  CurrencyFormat                      : true, // If you want to use currency format, set it to TRUE
  shipping                            : [
                                          {id: 'flat_rate:4', name: 'Local Pickup', cost: 0},
                                          {id: 'flat_rate:3', name: 'Flat Rate', cost: 5},
                                          {id: 'flat_rate:2', name: 'Worldwide Flat Rate', cost: 15}
                                        ],
  payment                             : [
                                          {id: 'cod', name: 'Cash on Delivery', icon: 'fa fa-money', desc: 'Pay with cash upon delivery.'},
                                          {id: 'bacs', name: 'Direct Bank Transfer', icon: 'fa fa-university', desc: 'You can pay using direct bank account'},
                                          {id: 'paypal', name: 'Paypal', icon: 'fa fa-cc-paypal', desc: 'You can pay via Paypal and Credit Card'},
                                          {id: 'razor', name: 'RazorPay', icon: 'fa fa-money', desc: 'Pay with RazorPay for Indian region only'} // Only for Indian currency (INR = Indian Rupee)
                                        ],


                                        // Change this Paypal Sandbox and LIVE with yours
  payPalSandboxClientID               : 'AZjyISbp1zmOhZ0o_iAG3W2IGjlz2hvEC-8cGoQ7fXcMFN9afaRuW0X1B1PVSgkSuTQWOKqM9N4NTkOP',
  payPalLiveClientID                  : 'xxxxxxxxxxxx',
  payPalEnv                           : 'PayPalEnvironmentSandbox', // to go live, use this: 'PayPalEnvironmentProduction'

                                        // RazorPay only can be used for Indian currency (INR = Indian Rupee)
                                        // If you want use LIVE, get your LIVE key from RazorPay Dashboard and use it here                                        
  RazorKeyId                          : 'rzp_test_A5RTlFgqFuNdJU',  // Get this from https://dashboard.razorpay.com
  RazorSecretKey                      : 'JE7YydcgwT8dPhIVEFr60pDj', // Get this from https://dashboard.razorpay.com
  RazorYourLogoURL                    : 'https://goo.gl/ZwgRF9', // your logo image
  RazorThemeColor                     : '#F37254', // Theme color for RazorPay
  RazorYourShopDescription            : 'Ionic Premium WooCoommerce Full App for Android & iOS' // Your shop description
})

.constant('$ionicLoadingConfig', {
  template: '<ion-spinner icon="dots"></ion-spinner>',
})

.constant('listLang', [
    {code: 'en', text: 'English'},
    {code: 'ar', text: 'Arabic'},
    {code: 'pt', text: 'Portuguese'},
    {code: 'de', text: 'German'},
    {code: 'hi', text: 'Hindi'}
  ]
);