FROM node:18 as build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json frontend/yarn.lock ./
RUN yarn install
COPY --chmod=0644 frontend/. .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY proxy/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
