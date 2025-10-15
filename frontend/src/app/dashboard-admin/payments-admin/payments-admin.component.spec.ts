import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsAdminComponent } from './payments-admin.component';

describe('PaymentsAdminComponent', () => {
  let component: PaymentsAdminComponent;
  let fixture: ComponentFixture<PaymentsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
