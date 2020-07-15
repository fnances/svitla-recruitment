FROM node:lts

WORKDIR /usr/src/app

COPY ./tsconfig.json ./
COPY ./shared-interfaces ./shared-interfaces

WORKDIR /usr/src/app/backend

COPY ./backend/package*.json ./

RUN npm install

COPY ./backend . 

# ADD ./backend/ssl/server_cert.pem /usr/local/share/ca-certificates/foo.crt 
# RUN chmod 644 /usr/local/share/ca-certificates/foo.crt && update-ca-certificates 

EXPOSE 3000
CMD ["npm", "run", "start:prod"]

