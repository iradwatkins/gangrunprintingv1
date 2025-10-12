/**
 * Create a test session for admin user
 * This creates a valid Lucia Auth session in the database
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function createTestSession() {
  try {
    const userId = 'cmg46s7ff0000vuu43qg57vlr'; // Admin user ID

    // Generate a random session ID (Lucia format)
    const sessionId = crypto.randomBytes(20).toString('hex');

    // Create session that expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    console.log('Creating test session...');
    console.log('User ID:', userId);
    console.log('Session ID:', sessionId);
    console.log('Expires At:', expiresAt);

    const session = await prisma.session.create({
      data: {
        id: sessionId,
        userId: userId,
        expiresAt: expiresAt,
      },
    });

    console.log('\n✅ Session created successfully!');
    console.log('\n📋 Session Details:');
    console.log(JSON.stringify(session, null, 2));
    console.log('\n🍪 Use this session ID as cookie value:');
    console.log(`auth_session=${sessionId}`);

    return sessionId;
  } catch (error) {
    console.error('❌ Error creating session:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestSession()
  .then(sessionId => {
    console.log('\n✅ Done! Session ID:', sessionId);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
