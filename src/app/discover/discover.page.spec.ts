import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscoverService } from '../services/discover.service';
import { provideTestingStorage } from '../../testing/storage-mock';
import { DiscoverPage } from './discover.page';

describe('DiscoverPage', () => {
  let component: DiscoverPage;
  let fixture: ComponentFixture<DiscoverPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscoverPage],
      providers: [...provideTestingStorage()]
    }).compileComponents();

    spyOn(TestBed.inject(DiscoverService), 'listOpmlFiles').and.resolveTo([]);
    fixture = TestBed.createComponent(DiscoverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
