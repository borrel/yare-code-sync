FROM node:14.18.3 as start

RUN mkdir -p /app/dist /app/bot
RUN chown -R node:node /app

# Add Tini
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

USER node

WORKDIR /app

COPY --chown=node:node package*.json ./
RUN npm install --production 

EXPOSE 4000/tcp


#builder
FROM start as builder

RUN npm install && npm cache clean --force

ENV NODE_ENV=production

COPY --chown=node:node . ./
RUN ./node_modules/.bin/grunt browserify 
#use a volume to override intire source
VOLUME /app

CMD ["node", "node_modules/.bin/grunt"]

#runner
FROM start as runner

RUN npm cache clean --force


COPY --from=builder /app/dist /app/dist

ENV NODE_ENV=production

ENV CUSTOM_CODE_PATH=/app/bot/code.js

#use a volume to override the bot
RUN ln -s /app/dist/main.js bot/code.js 
VOLUME /app/bot


CMD ["node", "server/run.js"]
