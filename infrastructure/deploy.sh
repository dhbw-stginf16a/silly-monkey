pushd silly-monkey; git pull; popd
docker system prune -a
bash dc.sh pull
bash dc.sh up --force-recreate -d
