# PostgreSQL Direct Connection Guide

This guide explains how to set up and use direct PostgreSQL connections in your Sarkar Jewellers CRM application.

## 🔗 Connection Configuration

### 1. Environment Variables

Add these variables to your `.env.local` file:

```bash
# Direct PostgreSQL Connection
DATABASE_URL=postgresql://postgres:Skm@05122707@db.dandxdezcgogqovheuso.supabase.co:5432/postgres

# Database Connection Pool Settings
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=10000

# Application Settings
NODE_ENV=development
```

### 2. Connection String Format

```
postgresql://username:password@host:port/database
```

**Your Connection Details:**
- **Host**: `db.dandxdezcgogqovheuso.supabase.co`
- **Port**: `5432`
- **Username**: `postgres`
- **Password**: `Skm@05122707`
- **Database**: `postgres`

## 🏊 Connection Pool Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| `DB_POOL_MIN` | `2` | Minimum connections in pool |
| `DB_POOL_MAX` | `10` | Maximum connections in pool |
| `DB_POOL_IDLE_TIMEOUT` | `30000` | Close idle connections after 30s |
| `DB_POOL_CONNECTION_TIMEOUT` | `10000` | Connection timeout (10s) |

## 📚 Usage Examples

### Basic Query Execution

```typescript
import { executeQuery } from '@/lib/database/postgres';

// Simple query
const result = await executeQuery('SELECT * FROM customers WHERE deleted_at IS NULL');
console.log(result.rows);

// Parameterized query
const customer = await executeQuery(
  'SELECT * FROM customers WHERE id = $1 AND deleted_at IS NULL',
  ['customer-uuid']
);
```

### Transaction Management

```typescript
import { executeTransaction } from '@/lib/database/postgres';

const results = await executeTransaction([
  {
    text: 'INSERT INTO customers (full_name, email) VALUES ($1, $2)',
    params: ['John Doe', 'john@example.com']
  },
  {
    text: 'UPDATE profiles SET last_login = NOW() WHERE id = $1',
    params: ['user-uuid']
  }
]);
```

### Advanced Client Management

```typescript
import { getClient } from '@/lib/database/postgres';

const client = await getClient();
try {
  await client.query('BEGIN');
  
  const result1 = await client.query('SELECT * FROM customers');
  const result2 = await client.query('SELECT * FROM showrooms');
  
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release(); // Important: Always release the client
}
```

### Database Statistics

```typescript
import { getDatabaseStats } from '@/lib/database/postgres';

const stats = await getDatabaseStats();
console.log('Total Customers:', stats.totalCustomers);
console.log('Database Size:', stats.databaseSize);
```

## 🧪 Testing Connection

Run the connection test:

```bash
node test-db-connection.js
```

**Expected Output:**
```
🔗 Testing PostgreSQL connection to Supabase...
✅ Successfully connected to PostgreSQL database!
📊 Total Customers: X
📊 Database Size: X MB
🎉 All database tests passed successfully!
```

## 🌐 API Endpoints

### Get Database Statistics

```bash
GET /api/db-stats
```

**Response:**
```json
{
  "success": true,
  "statistics": {
    "totalCustomers": 1,
    "deletedCustomers": 0,
    "totalProfiles": 40,
    "totalShowrooms": 2,
    "databaseSize": "11 MB"
  },
  "breakdown": {
    "customersByShowroom": [...],
    "recentActivity": [...],
    "userRoles": [...]
  }
}
```

### Execute Custom Query

```bash
POST /api/db-stats
Content-Type: application/json

{
  "query": "SELECT COUNT(*) as total FROM customers WHERE deleted_at IS NULL",
  "params": []
}
```

## 🚀 Performance Benefits

### Direct PostgreSQL vs Supabase Client

| Feature | Direct PostgreSQL | Supabase Client |
|---------|------------------|-----------------|
| **Performance** | ⚡ Faster raw queries | 🐌 Additional API layer |
| **Connection Pooling** | ✅ Built-in pooling | ❌ Per-request connections |
| **Complex Queries** | ✅ Full SQL support | ⚠️ Limited query builder |
| **Transactions** | ✅ Native support | ⚠️ Limited transaction support |
| **Batch Operations** | ✅ Efficient batching | ❌ Multiple API calls |

