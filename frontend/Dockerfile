# Image Nginx légère
FROM nginx:alpine

# Copier fichiers statiques dans répertoire par défaut Nginx
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/

# Port HTTP standard du conteneur
EXPOSE 80

# CMD par défaut Nginx : nginx -g 'daemon off;'