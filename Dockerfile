FROM node

# set working directory
WORKDIR /app

COPY . /app/

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

RUN yarn install 
RUN yarn global add serve

RUN yarn run build # compile

# start app
# CMD ["npm", "start"]
CMD serve -s build -l tcp://0.0.0.0:3000
