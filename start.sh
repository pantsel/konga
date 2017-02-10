#!/bin/bash

cd frontend
gulp dist

cd ..
npm run production
