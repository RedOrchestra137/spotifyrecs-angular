import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotifyInterfaceComponent } from './spotify-interface.component';

describe('SpotifyInterfaceComponent', () => {
  let component: SpotifyInterfaceComponent;
  let fixture: ComponentFixture<SpotifyInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotifyInterfaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpotifyInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
