# Run migrations
npx -y migrate-mongo up

# Start the first process
node apps/admin/server.js