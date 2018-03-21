#!/usr/bin/env bash

URL=https://yt-dl.org/downloads/latest/youtube-dl

mkdir -p bin

which curl

if [ $? -eq 0 ]; then
	curl -L $URL -o bin/youtube-dl
else
	wget $URL -O bin/youtube-dl
fi

chmod +x bin/youtube-dl
