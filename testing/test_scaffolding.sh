#!/bin/bash
#
# Test basic scaffolding capability.
#
# Last edit: 01-31-18, Mauricio Esquivel Rogel.

mongo < clear_db.txt > /dev/null

echo -e -n "Creating color red.\nResponse: "
res="$(curl --data 'name=red&hex=#ff0000&rgb[]=255&rgb[]=0&rgb[]=0' http://localhost:9090/api/colors 2> /dev/null)"
colorid="$(cut -d '"' -f 4 <<< $res)"
echo -e "$res\n"

echo -e -n "Creating red team 'Super Red'.\nResponse: "
cmd="name=Super%20Red&color=$colorid"
res="$(curl --data $cmd http://localhost:9090/api/teams 2> /dev/null)"
teamid="$(cut -d '"' -f 4 <<< $res)"
echo -e "$res\n"

echo -e -n "Adding user Walter Snyder.\nResponse: "
res="$(curl --data 'name=Walter&lastName=Snyder&email=walter.snyder@dartmouth.edu&password=1234' http://localhost:9090/api/signup 2> /dev/null)"
token="$(cut -d '"' -f 4 <<< $res)"
auth="Authorization: $token"
echo -e "$res\n"

echo -e -n "Adding Walter Snyder to Super Red.\nResponse: "
echo "$auth"
res="$(curl -X PUT --data team=$teamid http://localhost:9090/api/users -H $auth 2> /dev/null)"
echo -e "$res\n"
