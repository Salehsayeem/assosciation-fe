## Project Structure (Enterprise Angular)

- `src/app/core/`
	- `interceptors/` (`auth.interceptor.ts`, `error.interceptor.ts`, `refresh-token.interceptor.ts`)
	- `services/` (`api-client.service.ts`, `auth.service.ts`, `jwt.service.ts`, `cookie.service.ts`)
	- `guards/` (`auth.guard.ts`, `role.guard.ts`)
	- `tokens/` (`api-base-url.token.ts`)
	- `models/` (`auth.ts`)
- `src/app/shared/`
	- `material/` (`material.module.ts`)
- `src/app/layout/`
	- `shell.component.*` (toolbar + router outlet)
- `src/app/features/`
	- `auth/` (login/register/change-password + `auth.routes.ts`)
	- `members/` (`members.page.ts`, `members.routes.ts`)
	- `deposits/` (`deposits.page.ts`, `deposits.routes.ts`)
- `src/environments/environment.ts` (`apiBaseUrl`)

## Routing

- Top-level routes:
	- `''` → `ShellComponent` with child routes `members`, `deposits` (protected by `AuthGuard`/`RoleGuard` in feature routes).
	- `auth` → lazy routes for `login`, `register`, `change-password`.

## Auth Flow

1. `AuthApiService.login` posts to `auth/login` and receives generic response.
2. `AuthService.handleLogin` stores `accessToken` and `refreshToken` in secure `SameSite=Lax` cookies.
3. `auth.interceptor` attaches `Authorization: Bearer <accessToken>`.
4. `refresh-token.interceptor` silently refreshes on 401 using `auth/refresh-token` and retries original request.
5. `JwtService.decode` parses claims from `accessToken` for permissions.

## Environment

Edit `src/environments/environment.ts`:

```ts
export const environment = {
	production: false,
	apiBaseUrl: 'https://api.example.com' // change as needed
};
```

## Best Practices

- Use standalone components with lazy-loaded feature routes.
- Keep global singletons in `core` provided in `root`.
- Sanitize all outgoing payloads (`ApiClientService.sanitize`).
- Prefer refresh via cookie and short-lived access tokens; avoid localStorage for tokens.
- Centralize Material imports in `shared/material`.

## Adding a New Feature

1. Create `src/app/features/<feature>/<feature>.routes.ts` and a page/component.
2. Add lazy route under `ShellComponent` children.
3. Use `AuthGuard`/`RoleGuard` with `data: { feature: 'FEATURE NAME', permission: 'READ' }`.

## Commands

```powershell
npm i @angular/material @angular/cdk @angular/animations
```

## Testing

- Unit test guards, services, and components with reactive forms.
- Verify silent refresh by expiring tokens in dev.
# AssosciationFe

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
