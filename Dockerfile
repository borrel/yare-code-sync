FROM node:14

# Add Tini
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]




RUN mkdir -p /app/dist
RUN chown -R node:node /app


USER node

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .


ENV NODE_ENV=production

RUN ./node_modules/.bin/grunt browserify

RUN rm -rf node_modules gruntfile.js client

RUN npm install
RUN npm cache clean --force


ENV CUSTOM_CODE_PATH="/app/dist/bot.js"
RUN touch $CUSTOM_CODE_PATH

VOLUME /app/dist

EXPOSE 4000/tcp

CMD ["node", "server/run.js"]
