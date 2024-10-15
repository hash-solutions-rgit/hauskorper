#  reset
pm2 stop all
pm2 delete all

# api start
# cd apps/api
# pm2 start yarn --name 'api' -- start


# cd ../..

# admin start
cd apps/admin
pm2 start yarn --name 'admin' -- start

cd ../..

# web start
cd apps/web
pm2 start yarn --name 'web' -- start

# reset
cd ../..




