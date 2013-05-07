(ns finance.core
  (:require [finance.util :as util]
            [clj-time.core :as date]
            [clj-time.format :as date-fmt]
            [clj-time.coerce :as date-c]
            [clj-time.coerce :as date-c]
            [clojure.pprint :as pp] 
            [clojure.java.jdbc :as sql]))


(defn fetch-accounts-- []
   (sql/with-connection util/db
    (sql/with-query-results rows
      ["select * from account"]
      (doall rows)
       )))

(defn fetch-categories []
   (sql/with-connection util/db
    (sql/with-query-results rows
      ["select * from category"]
      (doall rows)
       )))

(defn fetch-transactions []
   (sql/with-connection util/db
    (sql/with-query-results rows
                            ["select 
                             a.account_id,
                             a.account_name,
                             t.transaction_id, 
                             t.amount, 
                             t.check_number, 
                             t.transaction_date, 
                             t.memo, 
                             t.payee , 
                             c.category_name,
                             c.category_id 
                             from 
                             transaction t, category c, account a 
                             where t.category_id = c.category_id
                             and t.account_id = a.account_id
                             "]


                            (doall rows)
                            )))

(defn fetch-accounts- []
  (group-by
    (fn [x]
      {:account_id (:account_id x)
       :account_name (:account_name x)
       }
      )
    (fetch-transactions)
    )) 

(defn fetch-accounts []
  (map (fn [[grp  x]] 
         (assoc grp :transactions (map #(select-keys % [:payee
                                                        :transaction_date 
                                                        :check_number 
                                                        :transaction_id 
                                                        :category_name 
                                                        :category_id 
                                                        :memo 
                                                        :amount]) x)) 
         )
       (fetch-accounts-))) 

(defn insert-tx!
  ""
  [tx]
  {:pre [(map? tx)]}  ; this precondition compiles into a java assertion
  (sql/with-connection 
    util/db
    (sql/transaction
      (let [key-row      (sql/insert-record :transaction
                                            (select-keys tx [:transaction_id
                                                             :payee 
                                                            :transaction_date
                                                            :check_number
                                                            :category_id
                                                            :memo
                                                            :account_id
                                                            :amount]))
            response-key (-> key-row vals first)
            rows         (->> tx 
                           :answers 
                           (remove nil?)
                           (map (fn [ans] (assoc ans :response_id response-key)))) ]
        (apply sql/insert-records :response_detail rows)))))

(defn insert-cat!
  ""
  [cat]
  {:pre [(map? cat)]}  ; this precondition compiles into a java assertion
  (sql/with-connection 
    util/db
    (sql/transaction
        (sql/insert-record :category
                                            (select-keys cat [:category_id
                                                             :category_name 
                                                             :category_parent
                                                            ])) 
      )))

(defn update-cat!
  ""
  [cat]
  {:pre [(map? cat)]}  ; this precondition compiles into a java assertion
  (sql/with-connection 
    util/db
    (sql/transaction
        (sql/update-values :category
                           ["category_id=?" (:category_id cat)]
                                            (select-keys cat [:category_id
                                                              :category_name 
                                                              :category_parent
                                                              ]))
      )))


(defn update-tx!
  ""
  [tx]
  {:pre [(map? tx)]}  ; this precondition compiles into a java assertion
  (sql/with-connection 
    util/db
    (sql/transaction
        (sql/update-values :transaction
                           ["transaction_id=?" (:transaction_id tx)]
                                            (select-keys tx [:transaction_id
                                                             :payee 
                                                            :transaction_date
                                                            :check_number
                                                            :category_id
                                                            :memo
                                                            :account_id
                                                            :amount]))
      )))

(defn delete-tx!
  "prepared statement style"
  [tx]
  (sql/with-connection
    util/db
    (sql/transaction
      (sql/delete-rows
        :transaction
        ["transaction_id=?" (:transaction_id tx)]
        )
      )
    )
  )
(delete-tx! {
               :transaction_id 8
               :transaction_date (date-c/to-timestamp (date-fmt/parse "2013-11-01T06:00:00.000Z" )) 
               :check_number "2"
               :payee "Foo"
               :memo "a memo"
               :amount 50.00 
               :category_id 1
               :account_id 1
               })

(defmulti insert-or-update-tx! (fn [x]  (nil? (:transaction_id x ))))
(defmethod insert-or-update-tx! true [tx]
  (insert-tx! tx)
  )
(defmethod insert-or-update-tx!  false [tx]
  (update-tx! tx)
  )

 
(defmulti insert-or-update-cat! (fn [x]  (nil? (:category_id x ))))
(defmethod insert-or-update-cat! true [cat]
  (insert-cat! cat)
  )
(defmethod insert-or-update-cat!  false [cat]
  (update-cat! cat)
  )

(def qif-rec "D1/3/00
             PTogo's
             M
             T-20.87
             A
             A
             A
             A
             A
             A
             NDebit
             LDining
             ^")
(defn parse-qif [tx]
  (map (fn [line]
         (let [out {}
               ctrl (first line) 
               in (.substring line 1) 
               ]
           (case ctrl 
             \D (assoc out :date in)
             \P (assoc out :payee in) 
             \T (assoc out :amount in) 
             \M (assoc out :memo in) 
             \C (assoc out :cleared in) 
             \L (assoc out :category in) 
             \N (assoc out :check_number in) 
             \A nil 
             \^ ""
             ))) 
       (map clojure.string/trim
            (clojure.string/split-lines tx)))) 
(comment
  (update-tx! {
               :transaction_id 8
               :transaction_date "2013-01-01T05:00:00.000Z"
               :check_number "2"
               :payee "Foo"
               :memo "a memo"
               :amount 50.00 
               :category_id 1
               :account_id 1
               }) 
  (insert-or-update-tx! {
                         :transaction_id 10
                         :transaction_date "2013-02-03 06:00:00"
                         :check_number "1"
                         :payee "Bar"
                         :memo "a memo"
                         :amount 50.00 
                         :category_id 1
                         :account_id 1
                         })

  (parse-qif qif-rec)
  (fetch-categories)

  (pp/pprint 
    (makeTree c {:category_parent 6, :category_name "Utilities", :category_id 5}  )) 
  (pp/pprint 
    (makeTree c nil  )) 

  (pp/pprint c)

  (def c (fetch-categories))

  (pp/pprint 
    (first (makeTree c {} 1))) 

  )


(defn makeTree
  [coll parent]
  (for 
    [x coll 
     :when (= (:category_parent x) (:category_id parent))] 
    #_(assoc-in parent [:children] (conj 
                                   (:children parent) x))
   
     #_(update-in parent [:children] conj x)
     #_(merge parent {:children [x]})  
#_    (makeTree coll x)
    (cons 
       x (makeTree coll x) ) 
    #_(do
      #_(print (apply str (replicate lvl "-"))  x "\n")
      (makeTree coll x) 
      
      ) 
    )
  
  )




