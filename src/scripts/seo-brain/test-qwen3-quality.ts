/**
 * Test Qwen3-30B Quality
 *
 * Quick test to verify the quality improvement with Qwen3-30B
 */

import { ollamaClient } from '../../lib/seo-brain/ollama-client'

async function testQwen3Quality() {
  console.log('Testing Qwen3-30B quality...')
  console.log('')

  const prompt = `Write a detailed, compelling introduction for our premium flyer printing services in Miami, FL.

Product Details:
- 5000 4x6 Flyers
- 9pt Cardstock (premium material)
- 3-4 day turnaround
- Only $179

Your introduction should:
1. Open with Miami's vibrant culture (Wynwood, South Beach, Little Havana)
2. Connect to local businesses and entrepreneurs
3. Describe how quality flyers help brands stand out in Miami's competitive market
4. Mention the product specs (quantity, size, material, turnaround, price)
5. End with a call to action

Make it 140-160 words, SEO-friendly (include keywords like "Miami flyer printing", "premium cardstock"), and professionally written. Write in 3-4 short paragraphs for better readability.

OUTPUT ONLY THE FINAL TEXT - NO explanations or reasoning.`

  console.log('Generating...')

  const response = await ollamaClient.generate({
    system: 'You are a professional copywriter. Output ONLY the final content. You MUST write at least 140 words. Count your words carefully.',
    prompt,
    temperature: 0.7,
    maxTokens: 600, // Ensure enough space for full response
  })

  console.log('')
  console.log('RAW OUTPUT:')
  console.log('===========')
  console.log(response)
  const wordCount = response.trim().split(/\s+/).length
  const hasReasoning = response.includes('Hmm') || response.includes('I need') || response.includes('user wants')

  console.log('')
  console.log('ANALYSIS:')
  console.log('=========')
  console.log(`Word count: ${wordCount} (target: 150)`)
  console.log(`Character length: ${response.length} chars`)
  console.log(`Contains reasoning: ${hasReasoning ? 'YES (❌)' : 'NO (✅)'}`)
  console.log(`Quality: ${!hasReasoning && wordCount >= 120 ? '✅ EXCELLENT' : wordCount >= 100 ? '⚠️ GOOD (too short)' : '❌ POOR'}`)
  console.log('')
  console.log('RECOMMENDATION:')
  console.log('===============')
  if (hasReasoning) {
    console.log('❌ Model shows chain-of-thought reasoning')
    console.log('⚠️ This model is NOT suitable for SEO Brain')
  } else if (wordCount < 120) {
    console.log('⚠️ Output is clean but too short')
    console.log('💡 May need prompt adjustment or higher max_tokens')
  } else {
    console.log('✅ Model produces clean, professional output')
    console.log('✅ RECOMMENDED for SEO Brain')
  }
  console.log('')
  console.log('Test complete!')
}

testQwen3Quality()
