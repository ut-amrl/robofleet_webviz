yarn build

rm -r /var/www/robofleet-webviz/*
cp -r build/* /var/www/robofleet-webviz/
