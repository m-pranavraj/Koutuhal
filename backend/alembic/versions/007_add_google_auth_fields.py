"""Add Google Auth fields and Organisation role

Revision ID: 007
Revises: 006
Create Date: 2024-01-07 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '007'
down_revision: Union[str, None] = '006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add 'ORGANISATION' to UserRole enum (Postgres specific)
    # We use a raw SQL execution because alembic op.alter_column doesn't natively support adding enum values easily in all versions
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'ORGANISATION'")

    # 2. Add new columns
    op.add_column('users', sa.Column('avatar_url', sa.String(), nullable=True))
    op.add_column('users', sa.Column('onboarding_completed', sa.Boolean(), server_default='false', nullable=False))

    # 3. Make password_hash nullable (for Google Auth users)
    op.alter_column('users', 'password_hash',
               existing_type=sa.VARCHAR(),
               nullable=True)


def downgrade() -> None:
    # Reverting password_hash to not null might fail if there are null values
    # We'll try, but practically this might be hard if google users exist.
    # For dev env downgrade:
    op.alter_column('users', 'password_hash',
               existing_type=sa.VARCHAR(),
               nullable=False)

    op.drop_column('users', 'onboarding_completed')
    op.drop_column('users', 'avatar_url')
    
    # Removing enum value is not supported in Postgres properly without dropping type
    # We will skip removing 'ORGANISATION' from the enum type to keep it safe.
