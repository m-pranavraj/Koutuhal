"""add_ai_job_metadata

Revision ID: 013_add_ai_job_metadata
Revises: 012_add_super_admin
Create Date: 2026-02-12 04:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '013_add_ai_job_metadata'
down_revision = '012_add_super_admin'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('ai_jobs', sa.Column('started_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('ai_jobs', sa.Column('finished_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('ai_jobs', sa.Column('token_usage', sa.Integer(), nullable=True))
    op.add_column('ai_jobs', sa.Column('provider', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('ai_jobs', 'provider')
    op.drop_column('ai_jobs', 'token_usage')
    op.drop_column('ai_jobs', 'finished_at')
    op.drop_column('ai_jobs', 'started_at')
