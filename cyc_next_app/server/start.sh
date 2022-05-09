#!/bin/bash

echo "start our services"
source `poetry env info --path`/bin/activate
npm start