## 🔒 Security Considerations

### Production Recommendations

1. **Environment Variables**: Never commit database credentials
2. **Connection Limits**: Monitor and adjust pool sizes
3. **Query Validation**: Sanitize user inputs
4. **Error Handling**: Don't expose database errors to users
5. **Logging**: Log queries for debugging (not credentials)

### Example Security Implementation

```typescript
export async function secureQuery(query: string, params: any[], userId: string) {
  // Validate user permissions
  const hasPermission = await checkUserPermissions(userId, 'database.read');
  if (!hasPermission) {
    throw new Error('Access denied');
  }
  
  // Sanitize query (basic example)
  if (query.toLowerCase().includes('drop') || query.toLowerCase().includes('delete')) {
    throw new Error('Destructive queries not allowed');
  }
  
  return await executeQuery(query, params);
}
```

## 🛠️ Troubleshooting

### Common Issues

**1. Connection Timeout**
```
Error: timeout expired
```
**Solution**: Increase `DB_POOL_CONNECTION_TIMEOUT` or check network connectivity.

**2. Too Many Connections**
```
Error: sorry, too many clients already
```
**Solution**: Reduce `DB_POOL_MAX` or implement connection retry logic.

**3. SSL Certificate Issues**
```
Error: self signed certificate
```
**Solution**: Use `ssl: { rejectUnauthorized: false }` for development.

**4. Authentication Failed**
```
Error: password authentication failed
```
**Solution**: Verify username/password and IP whitelist in Supabase dashboard.

### Debug Commands

```bash
# Test basic connectivity
telnet db.dandxdezcgogqovheuso.supabase.co 5432

# Check pool status
curl http://localhost:3000/api/db-stats | jq .

# Monitor connection logs
tail -f your-app.log | grep "Database"
```

## 📊 Performance Monitoring

### Key Metrics to Track

1. **Connection Pool Usage**
   - Total connections
   - Idle connections
   - Waiting requests

2. **Query Performance**
   - Average query time
   - Slow query count
   - Error rate

3. **Database Health**
   - Active connections
   - Database size growth
   - Table sizes

### Example Monitoring Code

```typescript
export async function getConnectionPoolStats() {
  const pool = getPool();
  return {
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingRequests: pool.waitingCount,
    timestamp: new Date().toISOString()
  };
}
```

## 🎯 Best Practices

1. **Always use connection pooling** - Never create direct connections
2. **Release clients** - Always call `client.release()` in finally blocks
3. **Use transactions** - For related operations that must succeed together
4. **Parameterize queries** - Prevent SQL injection attacks
5. **Handle errors gracefully** - Don't expose database internals
6. **Monitor performance** - Track query times and connection usage
7. **Cache results** - For frequently accessed, rarely changing data

## 🔄 Integration with Existing Supabase

You can use both Supabase client and direct PostgreSQL connections:

```typescript
// Use Supabase for auth and real-time features
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';

// Use direct PostgreSQL for complex queries and better performance
import { executeQuery } from '@/lib/database/postgres';

export async function hybridDataFetch() {
  const supabase = createServerActionClient({ cookies });
  
  // Auth via Supabase
  const { data: { user } } = await supabase.auth.getUser();
  
  // Complex query via direct PostgreSQL
  const customerStats = await executeQuery(`
    SELECT 
      s.name,
      COUNT(c.id) as customers,
      SUM(c.purchase_amount) as revenue
    FROM showrooms s
    LEFT JOIN customers c ON s.id = c.assigned_showroom_id
    WHERE c.deleted_at IS NULL
    GROUP BY s.id, s.name
  `);
  
  return { user, customerStats: customerStats.rows };
}
```

---

## 🎉 You're All Set!

Your PostgreSQL direct connection is now configured and ready to use. This setup provides:

- ⚡ **Better Performance** - Direct database access
- 🏊 **Connection Pooling** - Efficient resource management  
- 🔒 **Security** - Proper authentication and SSL
- 📊 **Monitoring** - Built-in statistics and health checks
- 🛠️ **Flexibility** - Full SQL capabilities

Test the connection with: `node test-db-connection.js`

Access API stats at: `http://localhost:3000/api/db-stats` 