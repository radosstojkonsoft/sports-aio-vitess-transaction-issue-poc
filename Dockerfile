FROM node:20-slim AS builder
ARG NPM_TOKEN  
# Set workdir
WORKDIR /home/app
# Install deps
COPY package*.json ./

# COPY .npmrc ./

RUN echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}\n@nsftx:registry=https://npm.pkg.github.com/" > ./.npmrc && \
    npm ci && \
    rm -f ./.npmrc

# RUN npm ci
# Copy files
COPY . .
# Build
RUN npm run build


FROM node:20-slim AS final
ARG NPM_TOKEN  

# RUN apt-get update && \
#     apt-get install -y \
#       curl \
#       jq \
#       bash \
#       redis-tools
# Set workdir
WORKDIR /home/app
# Install deps
COPY package*.json ./
# COPY .npmrc ./

RUN echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}\n@nsftx:registry=https://npm.pkg.github.com/" > ./.npmrc && \
    npm ci && \
    rm -f ./.npmrc

# RUN npm ci
# Copy files from builder
COPY --from=builder ./home/app/build/src ./src