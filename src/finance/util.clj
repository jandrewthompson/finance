(ns finance.util
  (:require [noir.io :as io]
            [markdown.core :as md]))

(defn format-time
  "formats the time using SimpleDateFormat, the default format is
   \"dd MMM, yyyy\" and a custom one can be passed in as the second argument"
  ([time] (format-time time "dd MMM, yyyy"))
  ([time fmt]
    (.format (new java.text.SimpleDateFormat fmt) time)))

(defn md->html
  "reads a markdown file from public/md and returns an HTML string"
  [filename]
  (->>
    (io/slurp-resource filename)
    (md/md-to-html-string)))

#_(def db {:name "jdbc/finance"})

(def db {:subprotocol "mysql"
         :subname "//127.0.0.1:3306/finance"
         :user "finance"
         :password "finance"})


#_(def db
  {:classname   "org.h2.Driver",
   :subprotocol "h2",  
   :subname "tcp://localhost/target/db"
   :user "sa"
   :password "sa"})


