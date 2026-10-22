import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestingStorage } from '../../testing/storage-mock';
import { SourceEditComponent } from './source-edit.component';

describe('SourceEditComponent', () => {
  let component: SourceEditComponent;
  let fixture: ComponentFixture<SourceEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SourceEditComponent],
      providers: [...provideTestingStorage()]
    }).compileComponents();

    fixture = TestBed.createComponent(SourceEditComponent);
    component = fixture.componentInstance;
    component.feed = {
      url: 'https://example.com/feed', title: 'Example', iconUrl: undefined, description: '',
      lastPublished: 0, lastRetrieved: 0, pollingFrequency: 60, healthy: true, podcast: false, tags: ['a', 'b']
    };
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate the form from the feed', () => {
    expect(component.form.value.title).toBe('Example');
    expect(component.form.value.tags).toBe('a, b');
  });

  it('should require a valid URL', () => {
    component.form.patchValue({ url: 'not a url' });
    expect(component.form.invalid).toBeTrue();
    component.form.patchValue({ url: 'https://example.com/other' });
    expect(component.form.valid).toBeTrue();
  });
});
