# AGENTS.md

Guidance for AI coding agents working on Just RSS, an on-device RSS reader built with Angular 18, Ionic 8 (standalone components) and Capacitor 8 (Android/iOS).

## Commands

```bash
npm install          # also applies patches/ via patch-package (postinstall)
npm start            # ng serve
npm run lint         # eslint ./src/
npm run test:ci      # Karma/Jasmine, single run, headless Chrome
npm run build        # production build into www/
```

Before finishing any change, `npm run lint`, `npm run test:ci` and `npm run build` must all pass. The build must produce **no warnings**. CI runs all three (`.github/workflows/node.js.yml`).

## Project layout

- `src/app/services/` – app logic. `StorageService` wraps Ionic Storage (SQLite driver, IndexedDB/localStorage fallback); `SourcesService`, `SettingsService`, `BookmarkService`, `FeedService` and `DiscoverService` persist state through it. Services load their data when `StorageService.onReady` emits.
- `src/app/<page>/` – feature pages/components (`feed`, `sources`, `discover`, `saved`, `settings`, `source-edit`, `preview`, `tabs`) and `shared/` components.
- `src/app/lib/` – pure helpers (`date-utils`, `macros`, `types`).
- `src/testing/` – shared test helpers (`FakeStorage`, `provideTestingStorage`).
- `patches/` – `patch-package` patches for `node_modules`. Regenerate with `npx patch-package <pkg>` if the dependency version changes.
- `android/`, `ios/` – native Capacitor projects; avoid editing unless the task is native.

## Conventions

- All components are **standalone**. Import Ionic pieces from `@ionic/angular/standalone` only (never `@ionic/angular` or `IonicModule`), and register icons with `addIcons`.
- Templates must import everything they use (e.g. `NgIf` for `*ngIf`) or use `@if`/`@for`; missing imports cause NG8103 build warnings.
- ESLint: 2-space indent, single quotes, semicolons, unix line endings. Selectors are prefixed `app-`; component classes end in `Page` or `Component`.
- RSSParser is a global script (`declare const RSSParser`), so feed objects are loosely typed; keep `eslint-disable` comments narrow.
- Log with a `[ServiceName]` prefix, matching existing code.

## Testing

- Every new service or component gets a `*.spec.ts` beside it.
- Test standalone components with `imports: [Component]`, not `declarations`.
- Anything injecting `StorageService` needs `providers: provideTestingStorage()` (in-memory `Storage` fake plus `provideIonicAngular()`); `await flushPromises()` after injecting so storage initialises.
- Mock the network with `spyOn(window, 'fetch')`; tests must not hit it.
