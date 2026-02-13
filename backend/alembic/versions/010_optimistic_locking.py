"""optimistic_locking_and_constraints

Revision ID: 010_optimistic_locking
Revises: 009_add_content_hash
Create Date: 2026-02-12 02:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '010_optimistic_locking'
down_revision = '009_add_content_hash'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add version column for optimistic locking
    op.add_column('applications', sa.Column('version', sa.Integer(), server_default='1', nullable=False))
    op.add_column('uploaded_files', sa.Column('version', sa.Integer(), server_default='1', nullable=False))
    op.add_column('ai_jobs', sa.Column('version', sa.Integer(), server_default='1', nullable=False))
    op.add_column('orders', sa.Column('version', sa.Integer(), server_default='1', nullable=False))
    
    # Add unique constraint for file deduplication (per user)
    # Note: verify if index created in 009 conflicts or is redundant. 
    # 009 created index 'ix_uploaded_files_content_hash' (non-unique).
    # We want unique on (user_id, content_hash).
    op.create_unique_constraint('uq_user_content_hash', 'uploaded_files', ['user_id', 'content_hash'])


def downgrade() -> None:
    op.drop_constraint('uq_user_content_hash', 'uploaded_files', type_='unique')
    op.drop_column('orders', 'version')
    op.drop_column('ai_jobs', 'version')
    op.drop_column('uploaded_files', 'version')
    op.drop_column('applications', 'version')
