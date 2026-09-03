import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminAuthService } from 'src/app/core/services/admin-auth.service';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent {
  private authService = inject(AdminAuthService);
  private router = inject(Router);

  constructor() {
    const config = inject(NgbDropdownConfig);
    config.placement = 'bottom-right';
  }

  logout(): void {
    this.authService.logout('http://localhost:4200');
  }

  goToFrontOffice(): void {
    const token = this.authService.getToken();
    // Redirect to front-office with token as query param
    window.location.href = `http://localhost:4200?token=${encodeURIComponent(token || '')}`;
  }
}
