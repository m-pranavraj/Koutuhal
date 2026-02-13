#!/usr/bin/env python3
"""
Test database connection for Koutuhal Pathways backend.
This script tests the PostgreSQL/Supabase connection.
"""
import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

async def test_connection():
    """Test the database connection"""
    try:
        # Try to import settings
        from app.core.config import settings

        print("=" * 70)
        print("KOUTUHAL PATHWAYS - Database Connection Test")
        print("=" * 70)
        print(f"\n📊 Configuration:")
        print(f"   Host: {settings.POSTGRES_SERVER}")
        print(f"   Port: {settings.POSTGRES_PORT}")
        print(f"   Database: {settings.POSTGRES_DB}")
        print(f"   User: {settings.POSTGRES_USER}")
        print(f"   Password: {'*' * len(settings.POSTGRES_PASSWORD)}")

        # Create connection
        print(f"\n🔌 Connecting...")
        engine = create_async_engine(
            settings.SQLALCHEMY_DATABASE_URI,
            echo=False,
            pool_pre_ping=True
        )

        async with engine.begin() as conn:
            # Test basic connection
            result = await conn.execute(text("SELECT 1"))
            result.fetchone()
            print("✅ Basic connection: SUCCESS")

            # Get version
            result = await conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ PostgreSQL version: {version.split(',')[0]}")

            # Check if tables exist
            result = await conn.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = [row[0] for row in result.fetchall()]

            if tables:
                print(f"\n✅ Found {len(tables)} tables:")
                for table in tables:
                    print(f"   • {table}")
            else:
                print("\n⚠️  No tables found. Please run the database schema:")
                print("   supabase_schema.sql")

            # Check users table specifically
            if 'users' in tables:
                result = await conn.execute(text("SELECT COUNT(*) FROM users"))
                user_count = result.fetchone()[0]
                print(f"\n👤 Users in database: {user_count}")

        await engine.dispose()

        print("\n" + "=" * 70)
        print("✅ Database connection test: PASSED")
        print("=" * 70)
        return True

    except ImportError as e:
        print(f"\n❌ Import error: {e}")
        print("   Make sure you're in the backend directory")
        return False
    except Exception as e:
        print(f"\n❌ Connection failed: {e}")
        print("\n💡 Troubleshooting tips:")
        print("   1. Check your backend/.env file")
        print("   2. Verify Supabase credentials")
        print("   3. Ensure database schema is applied")
        print("   4. Check if your IP is allowed in Supabase")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_connection())
    sys.exit(0 if success else 1)
