#!/bin/bash
#
# Mauricio Esquivel Rogel
# Spring, 2018


# From: https://stackoverflow.com/questions/192249/how-do-i-parse-command-line-arguments-in-bash
function parse_format() {
  format="$1"

  n="${#format}"

  if [[ $n -gt 4 ]]; then
    echo "$0: flag '-s' accepts letters 'd' for date, 't' for time, 'r' for request type, and 'i' for additional info" 1>&2
    return 1
  fi

  while [[ ${#format} -gt 0 ]]; do
    key="${format:0:1}"

    case $key in
      'd')
        if [[ $DATE -ne -1 ]]; then
          echo "$0: date already active" 1>&2
          return 1
        fi

        DATE=1
        ;;

      'i')
        if [[ $INFO -ne -1 ]]; then
          echo "$0: additional info already active" 1>&2
          return 1
        fi

        INFO=1
        ;;

      't')
        if [[ $TIME -ne -1 ]]; then
          echo "$0: time already active" 1>&2
          return 1
        fi

        TIME=1
        ;;

      'r')
        if [[ $REQTYPE -ne -1 ]]; then
          echo "$0: request type already active" 1>&2
          return 1
        fi

        REQTYPE=1
        ;;

      *)
        echo "$0: flag '-s' accepts letters 'd' for date, 't' for time, 'r' for request type, and 'i' for additional info" 1>&2
        return 1
        ;;
    esac

    format="${format:1}"
  done

  return 0
}


function parse_args() {
  POSITIONAL=()
  DATE=-1
  TIME=-1
  INFO=-1
  REQTYPE=-1

  while [[ $# -gt 0 ]]; do
    key="$1"

    case $key in
      -s|--select)
        shift

        if [[ $# -gt 0 ]]; then
          format="$1"

          parse_format "$format"
          status=$?
          if [[ $status -ne 0 ]]; then return $status; fi

          shift
          continue
        fi

        echo "$0: flag '-s' takes 1 argument exactly" 1>&2
        return 1
        ;;

      -f|--filter)
        shift

        if [[ $# -gt 0 ]]; then
          METHOD="$1"
          shift # past value
          continue
        fi

        echo "$0: flag '-f' takes 1 argument exactly" 1>&2
        return 1
        ;;
      *)    # unknown option
        POSITIONAL+=("$1") # save it in an array for later
        shift # past argument
        ;;
    esac
  done
  set -- "${POSITIONAL[@]}"

  if [[ $# -gt 0 ]]; then
    echo "$0: unkonwn arguments: $@" 1>&2
    return 1
  fi

  if [ -n "$METHOD" ]; then
    if [ "$METHOD" != "GET" ] && [ "$METHOD" != "POST" ]; then
      echo "$0: GET and POST requests only" 1>&2
      return 1
    fi
  fi

  if [[ $DATE -eq -1 ]] && [[ $TIME -eq -1 ]]; then
    if [[ $REQTYPE -eq -1 ]] && [[ $INFO -eq -1 ]]; then
      DATE=1
      TIME=1
      REQTYPE=1
      INFO=1

      return 0
    fi
  fi

  if [[ $DATE -eq -1 ]]; then DATE=0; fi
  if [[ $TIME -eq -1 ]]; then TIME=0; fi
  if [[ $REQTYPE -eq -1 ]]; then REQTYPE=0; fi
  if [[ $INFO -eq -1 ]]; then INFO=0; fi

  return 0
}

parse_args $@

if [ "$?" != "0" ]; then exit 1; fi

herokulogs="$(heroku logs -a paint-the-town | grep '\[web.1\]' | sed 's/[0-9 a-z\.\+:\-]*\[web\.1\]: //i')"
lines=$(echo "$herokulogs" | grep "$METHOD")

if [[ ${#lines} -eq 0 ]]; then exit 0; fi

if [ "$?" != "0" ]; then exit 2; fi

./analyzer/analyzer "$DATE" "$TIME" "$REQTYPE" "$INFO" "$lines"

if [ "$?" != "0" ]; then exit 3; fi

exit 0
