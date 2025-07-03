module.exports = {
  apps: [
    {
      name: 'kariz-app',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/kalame/kalame-panel', // مسیر پروژه روی سرور
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      },
      error_file: '/var/log/pm2/kariz-error.log',
      out_file: '/var/log/pm2/kariz-out.log',
      log_file: '/var/log/pm2/kariz-combined.log',
      time: true,
      // Restart on file changes (optional)
      ignore_watch: [
        'node_modules',
        '.next',
        'logs',
        '*.log'
      ],
      // Auto restart on crash
      max_restarts: 10,
      min_uptime: '10s',
      // Kill timeout
      kill_timeout: 5000,
      // Graceful shutdown
      listen_timeout: 3000,
      // Environment variables
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      }
    }
  ],

  deploy: {
    production: {
      user: 'root', // یا نام کاربری سرور
      host: 'your-server-ip', // IP سرور
      ref: 'origin/main', // branch
      repo: 'your-repo-url', // آدرس repository
      path: '/var/www/kalame/kalame-panel', // مسیر deploy
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 