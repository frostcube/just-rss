import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourcesPage } from './sources.page';

describe('SourcesPage', () => {
  let component: SourcesPage;
  let fixture: ComponentFixture<SourcesPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(SourcesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
