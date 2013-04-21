(ns finance.routes.home
  (:use compojure.core)
  (:require [finance.views.layout :as layout]
            [finance.core :as core]
            [clj-time.core :as date]
            [clj-time.format :as date-fmt]
            [clj-time.coerce :as date-c]
            [ring.util.response :as resp]
            [cheshire.core :as json]
            [clojure.pprint :as pp] 
            [finance.util :as util]))

(defn home-page []
  (layout/render
    "home.html" {:content (util/md->html "/md/docs.md")}))

(defn about-page []
  (layout/render "about.html"))

(defn json-response [data & [status]]
  {:status (or status 200)
   :headers {"Content-Type" "application/json"}
   :body (json/generate-string data)})



(defn format-tx [tx]
  (assoc tx :transaction_date (date-c/to-timestamp (date-fmt/parse (:transaction_date tx) ))))

(defroutes home-routes
           (GET "/" [] (resp/redirect "/index.html" ))
           (GET "/accounts" [] (json-response {:accounts  (core/fetch-accounts)}))
           (POST "/accounts" request 
                 (core/insert-or-update-tx! 
                   (format-tx 
                     (json/parse-string 
                       (slurp (:body request)) true))))
           (DELETE "/accounts/:id" [id] 
                 (core/delete-tx! {:transaction_id id} 
                                  ))
           (GET "/categories" [] (json-response {:categories  (core/fetch-categories)}))
           (GET "/about" [] (about-page)))

