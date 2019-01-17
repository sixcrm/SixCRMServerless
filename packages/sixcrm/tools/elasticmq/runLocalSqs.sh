#!/bin/bash
ELASTIC_DIR=tools/elasticmq
BINDIR=bin
FILENAME=elasticmq-server-0.13.2.jar
DOWNLOAD_URL=https://s3-eu-west-1.amazonaws.com/softwaremill-public/${FILENAME}

# To find out more about ElasticMQ visit: https://github.com/adamw/elasticmq

# Download standalone elasticmq distribution if not present.
mkdir -p ${BINDIR}

if [ ! -f ${BINDIR}/elasticmq-server-0.13.2.jar ]; then
    # Detect which program to use for downloading.
    which wget > /dev/null && DOWNLOADER='wget'
    which curl > /dev/null && DOWNLOADER='curl -O'
    # If nothing available, warn the user.
    (which wget > /dev/null || which curl > /dev/null) || echo 'Please install curl or wget.'

    cd  ${BINDIR}
    ${DOWNLOADER} ${DOWNLOAD_URL}
    cd ..
fi

# Warn the user if we don't have Java.
which java > /dev/null || echo 'Please install Java.'

# Run elasticmq
java -Dlogback.configurationFile=${ELASTIC_DIR}/sqs-local-logback.xml -Dconfig.file=${ELASTIC_DIR}/sqs-local.conf -jar ${BINDIR}/${FILENAME}
