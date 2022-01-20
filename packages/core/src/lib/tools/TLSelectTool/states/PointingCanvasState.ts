import { Vec } from '@tldraw/vec'
import { TLApp, TLSelectTool, TLShape, TLToolState } from '~lib'
import type { TLEventMap, TLEvents } from '~types'

export class PointingCanvasState<
  S extends TLShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLSelectTool<S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'pointingCanvas'

  onEnter = () => {
    const {
      userState: { shiftKey },
    } = this.app
    if (!shiftKey) this.app.selectShapes([])
  }

  onWheel: TLEvents<S>['wheel'] = (info, e) => {
    this.onPointerMove(info, e)
  }

  onPointerMove: TLEvents<S>['pointer'] = () => {
    const {
      userState: { currentPoint, originPoint },
    } = this.app
    if (Vec.dist(currentPoint, originPoint) > 5) {
      this.tool.transition('brushing')
    }
  }

  onPointerUp: TLEvents<S>['pointer'] = () => {
    const {
      userState: { shiftKey },
    } = this.app
    if (!shiftKey) {
      this.app.selectShapes([])
    }
    this.tool.transition('idle')
  }

  onPinchStart: TLEvents<S>['pinch'] = (info, event) => {
    this.tool.transition('pinching', { info, event })
  }
}
