import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirectPaymentComponent } from './redirect-payment.component';

describe('RedirectPaymentComponent', () => {
  let component: RedirectPaymentComponent;
  let fixture: ComponentFixture<RedirectPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedirectPaymentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RedirectPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
