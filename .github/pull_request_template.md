## Description

<!-- What does this change and why? -->

## Checklist

- [ ] Tests pass locally (`npm test`)
- [ ] Lint and formatting are clean (`npm run lint && npm run format:check`)
- [ ] Client builds (`npm run build`)
- [ ] Forecast service passes lint and tests (`ruff check . && ruff format --check . && pytest` in `forecast-service/`)
- [ ] No secrets, credentials, or `.env` files committed
- [ ] Documentation updated if behavior changed
