import { TestBed } from '@angular/core/testing';

import { TmxConverter } from './tmx-converter';

describe('TmxConverter', () => {
  let service: TmxConverter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TmxConverter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
