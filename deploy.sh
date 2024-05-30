#!/bin/sh
cd ./build
git init
git branch -m gh-pages
echo "pendingtx.conflux123.xyz" >> CNAME
git add .
git commit -m "Automatic deploy"
git remote add origin git@github.com:conflux-fans/pending-tx-checker.git
git push origin gh-pages -f