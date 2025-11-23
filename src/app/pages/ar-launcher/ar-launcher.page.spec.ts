import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArLauncherPage } from './ar-launcher.page';

describe('ArLauncherPage', () => {
  let component: ArLauncherPage;
  let fixture: ComponentFixture<ArLauncherPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ArLauncherPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
