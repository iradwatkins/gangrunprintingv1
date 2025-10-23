#!/usr/bin/env npx tsx

/**
 * SEO Brain Telegram Setup Script
 *
 * Helps you:
 * 1. Get your Telegram Chat ID
 * 2. Test the connection
 * 3. Verify bot is working
 */

import { testTelegramConnection } from '@/lib/seo-brain/telegram-notifier'

const BOT_TOKEN =
  process.env.SEO_BRAIN_TELEGRAM_BOT_TOKEN || '7510262123:AAFiInboeGKrhovu8hcmDvZsDgEpS3W1yWs'
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

async function main() {
  console.log('🤖 SEO Brain Telegram Setup\n')
  console.log('='.repeat(60))

  // Step 1: Check if chat ID is configured
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID

  if (!chatId) {
    console.log('\n❌ TELEGRAM_ADMIN_CHAT_ID not found in .env\n')
    console.log('📋 Follow these steps to get your Chat ID:\n')
    console.log('1. Open Telegram on your phone/desktop')
    console.log('2. Search for @userinfobot')
    console.log('3. Start a conversation with the bot')
    console.log('4. Send any message')
    console.log('5. Bot will reply with your Chat ID (a number like: 123456789)')
    console.log('6. Add to .env file:')
    console.log('   TELEGRAM_ADMIN_CHAT_ID=your_chat_id_here\n')
    console.log('='.repeat(60))
    console.log('\n💡 Alternative method: Get updates from your bot\n')

    await showRecentUpdates()
    return
  }

  // Step 2: Test connection
  console.log(`\n✅ Chat ID found: ${chatId}`)
  console.log('\n🔌 Testing connection...\n')

  const result = await testTelegramConnection()

  if (result.success) {
    console.log('✅ SUCCESS! Telegram bot is connected!\n')
    console.log('📬 Check your Telegram - you should have received a test message.')
    console.log('\n🎉 SEO Brain is ready to send you alerts!\n')
    console.log('='.repeat(60))
  } else {
    console.log('❌ Connection failed\n')
    console.log(`Error: ${result.error}\n`)
    console.log('🔍 Troubleshooting:\n')
    console.log('1. Check that TELEGRAM_ADMIN_CHAT_ID is correct')
    console.log('2. Make sure you started a conversation with the bot first')
    console.log('3. Search for "Micheal (SEO LLM Landing Page Master)" on Telegram')
    console.log('4. Click "Start" button to activate the bot\n')
    console.log('='.repeat(60))
  }
}

/**
 * Show recent updates/messages to help find chat ID
 */
async function showRecentUpdates() {
  try {
    const response = await fetch(`${TELEGRAM_API}/getUpdates`)
    const data = await response.json()

    if (data.ok && data.result.length > 0) {
      console.log('📨 Recent messages to your bot:\n')

      for (const update of data.result.slice(-5)) {
        // Show last 5 updates
        if (update.message) {
          const from = update.message.from
          console.log(`From: ${from.first_name} ${from.last_name || ''}`)
          console.log(`Chat ID: ${from.id}`)
          console.log(`Username: @${from.username || 'none'}`)
          console.log(`Message: ${update.message.text || 'N/A'}`)
          console.log('-'.repeat(40))
        }
      }

      console.log('\n💡 Use one of the Chat IDs above in your .env file')
      console.log('   (Usually yours is the most recent one)\n')
    } else {
      console.log('No recent messages found.')
      console.log('\n💡 To get your Chat ID:')
      console.log('1. Open Telegram')
      console.log('2. Search for "Micheal (SEO LLM Landing Page Master)"')
      console.log('3. Send any message (like "hello")')
      console.log('4. Run this script again\n')
    }
  } catch (error) {
    console.error('Error fetching updates:', error)
  }
}

main().catch(console.error)
