
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
            //$scope.selected_category = {'category_id':tx.category_id,
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
	$rootScope.activeTab = $route.current.activeTab;
	$scope.accounts = [{'id':100,
                        'name':'Andrews Checking',
                        'transactions':[
                            {'id':1,
                                'amount':10.00,
                                'payee':'Walmart',
                                'category':'Groceries',
                                'date':'03-29-2013',
                                'checknum':101},
                            {'id':2,
                                'amount':20.00,
                                'payee':'Joes',
                                'category':'Groceries',
                                'date':'03-29-2013',
                                'checknum':102}
        ]}];


    $scope.account = $scope.accounts[0];
};

function BudgetCtrl($scope, $rootScope, $route, $routeParams, Categories )
{
    $scope.categories_test = [
        {'id':0, 'name':'A'},
        {'id':1, 'name':'B', 'pid':0},
        {'id':2, 'name':'C', 'pid':0},
        {'id':3, 'name':'D', 'pid':1},
        {'id':4, 'name':'E', 'pid':1},
        {'id':5, 'name':'F', 'pid':3},
        {'id':6, 'name':'G', 'pid':0},
        {'id':7, 'name':'H', 'pid':0},
        {'id':8, 'name':'I', 'pid':0},
        {'id':9, 'name':'J', 'pid':0}];
 
    $scope.doit = function(cat)
    {
        cat.category_parent = 1;
        alert(cat.category_parent);
        $scope.topCategory = $scope.makeTree($scope.topCategory, {},0);
    };
    $scope.mytree = [
        { 
            name: 'item1',
            children: [
                {name:'child1'}
                ]}
        ];
    $scope.init = function()
    {
        Categories.get( function(data){
            $scope.categories = data.categories;
            $scope.topCategory = $scope.makeTree($scope.categories, {}, 0);
        });
    };
    $scope.init();

    $scope.makeTree = function(coll, par, lvl)
    {
        angular.forEach(coll, function(child,key) {
            if(child.category_parent == par.category_id)
            {
                $scope.makeTree(coll, child,++lvl);
                if(!par.children)
                    par.children = [];
                par.children.push(child);
                child.level=lvl;
                child.levelPad=new Array(lvl).join(" -- ");
            }
        });

        return par;
    };

    $scope.dofoo = function()
    {
        alert('do foo');
    };
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
    directive('draggable', function() {
        return {
            restrict:'A',
            link: function(scope, element, attrs) {
                element.draggable({
                    revert:true
                });
            }
        };
    }).
    directive('droppable', function() {
        return {
            restrict:'A',
            link: function(scope, element, attrs) {
                element.droppable({
                    accept: ".category",
                    hoverClass: "drop-hover",
                    drop:function(event,ui,$scope) {
                        alert(scope.c.category_name);
                        scope.$parent.init();
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



