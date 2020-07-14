FROM node:lts

WORKDIR /usr/src/app

COPY ./tsconfig.json ./
COPY ./shared-interfaces ./shared-interfaces

WORKDIR /usr/src/app/backend

COPY ./backend/package*.json ./

RUN npm install

COPY ./backend . 

EXPOSE 3000
CMD ["npm", "run", "start:prod"]

