import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { ColorPalettePopoverComponent } from './color-palette-popover.component'

describe('ColorPalettePopoverComponent', () => {
  let component: ColorPalettePopoverComponent
  let fixture: ComponentFixture<ColorPalettePopoverComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ColorPalettePopoverComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents()

    fixture = TestBed.createComponent(ColorPalettePopoverComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
