#!/bin/bash
cd app/
npm run build
cd ../server/
cp -rv ../app/build/ build/
fly deploy
