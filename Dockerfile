FROM node:carbon

USER node


WORKDIR /home/node/app

COPY . .
RUN  mkdir -p /home/node/app/node_modules
RUN npm install

ARG APP=app
ARG HOME=/home/node

ENV NPM_CONFIG_PREFIX=$HOME/.npm-global
ENV PATH=$PATH:$HOME/.npm-global/bin

CMD [ "npm", "dev" ]


