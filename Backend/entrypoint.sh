#!/bin/bash
# set -e

npx prisma migrate deploy
npx prisma generate
yarn start:dev
