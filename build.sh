#!/bin/sh

yarn build

web-ext build -s . --overwrite-dest
