import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EFormationHome } from './e-formation-home';

describe('EFormationHome', () => {
  let component: EFormationHome;
  let fixture: ComponentFixture<EFormationHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EFormationHome],
    }).compileComponents();

    fixture = TestBed.createComponent(EFormationHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
