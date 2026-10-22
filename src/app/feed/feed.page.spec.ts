import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestingStorage } from '../../testing/storage-mock';
import { FeedPage } from './feed.page';

describe('FeedPage', () => {
  let component: FeedPage;
  let fixture: ComponentFixture<FeedPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedPage],
      providers: [...provideTestingStorage()]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in the loading state', () => {
    expect(component.loading).toBeTrue();
  });

  it('should toggle the source filter', () => {
    component.filterByUrl('https://example.com/feed');
    expect(component.filter).toBe('https://example.com/feed');
    component.filterByUrl('https://example.com/feed');
    expect(component.filter).toBe('');
  });

  it('should ignore the selected tag when the tag bar is hidden', () => {
    spyOn(component.sourcesService, 'getAllTags').and.returnValue(['news']);
    component.filterByTag('news');
    expect(component.showTagBar).toBeTrue();
    expect(component.activeTag).toBe('news');

    component.settingsService.updateSettings({ showTagBar: false });
    expect(component.activeTag).toBe('');
  });
});
