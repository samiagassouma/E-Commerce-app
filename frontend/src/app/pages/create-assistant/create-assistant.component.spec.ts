import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAssistantComponent } from './create-assistant.component';

describe('CreateAssistantComponent', () => {
  let component: CreateAssistantComponent;
  let fixture: ComponentFixture<CreateAssistantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAssistantComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
