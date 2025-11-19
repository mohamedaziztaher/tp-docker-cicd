# Image de base : Node.js 18 sur Alpine Linux (léger)
FROM node:18-alpine
# Répertoire de travail dans le conteneur
WORKDIR /app

# Optimisation du cache Docker : copier d'abord les dépendances
COPY package*.json ./
RUN npm install # Installe les dépendances dans node_modules

# Copier le reste du code source
COPY . .

# Documentation : le conteneur écoute sur 3000
EXPOSE 3000
CMD ["npm", "start"]