# Development stage
FROM node:20.19-alpine

WORKDIR /app

# Expose port 3000 for Vite dev server
EXPOSE 3000

# Install dependencies and start dev server
# Dependencies will be installed from the mounted volume
CMD sh -c "npm install && npm run dev -- --host 0.0.0.0 --port 3000"                                                         
