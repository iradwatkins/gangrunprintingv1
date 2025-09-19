const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function createAuthSession() {
  try {
    console.log('🔧 Creating authenticated session for iradwatkins@gmail.com...');

    // Find the admin user (iradwatkins)
    const adminUser = await prisma.user.findUnique({
      where: { email: 'iradwatkins@gmail.com' }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found. Creating one...');

      // Create admin user
      const newAdmin = await prisma.user.create({
        data: {
          email: 'iradwatkins@gmail.com',
          name: 'Ira Watkins',
          role: 'ADMIN',
          emailVerified: true
        }
      });

      adminUser = newAdmin;
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user found:', adminUser.name);

      // Ensure user is admin
      if (adminUser.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: adminUser.id },
          data: { role: 'ADMIN' }
        });
        console.log('✅ User upgraded to admin role');
      }
    }

    // Create a new session
    const sessionId = crypto.randomBytes(20).toString('hex');
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Delete any existing sessions for this user
    await prisma.session.deleteMany({
      where: { userId: adminUser.id }
    });

    // Create new session
    const session = await prisma.session.create({
      data: {
        id: sessionId,
        userId: adminUser.id,
        expiresAt: sessionExpiresAt
      }
    });

    console.log('\n✅ Authentication session created successfully!');
    console.log('================================');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Name:', adminUser.name);
    console.log('🛡️  Role:', adminUser.role);
    console.log('🔑 Session ID:', session.id);
    console.log('🍪 Session Cookie:');
    console.log(`   lucia_session=${session.id}`);
    console.log('\n📝 Update test-product-creation.js with this session ID');
    console.log('================================\n');

    return { user: adminUser, session };
  } catch (error) {
    console.error('❌ Error creating session:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAuthSession().catch(console.error);