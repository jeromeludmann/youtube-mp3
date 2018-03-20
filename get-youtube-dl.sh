#!/usr/bin/env bash

mkdir -p bin
curl -L https://yt-dl.org/downloads/latest/youtube-dl -o bin/youtube-dl
chmod +x bin/youtube-dl
