#!/usr/bin/env bash
set -e
set -o pipefail

POSITIONAL=()

readonly help_display="Usage: $0 [ command_options ] [ param ]

    command options:
        --suite, -s                             choose an e2e suite to run. Default: regression
        --integration, -i                       run the correct e2e integration suite. Default: "" for smoke tests
        --environment, --env                    [1905 | 2005 | ccv2]. Default: 1905
        --help, -h                              show this message and exit
"

while [ "${1:0:1}" == "-" ]
do
    case "$1" in
        '--suite' | '-s' )
            SUITE=$2
            shift
            shift
            ;;
        '--integration' | '-i' )
            INTEGRATION=":$2"
            shift
            shift
            ;;
        '--environment' | '--env' )
            CI_ENV=":$2"
            shift
            shift
            ;;
        '--help' | '-h' )
            echo "$help_display"
            exit 0
            ;;
        * )
            POSITIONAL+=("$1")
            shift

            echo "Error: unknown option: ${POSITIONAL}"
            exit 1
            ;;
    esac
done

set -- "${POSITIONAL[@]}"


if [[ -z "${CI_ENV}" ]]; then
    CI_ENV=":2005"
fi

yarn
(cd projects/storefrontapp-e2e-cypress && yarn)

echo '-----'
echo 'Building Spartacus libraries'
# Currently for our unified app you have to build all libraries to run it
yarn build:libs && yarn build"${INTEGRATION}" 2>&1 | tee build.log

results=$(grep "Warning: Can't resolve all parameters for" build.log || true)
if [[ -z "${results}" ]]; then
    echo "Success: Spartacus production build was successful."
    rm build.log
else
    echo "ERROR: Spartacus production build failed. Check the import statements. 'Warning: Can't resolve all parameters for ...' found in the build log."
    rm build.log
    exit 1
fi


# Hardcoded 2005 becuase cypress.ci.b2b.json currently supports only 2005.
# TODO: The condition should be removed and logic here simplified, when fixing https://github.com/SAP/spartacus/issues/10160
SHOULD_RUN_B2B=false;
if [[ $CI_ENV == '2005' ]]; then 
    SHOULD_RUN_B2B=true;
fi

echo '-----'
echo "Running Cypress end to end tests for suite: $SUITE"
if [[ $SUITE == 'regression' ]]; then
    yarn e2e:cy"${INTEGRATION}":start-run-ci"${CI_ENV}"
    if [[ $SHOULD_RUN_B2B ]]; then 
        yarn e2e:cy"${INTEGRATION}":start-run-ci"${CI_ENV}":b2b
    fi
else
    yarn e2e:cy"${INTEGRATION}":start-run-smoke-ci"${CI_ENV}"
    if [[ $SHOULD_RUN_B2B ]]; then
        yarn e2e:cy"${INTEGRATION}":start-run-smoke-ci"${CI_ENV}":b2b
    fi
fi
