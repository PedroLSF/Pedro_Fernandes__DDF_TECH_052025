FROM node:20

WORKDIR /app

RUN apt-get update -qq && \
    apt-get upgrade -yqq && \
    rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./

RUN yarn install --check-files

COPY . .

RUN npx prisma generate

RUN yarn build

RUN chmod +x /app/entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/app/entrypoint.sh"]