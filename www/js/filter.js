angular.module('app')

.filter('trusted', function($sce){
    return function(url){
        return $sce.trustAsHtml(url);
    }
})

.filter('discount', function(){
  return function(x){
    return (x.regular_price - x.price) / x.regular_price * 100;
  }
});
