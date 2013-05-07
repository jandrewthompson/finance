
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
           //           $scope.$watch('categories',function(newVal,oldVal) { alert('changed'); });
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
