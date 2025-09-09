const webpush = require('web-push')

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys()

console.log('===========================================')
console.log('VAPID Keys Generated Successfully!')
console.log('===========================================')
console.log('')
console.log('Add these to your .env.local file:')
console.log('')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`)
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`)
console.log(`VAPID_SUBJECT="mailto:support@gangrunprinting.com"`)
console.log('')
console.log('===========================================')
console.log('IMPORTANT: Keep the private key secret!')
console.log('===========================================')