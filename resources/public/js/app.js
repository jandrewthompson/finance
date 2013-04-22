
function AccountCtrl($scope, $rootScope, $route, $routeParams, Accounts, Categories )
{

    var init = function() {
        Accounts.get( function(data){
            $scope.accounts = data.accounts;
            if($routeParams.accountId)
            {
                for(acct in $scope.accounts)
                {
                    if($scope.accounts[acct].account_id == $routeParams.accountId)
                        $scope.account = $scope.accounts[acct];
                }
            }
        });
        Categories.get( function(data){
            $scope.categories = data.categories;
        });
    };

    $scope.editTransaction = function(tx) {
        if(tx == null)
        {
            tx = {'transaction_date':'',
                'check_number':'',
                'payee':'',
                'memo':'',
                'category_name':'',
                'account_id':$scope.account.account_id,
                'amount':''};
            $scope.account.transactions.push(tx);
        } else {
            $scope.selected_category = tx.category_id;
            tx.transaction_date = new Date(tx.transaction_date);
        }
        $scope.originalTx = angular.copy(tx);
        $scope.tx = tx;
    };
    $scope.cancelTransaction = function() {
        init();    
    };
    $scope.saveTransaction = function(tx) {
        $('#editModal').modal('hide');
        Accounts.save(tx, function(data) {
        },function(data) {});
    };
    $scope.deleteTransaction = function(tx,idx) {
        $('#confirmModal_'+idx).modal('hide');
        $scope.account.transactions.remove(idx);
        Accounts.remove({'id':tx.transaction_id}, function(data) {
        }, function(data) {});

    };
    $scope.categoryChange = function()
    {
        for(cat in $scope.categories) {
            if($scope.categories[cat].category_id == $scope.selected_category)
            {
                $scope.tx.category_id = $scope.categories[cat].category_id;
                $scope.tx.category_name = $scope.categories[cat].category_name;
            }
        }
    };
    init();    
};
function TransactionCtrl($scope, $rootScope, $route, $routeParams )
{
};

function BudgetCtrl($scope, $rootScope, $route, $routeParams, Categories, SomeService )
{
    $scope.init = function()
    {
        Categories.get( function(data){
            $scope.categories = data.categories;
            $scope.topCategory = $scope.makeTree($scope.categories, {});
        });
    };

    $scope.makeTree = function(coll, par)
    {
        angular.forEach(coll, function(child,key) {
            if(child.category_parent == par.category_id)
            {
                $scope.makeTree(coll, child);
                if(!par.children)
                    par.children = [];
                par.children.push(child);
            }
        });

        return par;
    };

    $scope.dofoo = function()
    {
        alert('do foo');
    };
    
    $scope.init();
};
   


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
                cat: "=cat"
            }, 
            link: function(scope, element, attrs) {
                
                element.bind('click',function(evt) {
                    alert("ID: " + scope.cat.category_id);
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
                        alert("DROPPED: " 
                                + $rootScope.sourceCat.category_name 
                                + " to: " 
                                + scope.cat.category_name);
                        
                    }
                });
            }
        };
    })
    ;



Array.prototype.move = function (old_index, new_index) {
    while (old_index < 0) {
        old_index += this.length;
    }
    while (new_index < 0) {
        new_index += this.length;
    }
    if (new_index < this.length) 
    {
    	this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    }
    
    return this; // for testing purposes
};

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
      this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
};
String.prototype.lpad = function(padString, length) {
	var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
};



