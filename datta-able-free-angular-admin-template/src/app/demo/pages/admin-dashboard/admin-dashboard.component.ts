import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { AdminStatsService, StatsResponse } from 'src/app/core/services/admin-stats.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, NgApexchartsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  private statsService = inject(AdminStatsService);

  stats = signal<StatsResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Chart options
  categoryChartOptions: Partial<ApexOptions> = {};
  statusChartOptions: Partial<ApexOptions> = {};

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading.set(true);
    this.statsService.getStats()
      .pipe(
        catchError(err => {
          this.error.set('Impossible de charger les statistiques.');
          return of(null);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe(data => {
        if (data) {
          this.stats.set(data);
          this.prepareCharts(data);
        }
      });
  }

  prepareCharts(data: StatsResponse): void {
    // 1. Formations by Category (Pie Chart)
    const categoryLabels = Object.keys(data.formationsByCategory);
    const categoryValues = Object.values(data.formationsByCategory);
    this.categoryChartOptions = {
      series: categoryValues,
      labels: categoryLabels,
      chart: {
        type: 'pie',
        height: 350
      },
      colors: ['#0d6efd', '#6610f2', '#6f42c1', '#d63384', '#dc3545', '#fd7e14', '#ffc107', '#198754', '#0dcaf0', '#6c757d'],
      legend: {
        position: 'bottom',
        fontSize: '14px'
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => Math.round(val) + '%'
      },
      plotOptions: {
        pie: {
          donut: {
            size: '50%'
          }
        }
      }
    };

    // 2. Consulting Requests by Status (Bar Chart)
    const statusLabels = Object.keys(data.requestsByStatus);
    const statusValues = Object.values(data.requestsByStatus);
    const statusColors = {
      'PENDING': '#ffc107',
      'ACCEPTED': '#0dcaf0',
      'REJECTED': '#dc3545',
      'COMPLETED': '#198754'
    };
    const colors = statusLabels.map(label => statusColors[label as keyof typeof statusColors] || '#6c757d');

    this.statusChartOptions = {
      series: [{
        name: 'Demandes',
        data: statusValues
      }],
      chart: {
        type: 'bar',
        height: 350
      },
      colors: colors,
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 4
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: statusLabels,
        labels: {
          style: {
            fontSize: '14px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Nombre de demandes'
        }
      },
      legend: {
        show: false
      },
      tooltip: {
        y: {
          formatter: (val: number) => val + ' demandes'
        }
      }
    };
  }

  getCardIcon(metric: string): string {
    const icons: { [key: string]: string } = {
      totalUsers: 'feather icon-users',
      totalFormations: 'feather icon-book',
      totalCourses: 'feather icon-file-text',
      totalCategories: 'feather icon-tag',
      totalConsultingOffers: 'feather icon-briefcase',
      totalConsultingRequests: 'feather icon-message-square'
    };
    return icons[metric] || 'feather icon-bar-chart-2';
  }

  getCardColor(metric: string): string {
    const colors: { [key: string]: string } = {
      totalUsers: 'bg-c-blue',
      totalFormations: 'bg-c-green',
      totalCourses: 'bg-c-yellow',
      totalCategories: 'bg-c-purple',
      totalConsultingOffers: 'bg-c-pink',
      totalConsultingRequests: 'bg-c-orange'
    };
    return colors[metric] || 'bg-c-blue';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-warning';
      case 'ACCEPTED': return 'bg-info';
      case 'REJECTED': return 'bg-danger';
      case 'COMPLETED': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  getRoleBadgeClass(role: string): string {
    return role === 'ADMIN' ? 'bg-danger' : 'bg-info';
  }
}
