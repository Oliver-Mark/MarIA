# Usa a imagem oficial do Nginx baseada em Alpine (muito leve)
FROM nginx:alpine

# Publica somente o frontend legado; configurações e backend ficam fora do Nginx.
COPY frontend/ /usr/share/nginx/html/

# Expõe a porta 80 que o Nginx usa internamente
EXPOSE 80
