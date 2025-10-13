import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfaceAssistantComponent } from './interface-assistant.component';

describe('InterfaceAssistantComponent', () => {
  let component: InterfaceAssistantComponent;
  let fixture: ComponentFixture<InterfaceAssistantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterfaceAssistantComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InterfaceAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
