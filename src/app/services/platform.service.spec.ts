import { TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular/standalone';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { PlatformService } from './platform.service';

describe('PlatformService', () => {
  let service: PlatformService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideIonicAngular()] });
    service = TestBed.inject(PlatformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should detect the browser platform under test', () => {
    expect(service.isBrowser()).toBeTrue();
    expect(service.isNative()).toBeFalse();
    expect(service.currentPlatform).toBe('browser');
  });

  it('should open URLs in a new window when in the browser', () => {
    const openSpy = spyOn(window, 'open');
    service.openUrlInPlatformBrowser('https://example.com');
    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank');
  });

  it('should not open anything for an undefined URL', () => {
    const openSpy = spyOn(window, 'open');
    service.openUrlInPlatformBrowser(undefined);
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('should treat iOS as native', () => {
    const platform = TestBed.inject(Platform);
    spyOn(platform, 'is').and.callFake((name: string) => name === 'ios');
    const native = new PlatformService(platform);
    expect(native.isNative()).toBeTrue();
  });
});
