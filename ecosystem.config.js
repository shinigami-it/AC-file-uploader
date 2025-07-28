module.exports = {
  apps: [
    {
      name: 'assetto-fileuploading',
      script: './start-server.sh',
      watch: ['server.js', 'protected', 'routes', 'views'],
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}