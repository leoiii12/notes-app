import { ColorEvent } from 'ngx-color'

import { Component, Input } from '@angular/core'

import { ColorPaletteService } from '../color-palette.service'

@Component({
  selector: 'app-color-palette-popover',
  templateUrl: './color-palette-popover.component.html',
  styleUrls: ['./color-palette-popover.component.scss'],
})
export class ColorPalettePopoverComponent {
  @Input('path')
  private path: string

  constructor(private colorPaletteService: ColorPaletteService) {}

  public onChangeComplete(ev: ColorEvent) {
    this.colorPaletteService.nextChange(this.path, ev.color)
  }
}
