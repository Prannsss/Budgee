const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'budgee_dev',
  user: 'postgres',
  password: 'Feb112005!'
});

async function addCashAccountsForExistingUsers() {
  try {
    await client.connect();
    console.log('\n========== MIGRATION: Adding Cash Accounts ==========\n');
    
    // Find all verified users without a Cash account
    const usersWithoutCash = await client.query(`
      SELECT u.id, u.email, u.name
      FROM users u
      WHERE u.email_verified = true
      AND NOT EXISTS (
        SELECT 1 FROM accounts a 
        WHERE a.user_id = u.id 
        AND a.name = 'Cash'
        AND a.is_active = true
      )
    `);
    
    console.log(`Found ${usersWithoutCash.rows.length} verified user(s) without Cash account\n`);
    
    if (usersWithoutCash.rows.length === 0) {
      console.log('✓ All verified users already have Cash accounts!');
      return;
    }
    
    // Create Cash account for each user
    for (const user of usersWithoutCash.rows) {
      console.log(`Creating Cash account for: ${user.email} (ID: ${user.id})`);
      
      await client.query(`
        INSERT INTO accounts (user_id, name, type, balance, verified, is_active, created_at, updated_at)
        VALUES ($1, 'Cash', 'Cash', 0.00, false, true, NOW(), NOW())
      `, [user.id]);
      
      console.log(`✓ Cash account created for ${user.email}`);
    }
    
    console.log(`\n✓ Migration complete! Created ${usersWithoutCash.rows.length} Cash account(s)`);
    
    // Verify results
    const allAccounts = await client.query('SELECT user_id, name, type, balance FROM accounts ORDER BY user_id');
    console.log('\n========== ALL ACCOUNTS AFTER MIGRATION ==========');
    allAccounts.rows.forEach(acc => {
      console.log(`User ${acc.user_id}: ${acc.name} (${acc.type}) - Balance: ${acc.balance}`);
    });
    
  } catch (error) {
    console.error('Migration error:', error.message);
  } finally {
    await client.end();
  }
}

addCashAccountsForExistingUsers();
