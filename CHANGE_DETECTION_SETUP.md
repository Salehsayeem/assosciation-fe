## Global Change Detection Setup

### Overview
The `ChangeDetectorRef` and `NgZone` pattern has been extracted into a global, reusable system across the application. This ensures consistent change detection handling for all async operations (API calls, timers, etc.).

### Architecture

#### 1. **ChangeDetectionService** (`src/app/core/services/change-detection.service.ts`)
Core service providing change detection utilities:
- `withChangeDetection<T>()` – RxJS operator for auto-marking change detection
- `runInZone<T>(fn)` – Wraps function execution with zone management
- `markForCheck()` – Manual change detection trigger
- `getZone()` – Access to NgZone for advanced usage

#### 2. **BaseComponent** (`src/app/core/components/base.component.ts`)
Base class for all components needing change detection helpers. Provides protected methods:
- `runWithChangeDetection()` – Operator wrapper for observables
- `runInZone<T>(fn)` – Zone-wrapped function execution
- `markForCheck()` – Manual mark for check

---

### Usage Patterns

#### Pattern 1: Using RxJS Operator (Recommended for API calls)
```typescript
import { BaseComponent } from '../../core/components/base.component';

export class MyComponent extends BaseComponent implements OnInit {
  ngOnInit() {
    this.api.getData()
      .pipe(this.runWithChangeDetection())
      .subscribe(data => {
        this.data = data;
      });
  }
}
```

#### Pattern 2: Using runInZone in Subscription Handlers
```typescript
export class MyComponent extends BaseComponent {
  loadData() {
    this.api.getData()
      .pipe(this.runWithChangeDetection())
      .subscribe({
        next: (data) => {
          this.runInZone(() => {
            this.data = data;
            this.isLoading = false;
          });
        },
        error: (err) => {
          this.runInZone(() => {
            this.error = 'Failed to load';
          });
        }
      });
  }
}
```

#### Pattern 3: Using ChangeDetectionService Directly
```typescript
import { ChangeDetectionService } from '../../core/services/change-detection.service';

export class MyService {
  constructor(private cdService: ChangeDetectionService) {}

  processData() {
    this.cdService.runInZone(() => {
      // Your code here
    });
  }
}
```

---

### Migration Guide

**Old Pattern (ProfileComponent – before):**
```typescript
export class ProfilePageComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  fetchUserProfile() {
    this.api.getUserProfile(id, appId).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.user = response.data;
          this.cdr.markForCheck();
        });
      }
    });
  }
}
```

**New Pattern (ProfileComponent – after):**
```typescript
export class ProfilePageComponent extends BaseComponent implements OnInit {
  fetchUserProfile() {
    this.api.getUserProfile(id, appId)
      .pipe(this.runWithChangeDetection())
      .subscribe({
        next: (response: any) => {
          this.runInZone(() => {
            this.user = response.data;
          });
        }
      });
  }
}
```

---

### Applying to Other Components

#### Users Page Example
```typescript
import { BaseComponent } from '../../core/components/base.component';

export class UsersPageComponent extends BaseComponent implements OnInit, AfterViewInit {
  // ... existing code ...

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading = true;
    this.api.getAllUsers()
      .pipe(this.runWithChangeDetection())
      .subscribe({
        next: (res: GetAllUsersResponse) => {
          this.runInZone(() => {
            if (res.isSuccess) {
              this.dataSource.data = res.data;
              this.error = null;
            } else {
              this.error = res.message;
            }
            this.isLoading = false;
          });
        },
        error: () => {
          this.runInZone(() => {
            this.error = 'Failed to load users';
            this.isLoading = false;
          });
        }
      });
  }
}
```

#### Roles Page Example
```typescript
export class RolesPageComponent extends BaseComponent implements AfterViewInit {
  ngOnInit(): void {
    this.loadRoles();
  }

  private loadRoles(): void {
    this.api.getAllRoles()
      .pipe(this.runWithChangeDetection())
      .subscribe(data => {
        this.runInZone(() => {
          this.dataSource.data = data;
        });
      });
  }
}
```

---

### Benefits

1. **DRY Principle** – No more repeating `NgZone.run()` and `markForCheck()` in every component
2. **Consistency** – All async operations follow the same pattern
3. **Flexibility** – Use as RxJS operator or service method
4. **Reusability** – Works in components, services, guards, interceptors
5. **Type Safety** – Full TypeScript support
6. **Maintainability** – Single place to update change detection logic

---

### Next Steps

1. Update **Users, Roles, Permissions** pages to extend `BaseComponent`
2. Update **Deposits** page
3. Consider applying to auth components (login, register, etc.)
4. Optional: Create a decorator for automatic change detection on specific methods
