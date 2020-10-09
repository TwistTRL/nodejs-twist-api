## Cache

several levels cache:

short time -> redis cache
long  time -> some API_CACHE_TABLES in database

## Live data update
output api = api_old_cache + api_new_live

cache data + real time data => 
3 days before + 3 days until now(real time)