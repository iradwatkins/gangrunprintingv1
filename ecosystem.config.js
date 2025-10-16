module.exports = {
  apps: [
    {
      name: 'gangrunprinting',
      script: 'node_modules/.bin/next',
      args: 'start -p 3002',
      cwd: '/root/websites/gangrunprinting',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '2G', // INCREASED: Handle large file uploads
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      exp_backoff_restart_delay: 100,

      // CRITICAL FIX: Node.js options for large uploads
      node_args: '--max-old-space-size=2048 --max-http-header-size=32768',

      env: {
        NODE_ENV: 'production',
        PORT: 3002,

        // CRITICAL FIX: Increase Node.js limits for file uploads
        NODE_OPTIONS: '--max-old-space-size=2048 --max-http-header-size=32768',

        // CRITICAL FIX: Keep connections alive during uploads
        SERVER_KEEPALIVE_TIMEOUT: '65000',
        SERVER_HEADERS_TIMEOUT: '66000',

        // Domain Configuration
        DOMAIN: 'gangrunprinting.com',
        NEXTAUTH_URL: 'https://gangrunprinting.com',
        NEXT_PUBLIC_APP_URL: 'https://gangrunprinting.com',

        // Database Configuration
        DATABASE_URL:
          'postgresql://gangrun_user:GangRun2024Secure@localhost:5434/gangrun_db?schema=public',

        // Authentication
        AUTH_SECRET: 'gangrun_super_secret_auth_key_2024_production_ready',
        AUTH_GOOGLE_ID: '180548408438-40kht5tlgpiim2j4qhu0qs1mtonvnanq.apps.googleusercontent.com',
        AUTH_GOOGLE_SECRET: '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',
        // Add aliases for Google OAuth (required by lucia-auth)
        GOOGLE_CLIENT_ID: '180548408438-40kht5tlgpiim2j4qhu0qs1mtonvnanq.apps.googleusercontent.com',
        GOOGLE_CLIENT_SECRET: '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',
        AUTH_TRUST_HOST: 'true',

        // Email Configuration
        RESEND_API_KEY: 're_RCghUkhK_DsEK3Z5N4MyMJ3EfqUemU1yC',
        RESEND_FROM_EMAIL: 'noreply@gangrunprinting.com',
        RESEND_FROM_NAME: 'GangRun Printing',

        // Redis Configuration
        REDIS_URL: 'redis://localhost:6379',
        REDIS_PASSWORD: '',

        // MinIO/S3 Configuration for File Storage
        MINIO_ENDPOINT: 'localhost',
        MINIO_PUBLIC_ENDPOINT: 'https://gangrunprinting.com/minio',
        MINIO_PORT: '9000',
        MINIO_ACCESS_KEY: 'gangrun_minio_access',
        MINIO_SECRET_KEY: 'gangrun_minio_secret_2024',
        MINIO_USE_SSL: 'false',
        MINIO_BUCKET_NAME: 'gangrun-uploads',

        // Square Payment Configuration - PRODUCTION (LIVE)
        SQUARE_ACCESS_TOKEN: 'EAAAlxUo1UKk1Lin6wHkpILz-NgqN0-OiNMWN9LBAK-axvt4gmBUCKw8PW1HZeJD',
        SQUARE_ENVIRONMENT: 'production',
        NEXT_PUBLIC_SQUARE_ENVIRONMENT: 'production',
        SQUARE_LOCATION_ID: 'LWMA9R9E2ENXP',
        SQUARE_APPLICATION_ID: 'sq0idp-AJF8fI5VayKCq9veQRAw5g',
        NEXT_PUBLIC_SQUARE_LOCATION_ID: 'LWMA9R9E2ENXP',
        NEXT_PUBLIC_SQUARE_APPLICATION_ID: 'sq0idp-AJF8fI5VayKCq9veQRAw5g',
      },
      error_file: '/root/.pm2/logs/gangrunprinting-error.log',
      out_file: '/root/.pm2/logs/gangrunprinting-out.log',
      log_file: '/root/.pm2/logs/gangrunprinting-combined.log',
      time: true,
      merge_logs: true,
      kill_timeout: 60000, // INCREASED: 60 seconds for graceful shutdown during uploads
      listen_timeout: 30000, // INCREASED: 30 seconds for app startup
      wait_ready: false, // DISABLED: Next.js doesn't send ready signal
      shutdown_with_message: true,
    },
  ],
}
