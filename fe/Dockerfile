# 1단계: build
FROM node:20-alpine AS builder

WORKDIR /app

# package 파일 먼저 복사 (캐시 최적화)
COPY package*.json ./

RUN npm install

# 소스 전체 복사
COPY . .

# Vite build
RUN npm run build


# 2단계: nginx로 서빙
FROM nginx:alpine

# nginx 기본 설정 제거
RUN rm -rf /usr/share/nginx/html/*

# build 결과 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 80 포트 오픈
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]