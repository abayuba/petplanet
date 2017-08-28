angular.module('app')

.constant('Shop', {
  version                             : '1.0.1',
  name                                : 'Veterinaria la Cruz',
  URL                                 : 'http://veterinarialacruz.com.uy',
  EMAIL                               : 'abayuba1@gmail.com',
  ConsumerKey                         : 'ck_b860d9647baba7fbc8b76cb0b2cc45e9fff7f34b', // Get this from your WooCommerce
  ConsumerSecret                      : 'cs_78a6ca11a35e3ab80f86df3ea7b31b906d0339be', // Get this from your WooCommerce

  homeSlider                          : true, // If you dont want to use home slider, set it to FALSE
  CurrencyFormat                      : true, // If you want to use currency format, set it to TRUE
  shipping                         : [
                                          {id: 'flat_rate:4', name: 'Debes dar click aquí para activar,Envío Gratuito.', cost: 0},
                                          
                                          
                                        ],
  payment                             : [
                                          {id: 'cod', name: 'Paga cuando le entregan , click aquí', icon: 'fa fa-money', desc: 'Moneda pesos'},
                                         
                                          // Only for Indian currency (INR = Indian Rupee)
                                        ],

 
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