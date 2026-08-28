import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultingHome } from './consulting-home';

describe('ConsultingHome', () => {
  let component: ConsultingHome;
  let fixture: ComponentFixture<ConsultingHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultingHome],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultingHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
