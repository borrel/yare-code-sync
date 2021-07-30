FROM node:14

# Add Tini
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]


RUN mkdir -p /app/dist /app/bot
RUN chown -R node:node /app


USER node

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm install 

ENV NODE_ENV=production

COPY --chown=node:node . ./
RUN ./node_modules/.bin/grunt browserify && rm -rf node_modules





RUN npm install
RUN npm cache clean --force

ENV CUSTOM_CODE_PATH=/app/bot/code.js

#use a volume to override
RUN ln -s /app/dist/main.js bot/code.js



VOLUME /app/bot

EXPOSE 4000/tcp

CMD ["node", "server/run.js"]
