"""add_super_admin_role

Revision ID: 012_add_super_admin
Revises: 011_add_audit_logs
Create Date: 2026-02-12 03:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '012_add_super_admin'
down_revision = '011_add_audit_logs'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Postgres specific command to add value to Enum
    # We need to run it inside a transaction commit block because ALTER TYPE cannot run inside a transaction block 
    # BUT alembic runs migration in transaction.
    # Actually, ALTER TYPE ADD VALUE IS transaction safe in recent Postgres, but let's be careful.
    # "ALTER TYPE ... ADD VALUE cannot run inside a transaction block" -> False for newer PG, but usually true.
    # Alembic 'op.execute' runs within the transaction.
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'SUPER_ADMIN'")


def downgrade() -> None:
    # Removing value from Enum is hard in Postgres, usually requires recreating the type.
    # For now, we skip downgrade or accept it remains.
    pass
