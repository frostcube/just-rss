import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestingStorage } from '../../testing/storage-mock';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [...provideTestingStorage()]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format country tags', () => {
    expect(component.getCountryTag({ officialLanguageCode: 'en', countryCode: 'AU' } as never)).toBe('en-AU');
  });
});
