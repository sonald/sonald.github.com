#!/bin/zsh

if [ $# -lt 2 ]; then
    echo "need src dest dir to compare"
    exit 1
fi

pushd $1
print -l *(e:'[[ ! -e $2/$REPLY ]]':) 2>/dev/null
popd


#pushd $2
#print -l *(e:'[[ ! -e $1/$REPLY ]]':) 2>/dev/null
#popd
