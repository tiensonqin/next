import Vec from '@tldraw/vec'
import { autorun, reaction } from 'mobx'
import { BoundsUtils } from '~utils'
import type { TLApp, TLShape } from '../..'
import type { TLEventMap } from '../../types'

export class TLDisplayManager<S extends TLShape = TLShape, K extends TLEventMap = TLEventMap> {
  app: TLApp<S, K>

  state: 'stopped' | 'started' = 'stopped'

  constructor(app: TLApp<S, K>) {
    this.app = app
  }

  getShapesInViewport = () => {
    const {
      document: { shapes },
      selectedShapes,
      currentView,
    } = this.app

    if (this.state === 'stopped') {
      console.log('oh shit!')
    }

    return shapes
      .map(shape => this.app.getShape(shape.id))
      .filter(shape => {
        return (
          shape.model.parentId === undefined &&
          (!shape.canUnmount ||
            selectedShapes.has(shape) ||
            BoundsUtils.boundsContain(currentView, shape.rotatedBounds) ||
            BoundsUtils.boundsCollide(currentView, shape.rotatedBounds))
        )
      })
  }

  getSelectionDirectionHint = () => {
    const { selectionBounds, currentView } = this.app
    let selectionDirectionHint: number[] | undefined
    if (
      selectionBounds &&
      !(
        BoundsUtils.boundsContain(currentView, selectionBounds) ||
        BoundsUtils.boundsCollide(currentView, selectionBounds)
      )
    ) {
      const [cx, cy] = BoundsUtils.getBoundsCenter(selectionBounds)
      const { minX, minY, width, height } = currentView
      selectionDirectionHint = Vec.clampV(
        [(cx - minX - width / 2) / width, (cy - minY - height / 2) / height],
        -1,
        1
      )
    }
    return selectionDirectionHint
  }

  getShowSelection = () => {
    const { selectedShapesArray } = this.app
    return (
      this.app.isIn('select') &&
      ((selectedShapesArray.length === 1 && !selectedShapesArray[0]?.hideSelection) ||
        selectedShapesArray.length > 1)
    )
  }

  getShowSelectionRotation = () => {
    const {
      displayState: { showSelectionDetail },
    } = this.app
    return showSelectionDetail && this.app.isInAny('select.rotating', 'select.pointingRotateHandle')
  }

  getShowSelectionDetail = () => {
    const { selectedShapes, selectedShapesArray } = this.app
    return (
      this.app.isIn('select') &&
      selectedShapes.size > 0 &&
      !selectedShapesArray.every(shape => shape.hideSelectionDetail)
    )
  }

  getShowContextBar = () => {
    const {
      selectedShapesArray,
      userState: { ctrlKey },
    } = this.app
    return (
      !ctrlKey &&
      this.app.isInAny('select.idle', 'select.hoveringSelectionHandle') &&
      selectedShapesArray.length > 0 &&
      !selectedShapesArray.every(shape => shape.hideContextBar)
    )
  }

  getShowRotateHandles = () => {
    const { selectedShapesArray } = this.app
    return (
      selectedShapesArray.length > 0 &&
      !selectedShapesArray.every(shape => shape.hideRotateHandle) &&
      this.app.isInAny(
        'select.idle',
        'select.hoveringSelectionHandle',
        'select.pointingRotateHandle',
        'select.pointingResizeHandle'
      )
    )
  }

  getShowResizeHandles = () => {
    const { selectedShapesArray } = this.app
    return (
      selectedShapesArray.length > 0 &&
      !selectedShapesArray.every(shape => shape.hideResizeHandles) &&
      this.app.isInAny(
        'select.idle',
        'select.hoveringSelectionHandle',
        'select.pointingShape',
        'select.pointingSelectedShape',
        'select.pointingRotateHandle',
        'select.pointingResizeHandle'
      )
    )
  }

  disposables: (() => void)[] = []

  start = () => {
    this.state = 'started'
    this.disposables.push(
      reaction(this.getShapesInViewport, result =>
        this.app.updateDisplayState({ shapesInViewport: result })
      ),
      reaction(this.getSelectionDirectionHint, result =>
        this.app.updateDisplayState({ selectionDirectionHint: result })
      ),
      reaction(this.getShowSelection, result =>
        this.app.updateDisplayState({ showSelection: result })
      ),
      reaction(this.getShowSelectionRotation, result =>
        this.app.updateDisplayState({ showSelectionRotation: result })
      ),
      reaction(this.getShowSelectionDetail, result =>
        this.app.updateDisplayState({ showSelectionDetail: result })
      ),
      reaction(this.getShowContextBar, result =>
        this.app.updateDisplayState({ showContextBar: result })
      ),
      reaction(this.getShowRotateHandles, result =>
        this.app.updateDisplayState({ showRotateHandles: result })
      ),
      reaction(this.getShowResizeHandles, result =>
        this.app.updateDisplayState({ showResizeHandles: result })
      )
    )
  }

  stop = () => {
    this.disposables.forEach(disposable => disposable())
    this.disposables = []
    this.state = 'stopped'
  }
}
