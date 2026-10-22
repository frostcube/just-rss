import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestingStorage } from '../../testing/storage-mock';
import { SavedPage } from './saved.page';

describe('SavedPage', () => {
  let component: SavedPage;
  let fixture: ComponentFixture<SavedPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedPage],
      providers: [...provideTestingStorage()]
    }).compileComponents();

    fixture = TestBed.createComponent(SavedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
