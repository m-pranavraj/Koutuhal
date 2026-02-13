"""add_content_hash_to_files

Revision ID: 009_add_content_hash
Revises: 008_add_ai_jobs
Create Date: 2026-02-12 02:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '009_add_content_hash'
down_revision = '008_add_ai_jobs'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('uploaded_files', sa.Column('content_hash', sa.String(), nullable=True))
    op.create_index(op.f('ix_uploaded_files_content_hash'), 'uploaded_files', ['content_hash'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_uploaded_files_content_hash'), table_name='uploaded_files')
    op.drop_column('uploaded_files', 'content_hash')
