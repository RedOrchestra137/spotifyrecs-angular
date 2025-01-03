import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOtherPlaylistComponent } from './add-other-playlist.component';

describe('AddOtherPlaylistComponent', () => {
  let component: AddOtherPlaylistComponent;
  let fixture: ComponentFixture<AddOtherPlaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOtherPlaylistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOtherPlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
