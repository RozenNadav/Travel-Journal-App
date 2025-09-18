# frontend/Dockerfile
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

# העתק את כל הקבצים שבתקיית frontend (Docker כבר ב-build context של frontend)
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
