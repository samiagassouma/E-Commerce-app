import { TestBed } from '@angular/core/testing';

import { RepAssistantService } from './rep-assistant.service';

describe('RepAssistantService', () => {
  let service: RepAssistantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RepAssistantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
