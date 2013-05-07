
angular.module('app', ['ui','angularTree','appservices'])
.config(function($routeProvider) {
	$routeProvider

		.when('/accounts', {controller:AccountCtrl, templateUrl:'accounts.html', activeTab:'accounts'})
		.when('/transactions/:accountId', {controller:AccountCtrl, templateUrl:'transactions.html', activeTab:'accounts'})
		
		.when('/budgets/categories', {controller:BudgetCtrl, templateUrl:'categories.html', activeTab:'budgets'})
		.when('/budgets', {templateUrl:'budgets.html', activeTab:'budgets'})
		
		.when('/welcome', {templateUrl:'choose.html', activeTab:'home'})
		
		.otherwise({redirectTo:'/welcome'});

});


angular.module('appservices', ['ngResource']).
	factory('Accounts', function($resource) {
		var Accounts = $resource('/accounts/:id');
		return Accounts; 
	}).
	factory('Categories', function($resource) {
		var Categories = $resource('/categories/:id');
		return Categories; 
    }).
    factory('SomeService', function() {
        var SomeService = {
            getWelcome: function() {
                return "Im a service";
            }
        };
            
        return SomeService;
    }).
    directive('category',function(Categories) {
        return {
            restrict:'E',
            template: "<li draggable droppable>{{cat.category_name}}</li>",
            scope: {
                cat: "=cat",
                onDrop: "=ondrop"
            }, 
            link: function(scope, element, attrs) {
                
                element.bind('click',function(evt) {
                   // alert("ID: " + scope.cat.category_id);
                });
            }
        }

    }).
    directive('draggable', function($rootScope) {
        return {
            restrict:'A',
            link: function(scope, element, attrs) {
                element.draggable({
                        revert:true,
                        start:function(event,ui){
                            $rootScope.sourceCat = scope.cat;
                        }   
                });
            }
        };
    }).
    directive('droppable', function($rootScope,Categories) {
        return {
            restrict:'A',
            link: function(scope, element, attrs) {
                element.droppable({
                    accept: "li",
                    hoverClass: "drop-hover",
                    drop:function(event,ui) {
                        $rootScope.sourceCat.category_parent = scope.cat.category_id;
                        Categories.save($rootScope.sourceCat, function(data) {scope.onDrop();},function(data){});
                        
                    }
                });
            }
        };
    })
    ;






