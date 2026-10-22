import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestingStorage } from '../../testing/storage-mock';
import { SourcesPage } from './sources.page';

describe('SourcesPage', () => {
  let component: SourcesPage;
  let fixture: ComponentFixture<SourcesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SourcesPage],
      providers: [...provideTestingStorage()]
    }).compileComponents();

    fixture = TestBed.createComponent(SourcesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
