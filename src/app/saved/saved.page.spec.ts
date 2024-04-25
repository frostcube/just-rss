import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedPage } from './saved.page';

describe('Tab3Page', () => {
  let component: SavedPage;
  let fixture: ComponentFixture<SavedPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(SavedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
