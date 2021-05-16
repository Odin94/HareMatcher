#!/bin/bash
set -e

gradlew -t build &
gradlew run