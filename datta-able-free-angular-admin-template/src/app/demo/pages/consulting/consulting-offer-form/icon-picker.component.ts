import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Curated set of Bootstrap Icons relevant to consulting offers.
 * Names are without the "bi-" prefix; the picker emits "bi-<name>".
 * Requires the Bootstrap Icons font CSS to be loaded in the app
 * (npm install bootstrap-icons, then add
 * "node_modules/bootstrap-icons/font/bootstrap-icons.css" to angular.json styles,
 * or load it via CDN link in index.html).
 */
const CONSULTING_ICONS: string[] = [
  'cloud', 'cloud-check', 'cloud-arrow-up', 'cloud-arrow-down', 'hdd-network',
  'diagram-3', 'gear', 'gear-fill', 'sliders', 'code-slash', 'code-square',
  'terminal', 'cpu', 'database', 'server', 'hdd-stack',
  'shield-check', 'shield-lock', 'shield-shaded', 'lock', 'key',
  'graph-up', 'graph-up-arrow', 'bar-chart', 'pie-chart', 'speedometer2',
  'briefcase', 'briefcase-fill', 'building', 'building-gear', 'bank',
  'people', 'person-workspace', 'person-badge', 'diagram-2',
  'lightbulb', 'lightbulb-fill', 'rocket', 'rocket-takeoff', 'puzzle',
  'kanban', 'clipboard-data', 'clipboard-check', 'journal-text', 'file-earmark-text',
  'globe', 'globe2', 'wifi', 'router', 'phone', 'laptop',
  'palette', 'brush', 'layers', 'boxes', 'box-seam', 'truck', 'cart',
  'credit-card', 'cash-coin', 'calculator', 'mortarboard', 'book',
  'compass', 'geo-alt', 'chat-dots', 'headset', 'envelope', 'telephone',
  'camera-video', 'mic', 'tools', 'wrench-adjustable', 'gem', 'star',
  'award', 'trophy', 'flag', 'bullseye', 'activity', 'heart-pulse',
  'eye', 'search', 'funnel', 'share', 'link-45deg', 'git', 'github'
];

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './icon-picker.component.html'
})
export class IconPickerComponent {
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();

  search = signal('');
  icons = CONSULTING_ICONS;

  filteredIcons = computed(() => {
    const term = this.search().toLowerCase().trim();
    if (!term) return this.icons;
    return this.icons.filter(i => i.includes(term));
  });

  select(icon: string): void {
    this.valueChange.emit('bi-' + icon);
  }

  isSelected(icon: string): boolean {
    return this.value === 'bi-' + icon;
  }

  onCustomInput(val: string): void {
    this.valueChange.emit(val);
  }
}
