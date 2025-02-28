FROM mcr.microsoft.com/playwright:v1.50.1

WORKDIR /e2e

COPY package.json yarn.lock ./

RUN yarn install

CMD ["npx", "playwright", "test"]
