import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminUserService } from 'src/app/core/services/admin-user.service';
import { UserResponse, Role } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, ReactiveFormsModule],
  templateUrl: './user-list.component.html'
})
export class UserListComponent {
  private userService = inject(AdminUserService);

  users = signal<UserResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  updatingId = signal<number | null>(null);
  deletingId = signal<number | null>(null);

  // Search and filters
  searchControl = new FormControl('', { nonNullable: true });
  searchTerm = signal('');
  // Use string for role filter to avoid enum/template issues
  roleFilter = signal<string>('ALL');
  statusFilter = signal<'ALL' | 'ENABLED' | 'DISABLED'>('ALL');

  filteredUsers = computed(() => {
    let result = this.users();
    const term = this.searchTerm().toLowerCase().trim();
    const role = this.roleFilter();
    const status = this.statusFilter();

    if (term) {
      result = result.filter(u =>
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    }
    if (role !== 'ALL') {
      result = result.filter(u => u.role === role); // string comparison works because enum values are strings
    }
    if (status === 'ENABLED') {
      result = result.filter(u => u.enabled);
    } else if (status === 'DISABLED') {
      result = result.filter(u => !u.enabled);
    }
    return result;
  });

  constructor() {
    this.load();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(value => this.searchTerm.set(value));
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les utilisateurs.');
        this.loading.set(false);
      }
    });
  }

  setRoleFilter(role: string): void {
    this.roleFilter.set(role);
  }

  setStatusFilter(status: 'ALL' | 'ENABLED' | 'DISABLED'): void {
    this.statusFilter.set(status);
  }

  toggleEnabled(user: UserResponse): void {
    if (this.updatingId()) return;
    this.updatingId.set(user.id);
    const newEnabled = !user.enabled;
    this.userService.update(user.id, { enabled: newEnabled }).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        this.updatingId.set(null);
      },
      error: (err) => {
        this.updatingId.set(null);
        alert(err?.error?.message ?? 'Échec de la mise à jour.');
      }
    });
  }

  changeRole(user: UserResponse, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newRole = select.value as Role;
    if (newRole === user.role) return;
    if (this.updatingId()) return;
    this.updatingId.set(user.id);
    this.userService.update(user.id, { role: newRole }).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        this.updatingId.set(null);
      },
      error: (err) => {
        this.updatingId.set(null);
        alert(err?.error?.message ?? 'Échec du changement de rôle.');
      }
    });
  }

  deleteUser(user: UserResponse): void {
    if (!confirm(`Supprimer l'utilisateur "${user.firstName} ${user.lastName}" ?`)) return;
    this.deletingId.set(user.id);
    this.userService.delete(user.id).subscribe({
      next: () => {
        this.users.update(list => list.filter(u => u.id !== user.id));
        this.deletingId.set(null);
      },
      error: (err) => {
        this.deletingId.set(null);
        alert(err?.error?.message ?? 'Suppression impossible.');
      }
    });
  }

  roleBadgeClass(role: Role): string {
    return role === 'ADMIN' ? 'bg-danger' : 'bg-info';
  }

  statusBadgeClass(enabled: boolean): string {
    return enabled ? 'bg-success' : 'bg-secondary';
  }
}
