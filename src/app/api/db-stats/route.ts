import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getDatabaseStats, testConnection } from '@/lib/database/postgres';

export async function GET(request: NextRequest) {
  try {
    // Test if the connection is working
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed'
      }, { status: 500 });
    }

    // Get comprehensive database statistics
    const stats = await getDatabaseStats();
    
    // Get additional query examples
    const additionalStats = await Promise.all([
      // Get customers by showroom
      executeQuery(`
        SELECT 
          s.name as showroom_name,
          COUNT(c.id) as customer_count,
          SUM(CASE WHEN c.purchase_amount > 0 THEN 1 ELSE 0 END) as converted_customers,
          SUM(c.purchase_amount) as total_revenue
        FROM showrooms s
        LEFT JOIN customers c ON s.id = c.assigned_showroom_id AND c.deleted_at IS NULL
        GROUP BY s.id, s.name
        ORDER BY customer_count DESC
      `),
      
      // Get recent activity
      executeQuery(`
        SELECT 
          'customer' as type,
          full_name as name,
          created_at as timestamp
        FROM customers 
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC 
        LIMIT 5
      `),
      
      // Get user roles distribution
      executeQuery(`
        SELECT 
          role,
          COUNT(*) as count
        FROM profiles 
        WHERE role IS NOT NULL
        GROUP BY role
        ORDER BY count DESC
      `)
    ]);

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        connection: 'PostgreSQL via direct connection',
        status: 'Connected ✅'
      },
      statistics: stats,
      breakdown: {
        customersByShowroom: additionalStats[0].rows,
        recentActivity: additionalStats[1].rows,
        userRoles: additionalStats[2].rows
      },
      metadata: {
        connectionType: 'Direct PostgreSQL Pool',
        softDeleteEnabled: true,
        totalTables: await executeQuery(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `).then(result => result.rows[0].count)
      }
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Database stats API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, params } = body;

    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Query is required'
      }, { status: 400 });
    }

    // Execute custom query (be careful with this in production!)
    const result = await executeQuery(query, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      rowCount: result.rowCount,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Custom query API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Query execution failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 