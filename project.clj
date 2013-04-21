(defproject
  finance
  "0.1.0-SNAPSHOT"
  :dependencies
  [[org.clojure/clojure "1.5.1"]
   [org.clojure/java.jdbc "0.2.3"]
   [mysql/mysql-connector-java "5.1.6"]
   [lib-noir "0.4.9"]
   [compojure "1.1.5"]
   [clj-json "0.5.1"]
   [clj-time "0.5.0"]
   [ring-server "0.2.7"]
   [com.taoensso/timbre "1.5.2"]
   [com.taoensso/tower "1.2.0"]
   [markdown-clj "0.9.19"]
   [cheshire "5.0.2"]
   [clabango "0.5"]]
  :ring
  {:handler finance.handler/war-handler,
   :init finance.handler/init,
   :destroy finance.handler/destroy}
  :profiles
  {:production
   {:ring
    {:open-browser? false, :stacktraces? false, :auto-reload? false}},
   :dev
   {:dependencies [[ring-mock "0.1.3"] [ring/ring-devel "1.1.8"]]}}
  :url
  "http://example.com/FIXME"
  :plugins
  [[lein-ring "0.8.3"]]
  :description
  "FIXME: write description"
  :min-lein-version "2.0.0")
