import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistantSuccessDialogComponent } from './assistant-success-dialog.component';

describe('AssistantSuccessDialogComponent', () => {
  let component: AssistantSuccessDialogComponent;
  let fixture: ComponentFixture<AssistantSuccessDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistantSuccessDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssistantSuccessDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
