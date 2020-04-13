import { filter } from 'rxjs/operators/filter'

import { AfterContentInit, Component, NgZone, OnInit } from '@angular/core'
import { PopoverController } from '@ionic/angular'

import { ColorPalettePopoverComponent } from '../color-palette-popover/color-palette-popover.component'
import { ColorPaletteService } from '../color-palette.service'
import { IWhiteboardChange, Whiteboard } from './whiteboard'

export enum Mode {
  FreeDrawing = 1,
  FreeTexting = 2,
  FreeBrushing = 3,
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements AfterContentInit, OnInit {
  public whiteboardControls = {
    selectedColor: '#0693E3',
    selectedMode: Mode.FreeDrawing,
  }
  public whiteboardExports = {
    Mode,
  }

  private whiteboards: Whiteboard[] = []
  private whiteboardChangeSeq: IWhiteboardChange[] = []
  private whiteboardChangeUndoSeq: IWhiteboardChange[] = []

  constructor(
    private ngZone: NgZone,
    private popoverCtrl: PopoverController,
    private colorPaletteService: ColorPaletteService,
  ) {}

  get hasUndo() {
    return this.whiteboardChangeSeq.length > 0
  }

  get hasRedo() {
    return this.whiteboardChangeUndoSeq.length > 0
  }

  public ngOnInit(): void {
    this.colorPaletteService.observeChanges('home').subscribe((color) => {
      for (const whiteboard of this.whiteboards) {
        whiteboard.setMouseFreeDrawingColor(color.hex)
      }

      this.whiteboardControls.selectedColor = color.hex
    })

    document.addEventListener('keydown', (evt: KeyboardEvent) => {
      this.onKeydownAlt(evt)

      // Ctrl + Z
      // Ctrl + Shift + Z
      if (!(evt.ctrlKey || evt.metaKey) || evt.key !== 'z') {
        return
      }
      if (evt.shiftKey) {
        this.redo()
      } else {
        this.undo()
      }
    })

    document.addEventListener('keyup', (evt: KeyboardEvent) => {
      this.onKeyupAlt(evt)
    })
  }

  public async ngAfterContentInit(): Promise<void> {
    setTimeout(async () => {
      const whiteboardsCtnElem = document.getElementById('whiteboards-container')
      if (whiteboardsCtnElem === null) {
        throw new Error('whiteboardsCtnElem is null.')
      }

      for (let idx = 1; idx < 10; idx++) {
        const page = new Whiteboard(`./assets/pages/tracemonkey-${idx}.svg`, idx, whiteboardsCtnElem.clientWidth)

        await this.ngZone.runOutsideAngular(async () => {
          const divElem = await page.init()
          page.setInitZoom(1.25)
          page.setMouseFreeDrwaingEnabled(this.whiteboardControls.selectedMode === Mode.FreeDrawing)
          page.setMouseFreeDrawingColor(this.whiteboardControls.selectedColor)

          whiteboardsCtnElem.appendChild(divElem)
        })

        this.whiteboards.push(page)
      }

      for (const whiteboard of this.whiteboards) {
        whiteboard
          .observeChanges()
          .pipe(filter((e) => e.isSystemModification === false))
          .subscribe((whiteboardChange) => {
            this.ngZone.run(() => {
              this.whiteboardChangeSeq.push(whiteboardChange)
              this.whiteboardChangeUndoSeq = []
            })
          })
      }
    }, 100)
  }

  public onClickUndo(ev: any) {
    this.undo()
  }

  public onClickRedo(ev: any) {
    this.redo()
  }

  public async onClickText(ev: any) {
    this.whiteboardControls.selectedMode = Mode.FreeTexting
    this.onModeChange()
  }

  public async onClickPencil(ev: any) {
    this.whiteboardControls.selectedMode = Mode.FreeDrawing
    this.onModeChange()
  }

  public async onClickEraser(ev: any) {
    this.whiteboardControls.selectedMode = Mode.FreeBrushing
    this.onModeChange()
  }

  public async onClickColorPalette(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: ColorPalettePopoverComponent,
      event: ev,
      translucent: true,
      componentProps: {
        path: 'home',
      },
    })
    popover.style.cssText = '--min-width: 276px; --max-width: 276px;'

    return popover.present()
  }

  private onModeChange() {
    for (const whiteboard of this.whiteboards) {
      whiteboard.setMouseFreeDrwaingEnabled(this.whiteboardControls.selectedMode === Mode.FreeDrawing)
    }
  }

  private onKeydownAlt(evt: KeyboardEvent) {
    if (evt.keyCode === 18) {
      for (const whiteboard of this.whiteboards) {
        whiteboard.setMouseFreeDrwaingEnabled(false)
      }
    }
  }

  private onKeyupAlt(evt: KeyboardEvent) {
    if (evt.keyCode === 18) {
      for (const whiteboard of this.whiteboards) {
        whiteboard.setMouseFreeDrwaingEnabled(this.whiteboardControls.selectedMode === Mode.FreeDrawing)
      }
    }
  }

  private undo() {
    const whiteboardChange = this.whiteboardChangeSeq.pop()
    if (whiteboardChange === undefined) {
      return
    }
    whiteboardChange.whiteboard.undo()

    this.whiteboardChangeUndoSeq.push(whiteboardChange)
  }

  private redo() {
    const whiteboardChange = this.whiteboardChangeUndoSeq.pop()
    if (whiteboardChange === undefined) {
      return
    }
    whiteboardChange.whiteboard.redo()

    this.whiteboardChangeSeq.push(whiteboardChange)
  }
}
