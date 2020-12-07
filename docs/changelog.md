## 12/6
1. updated `ADT_PERSONNEL` added `CONTACT_NUM`
2. `RSS_UPDATED` added `OXYGEN_FLOW_RATE` and `PRSNL_NAME`
3. `RSS_UPDATED` changed `FIO2` ==> `FIO2` * 100 to make it a percent number
4. updated census API, divided into two parts: 
fast=> census-init, 
slow but more details about rss + weight + age + diagnosis => census
