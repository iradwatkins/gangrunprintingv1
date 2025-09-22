module.exports = {
  apps: [{
    name: 'gangrunprinting',
    script: 'server.js',
    cwd: '/root/websites/gangrunprinting',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    min_uptime: '10s',
    max_restarts: 5,
    restart_delay: 4000,
    exp_backoff_restart_delay: 100,
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    error_file: '/root/.pm2/logs/gangrunprinting-error.log',
    out_file: '/root/.pm2/logs/gangrunprinting-out.log',
    log_file: '/root/.pm2/logs/gangrunprinting-combined.log',
    time: true,
    merge_logs: true,
    kill_timeout: 10000,
    listen_timeout: 10000,
    shutdown_with_message: true
  }]
}