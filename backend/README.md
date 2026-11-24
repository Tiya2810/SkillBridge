# Backend implementation workspace

The browser prototype does not call an API yet. This directory is reserved for the production Node.js/Express service described in [the architecture](../docs/ARCHITECTURE.md) and [API contract](../docs/API.md).

## Recommended first implementation

1. Initialize a TypeScript Express service with environment validation and a health endpoint.
2. Connect MongoDB using Mongoose and apply versioned migrations based on `../database/schema.mongodb.js`.
3. Implement secure session authentication and role/ownership authorization before exposing profile endpoints.
4. Add request schemas, centralized error handling, structured redacted logs, and integration tests.
5. Implement a vertical slice: catalog → enrollment → lesson progress, then portfolio and recruiting.

Do not expose a production API until authentication, consent checks, object ownership, rate limits, and automated tests are implemented. Keep credentials in an environment/secret manager; never commit them.
