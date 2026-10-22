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

    const discoverService = TestBed.inject(DiscoverService);
    spyOn(discoverService, 'listOpmlFiles').and.resolveTo([{ name: 'Tech.opml', download_url: 'tech' }]);
    spyOn(discoverService, 'getCountryOpmlFile').and.resolveTo({ name: 'Australia.opml', download_url: 'au' });
    fixture = TestBed.createComponent(DiscoverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should list the local country section first', async () => {
    await component.ngOnInit();
    expect(component.sections.map(s => s.name)).toEqual(['Australia.opml', 'Tech.opml']);
    expect(component.sections[0].local).toBeTrue();
    expect(component.sections[1].local).toBeUndefined();
  });
});
