/**
 * Generate Factory Floor Photos
 *
 * Creates two product photos from Factory Floor template:
 * 1. Eye-level Bumper Sticker
 * 2. 45-degree angle Banner
 */

const https = require('https');

const BASE_URL = 'https://gangrunprinting.com';
const TEMPLATE_ID = 'betzvu58rbs997ek5c9g4lne'; // Factory Floor template

// Helper to make authenticated requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': process.env.AUTH_COOKIE || '', // Will use existing session
      },
    };

    const url = new URL(path, BASE_URL);
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`${res.statusCode}: ${parsed.error || data}`));
          } else {
            resolve({ status: res.statusCode, data: parsed });
          }
        } catch (e) {
          if (res.statusCode >= 400) {
            reject(new Error(`${res.statusCode}: ${data}`));
          } else {
            resolve({ status: res.statusCode, data: data });
          }
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function main() {
  console.log('🏭 Generating Factory Floor Photos...\n');

  try {
    // Photo 1: Eye-level Bumper Sticker
    console.log('📸 Photo 1: Eye-level Bumper Sticker');
    console.log('Creating copy from template...');

    const copy1 = await makeRequest('POST', '/api/prompts/from-template', {
      templateId: TEMPLATE_ID
    });

    const promptId1 = copy1.data.promptId;
    console.log(`✓ Created prompt: ${promptId1}`);

    // Update prompt for eye-level + bumper sticker
    console.log('Updating prompt text...');
    const eyeLevelPrompt = `Professional product photography of BUMPER STICKER on industrial work table, centered, product is focal point.

BUMPER STICKER in sharp focus showing vivid colors, text readable, quality evident, fresh from press.

Setting: clean industrial surface on printing factory floor, product dominant.

Background (soft focus): large commercial printing press machinery blurred behind, factory equipment, paper rolls, industrial printing environment.

Props: minimal - fresh printed stack to side, color strips, printing tools barely visible.

Lighting: bright industrial overhead on product, factory floor ambient behind, accurate colors.

Atmosphere: real manufacturing facility, "we print in-house" credibility, working factory authenticity, "see where it's made" transparency.

Product focus: 90% on details, 10% factory context, sharp product with press machinery softly blurred.

Branding: GangRunPrinting elements on equipment if visible (blurred).

Canon EOS R5, eye-level straight-on angle, shallow depth of field, product photography, 4:3`;

    await makeRequest('PATCH', `/api/prompts/${promptId1}`, {
      name: 'Factory Floor - Eye Level Bumper Sticker',
      promptText: eyeLevelPrompt,
    });

    console.log('Generating image...');
    const result1 = await makeRequest('POST', `/api/prompts/${promptId1}/generate`, {
      aspectRatio: '4:3',
      imageSize: '2K'
    });

    console.log(`✓ Generated! View at: ${BASE_URL}/en/admin/design-center/${promptId1}/edit\n`);

    // Photo 2: 45-degree Banner
    console.log('📸 Photo 2: 45-Degree Angle Banner');
    console.log('Creating copy from template...');

    const copy2 = await makeRequest('POST', '/api/prompts/from-template', {
      templateId: TEMPLATE_ID
    });

    const promptId2 = copy2.data.promptId;
    console.log(`✓ Created prompt: ${promptId2}`);

    // Update prompt for 45-degree + banner
    console.log('Updating prompt text...');
    const anglePrompt = `Professional product photography of BANNER on industrial work table, centered, product is focal point.

BANNER in sharp focus showing vivid colors, text readable, quality evident, fresh from press.

Setting: clean industrial surface on printing factory floor, product dominant.

Background (soft focus): large commercial printing press machinery blurred behind, factory equipment, paper rolls, industrial printing environment.

Props: minimal - fresh printed stack to side, color strips, printing tools barely visible.

Lighting: bright industrial overhead on product, factory floor ambient behind, accurate colors.

Atmosphere: real manufacturing facility, "we print in-house" credibility, working factory authenticity, "see where it's made" transparency.

Product focus: 90% on details, 10% factory context, sharp product with press machinery softly blurred.

Branding: GangRunPrinting elements on equipment if visible (blurred).

Canon EOS R5, 45-degree angle, shallow depth of field, product photography, 4:3`;

    await makeRequest('PATCH', `/api/prompts/${promptId2}`, {
      name: 'Factory Floor - 45 Degree Banner',
      promptText: anglePrompt,
    });

    console.log('Generating image...');
    const result2 = await makeRequest('POST', `/api/prompts/${promptId2}/generate`, {
      aspectRatio: '4:3',
      imageSize: '2K'
    });

    console.log(`✓ Generated! View at: ${BASE_URL}/en/admin/design-center/${promptId2}/edit\n`);

    // Summary
    console.log('✅ COMPLETE! Both photos generated successfully\n');
    console.log('📷 Photo 1 - Eye-level Bumper Sticker:');
    console.log(`   ${BASE_URL}/en/admin/design-center/${promptId1}/edit`);
    console.log('');
    console.log('📷 Photo 2 - 45-Degree Banner:');
    console.log(`   ${BASE_URL}/en/admin/design-center/${promptId2}/edit`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
