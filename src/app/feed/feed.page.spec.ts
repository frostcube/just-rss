import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedPage } from './feed.page';

describe('Tab1Page', () => {
  let component: FeedPage;
  let fixture: ComponentFixture<FeedPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(FeedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
