import { TestBed } from '@angular/core/testing';

import { KeyAssistantService } from './key-assistant.service';

describe('KeyAssistantService', () => {
  let service: KeyAssistantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyAssistantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
