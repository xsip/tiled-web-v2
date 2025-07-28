import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropDownMenu } from './drop-down-menu';

describe('DropDownMenu', () => {
  let component: DropDownMenu;
  let fixture: ComponentFixture<DropDownMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropDownMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropDownMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
