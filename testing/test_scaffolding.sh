#!/bin/bash
#
# Test basic scaffolding capability.
#
# Last edit: 01-31-18, Mauricio Esquivel Rogel.

mongo < clear_db.txt > /dev/null

echo -e -n "Creating color red.\nResponse: "
res="$(curl --data 'name=red&hex=#ff0000&rgb[]=255&rgb[]=0&rgb[]=0' http://localhost:9090/api/colors 2> /dev/null)"
red="$(cut -d '"' -f 4 <<< $res)"
echo -e "$res\n"

echo -e -n "Creating color blue.\nResponse: "
res="$(curl --data 'name=blue&hex=#0000ff&rgb[]=0&rgb[]=0&rgb[]=255' http://localhost:9090/api/colors 2> /dev/null)"
blue="$(cut -d '"' -f 4 <<< $res)"
echo -e "$res\n"

echo -e -n "Creating red team 'Super Red'.\nResponse: "
cmd="name=Super%20Red&color=$red"
res="$(curl --data $cmd http://localhost:9090/api/teams 2> /dev/null)"
redteam="$(cut -d '"' -f 4 <<< $res)"
echo -e "$res\n"

echo -e -n "Creating blue team 'Hyper Blue'.\nResponse: "
cmd="name=Hyper%20Blue&color=$blue"
res="$(curl --data $cmd http://localhost:9090/api/teams 2> /dev/null)"
blueteam="$(cut -d '"' -f 4 <<< $res)"
echo -e "$res\n"

echo -e -n "Adding user Walter Snyder.\nResponse: "
res="$(curl --data 'name=Walter&lastName=Snyder&email=walter.snyder@dartmouth.edu&password=1234' http://localhost:9090/api/signup 2> /dev/null)"
tokenred="$(cut -d '"' -f 4 <<< $res)"
echo -e "$res\n"

echo -e -n "Adding user Grandpa Tom.\nResponse: "
res="$(curl --data 'name=Grandpa&middleName=Tom&lastName=Bauer&email=grandpa.t.bauer@dartmouth.edu&password=432112' http://localhost:9090/api/signup 2> /dev/null)"
tokenblue="$(cut -d '"' -f 4 <<< $res)"
grandpa_id="$(cut -d '"' -f 8 <<< $res)"
echo -e "$res\n"

echo -e -n "Adding Walter Snyder to Super Red.\nResponse: "
curl -X PUT -H "Authorization: JWT $tokenred" --data "team=$redteam" http://localhost:9090/api/users 2> /dev/null
echo -e "\n"

echo -e -n "Adding Grandpa Tom to Hyper Blue.\nResponse: "
curl -X PUT -H "Authorization: JWT $tokenblue" --data "team=$blueteam" http://localhost:9090/api/users 2> /dev/null
echo -e "\n"

echo -e -n "Adding Grandpa Tom and Walter Snyder to each other's friend lists.\nResponse: "
curl -X POST -H "Authorization: JWT $tokenred" --data "friend=$grandpa_id" http://localhost:9090/api/users/friends 2> /dev/null
echo -e "\n"

echo -e -n "Fetching Walter Snyder's user data.\nResponse: "
curl -H "Authorization: JWT $tokenred" http://localhost:9090/api/users 2> /dev/null
echo -e "\n"

echo -e -n "Fetching Grandpa Tom's user data.\nResponse: "
curl -X GET -H "Authorization: JWT $tokenblue" http://localhost:9090/api/users 2> /dev/null
echo -e "\n"
