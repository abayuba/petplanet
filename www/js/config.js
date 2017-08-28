angular.module('app')

.constant('Shop', {
  version                             : '1.0.1',
  name                                : 'Pet Planet Veterinaria',
  URL                                 : 'http://petplanet.aplicacionesmoviles.uy',
  EMAIL                               : 'abayuba1@gmail.com',
  ConsumerKey                         : 'ck_508e5ae2dbcee53f15e8b686fcda05edc82ea467', // Get this from your WooCommerce
  ConsumerSecret                      : 'cs_54c9af5ac9c41650baf9c132f852fdad955708cf', // Get this from your WooCommerce

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