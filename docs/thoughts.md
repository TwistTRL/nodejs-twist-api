## Cache

several levels cache:

short time -> redis cache
long  time -> some API_CACHE_TABLES in database

## Live data update
output api = api_old_cache + api_new_live

cache data + real time data => 
3 days before + 3 days until now(real time)


## Debug

* since RSS is based on person_id, if same mrn input, different person_id, can we get all the RSS?

for example mrn = '5439731', person_id will be 
[
    {
        "PERSON_ID": 28431729
    },
    {
        "PERSON_ID": 28431875
    }
]
