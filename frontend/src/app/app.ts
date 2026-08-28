import { Component, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

declare var AOS: any;
declare var PureCounter: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {

  ngAfterViewInit(): void {
    setTimeout(() => {
      const w = window as any;
      if (typeof w.initDewiTemplate === 'function') {
        w.initDewiTemplate();
      }
    }, 300);
  }
}
