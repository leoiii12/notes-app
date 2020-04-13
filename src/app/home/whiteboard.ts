import { fabric } from 'fabric'
import * as pify from 'pify'
import { Observable, Subject } from 'rxjs'

export interface IWhiteboardChange {
  idx: number
  event: string
  whiteboard: Whiteboard
  isSystemModification: boolean
}

export class Whiteboard {
  private divElem: HTMLDivElement
  private canvasElem: HTMLCanvasElement
  private fabricCanvas: fabric.Canvas

  private fabricImg: fabric.Image

  private initHeightWidth: { height: number; width: number }
  private initZoom: number

  private undoObjects: fabric.Object[] = []
  private isSystemModification = false

  private events = []

  constructor(private url: string, private idx: number, private width: number) {}

  public async init(): Promise<HTMLDivElement> {
    const divElem = document.createElement('div')
    divElem.id = `whiteboard-container-${this.idx}`
    divElem.classList.add('whiteboard-container')

    const canvasElem = document.createElement('canvas')
    canvasElem.id = `whiteboard-canvas-${this.idx}`
    canvasElem.classList.add('whiteboard-canvas')

    const img: fabric.Image = await pify(fabric.Image.fromURL, {
      errorFirst: false,
    })(this.url)
    img.setOptions({
      selectable: false,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true,
    })

    if (img.height === undefined || img.width === undefined) {
      throw new Error(`The dimensions is undefined. img.height=[${img.height}], img.width=[${img.width}]`)
    }

    divElem.style.height = `${img.height}px`
    divElem.style.width = `${this.width}px`
    divElem.appendChild(canvasElem)

    const fabricCanvas = new fabric.Canvas(canvasElem)
    fabricCanvas.setHeight(img.height)
    fabricCanvas.setWidth(this.width)
    fabricCanvas.add(img)

    this.divElem = divElem
    this.canvasElem = canvasElem
    this.fabricCanvas = fabricCanvas
    this.fabricImg = img
    this.initHeightWidth = { height: img.height, width: img.width }

    //
    // Extra Controls
    //

    this.initMouseWheelPanning()
    this.initMouseFreeDrawing()

    return divElem
  }

  public setInitZoom(value: number) {
    this.divElem.style.height = `${this.initHeightWidth.height * value}px`

    this.fabricCanvas.setZoom(value)
    this.fabricCanvas.setHeight(this.initHeightWidth.height * value)

    this.initZoom = value
  }

  public setMouseFreeDrawingColor(rgb: string) {
    this.fabricCanvas.freeDrawingBrush.color = rgb
  }

  public setMouseFreeDrwaingEnabled(enabled: boolean) {
    this.fabricCanvas.isDrawingMode = enabled
  }

  public undo() {
    const objects = [...this.fabricCanvas.getObjects()]
    if (objects.length <= 1) {
      return
    }

    const object = objects[objects.length - 1]

    this.undoObjects.push(object)

    this.isSystemModification = true
    this.fabricCanvas.remove(object)
    this.isSystemModification = false
  }

  public redo() {
    const object = this.undoObjects.pop()
    if (object === undefined) {
      return
    }

    this.isSystemModification = true
    this.fabricCanvas.add(object)
    this.isSystemModification = false
  }

  public observeChanges(): Observable<IWhiteboardChange> {
    const subject = new Subject<IWhiteboardChange>()

    this.fabricCanvas.on('object:added', () => {
      subject.next({
        idx: this.idx,
        event: 'object:added',
        whiteboard: this,
        isSystemModification: this.isSystemModification,
      })
    })

    this.fabricCanvas.on('object:added', () => {
      if (this.isSystemModification === false) {
        this.undoObjects = []
      }
    })

    return subject.asObservable()
  }

  public observeMouseClicks(): Observable<IWhiteboardChange> {
    const subject = new Subject<IWhiteboardChange>()

    this.fabricCanvas.on('mouse:down', (ev) => {
      console.log(ev)
    })

    return subject.asObservable()
  }

  private initMouseWheelPanning() {
    let isDragging: boolean
    let lastPosX: number
    let lastPosY: number

    this.fabricCanvas.on('mouse:down', function (this: fabric.StaticCanvas, opt: { e: any }) {
      var evt = opt.e
      if (evt.altKey === true) {
        isDragging = true
        lastPosX = evt.clientX
        lastPosY = evt.clientY
        ;(this as any).selection = false
      }
    })
    this.fabricCanvas.on('mouse:move', function (this: fabric.StaticCanvas, opt: { e: any }) {
      if (isDragging === true) {
        var e = opt.e

        if (this.viewportTransform !== undefined) {
          this.viewportTransform[4] += e.clientX - lastPosX
          this.viewportTransform[5] += e.clientY - lastPosY
        }

        this.requestRenderAll()

        lastPosX = e.clientX
        lastPosY = e.clientY
      }
    })
    this.fabricCanvas.on('mouse:up', function (this: fabric.StaticCanvas, opt: { e: any }) {
      isDragging = false
      ;(this as any).selection = true
    })
  }

  private initMouseFreeDrawing() {
    this.fabricCanvas.isDrawingMode = true
  }
}
