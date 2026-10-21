# Production deployment and rollback

Build immutable images from the committed lockfiles and deploy `docker-compose.prod.yml` where generated. Validate required environment variables before starting; secrets belong in the deployment platform, never images or client bundles. Run readiness checks before routing traffic and allow the documented graceful-shutdown window during replacement.

## Database preflight

Back up PostgreSQL with encryption before migrations, check available connections and migration compatibility, then run migrations as a single release task. Application instances use a bounded connection pool; size the total across replicas below the database limit.

## Rollback

Retain the previous release and a compatible database restore point. Stop routing to the failed release, restore the prior release, and restore data only when the migration is not backward compatible. Test restores automatically on a separate database and document retention and recovery ownership.
