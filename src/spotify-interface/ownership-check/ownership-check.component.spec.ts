import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnershipCheckComponent } from './ownership-check.component';

describe('OwnershipCheckComponent', () => {
  let component: OwnershipCheckComponent;
  let fixture: ComponentFixture<OwnershipCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnershipCheckComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnershipCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
