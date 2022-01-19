/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { testApp } from '../../tests/shared'

describe('When updating the history', () => {
  it('Does change, undo', () => {
    const app = testApp.clone()
    app.getShape('box1').update({ point: [1, 1] })
    expect(app.getShape('box1').model.point).toMatchObject([1, 1])
    app.undo()
    expect(app.getShape('box1').model.point).toMatchObject([0, 0])
  })

  it('Does change, undo, redo', () => {
    const app = testApp.clone()
    app.getShape('box1').update({ point: [1, 1] })
    app.undo()
    expect(app.getShape('box1').model.point).toMatchObject([0, 0])
    app.redo()
    expect(app.getShape('box1').model.point).toMatchObject([1, 1])
  })

  it('Does change, undo, undo', () => {
    const app = testApp.clone()
    app.getShape('box1').update({ point: [1, 1] })
    app.undo()
    app.undo()
    expect(app.getShape('box1').model.point).toMatchObject([0, 0])
  })

  it('Does change, change, undo', () => {
    const app = testApp.clone()
    app.getShape('box1').update({ point: [1, 1] })
    app.getShape('box1').update({ point: [2, 2] })
    app.undo()
    expect(app.getShape('box1').model.point).toMatchObject([1, 1])
  })

  it('Does change, change, undo, undo', () => {
    const app = testApp.clone()
    app.getShape('box1').update({ point: [1, 1] })
    app.getShape('box1').update({ point: [2, 2] })
    app.undo()
    app.undo()
    expect(app.getShape('box1').model.point).toMatchObject([0, 0])
  })

  it('Does change, change, undo, change, undo', () => {
    const app = testApp.clone()
    app.getShape('box1').update({ point: [1, 1] })
    app.getShape('box1').update({ point: [2, 2] })
    app.undo()
    app.getShape('box1').update({ point: [3, 3] })
    app.undo()
    expect(app.getShape('box1').model.point).toMatchObject([1, 1])
  })

  it('Does change, undo, redo', () => {
    const app = testApp.clone()
    app.getShape('box1').update({ point: [1, 1] })
    app.getShape('box1').update({ point: [2, 2] })
    app.undo()
    app.redo()
    expect(app.getShape('box1').model.point).toMatchObject([2, 2])
  })

  it('Does change, change, undo, undo, redo, redo', () => {
    const app = testApp.clone()
    app.getShape('box1').update({ point: [1, 1] })
    app.getShape('box1').update({ point: [2, 2] })
    app.undo()
    app.undo()
    app.redo()
    app.redo()
    expect(app.getShape('box1').model.point).toMatchObject([2, 2])
  })
})

describe('When pausing the history', () => {
  it('Ignores changes while paused.', () => {
    const app = testApp.clone()
    expect(app.history.frame).toBe(-1)
    app.pause()
    app.getShape('box1').update({ point: [1, 1] })
    expect(app.history.frame).toBe(-1)
    app.getShape('box1').update({ point: [2, 2] })
    expect(app.history.frame).toBe(-1)
    app.resume()
    expect(app.history.frame).toBe(0)
    expect(app.getShape('box1').model.point).toMatchObject([2, 2])
    app.undo()
    expect(app.history.frame).toBe(-1)
    expect(app.getShape('box1').model.point).toMatchObject([0, 0])
  })

  it('Resumes.', () => {
    const app = testApp.clone()
    app.pause()
    app.getShape('box1').update({ point: [1, 1] })
    app.getShape('box1').update({ point: [2, 2] })
    app.resume()
    app.getShape('box1').update({ point: [3, 3] })
    expect(app.getShape('box1').model.point).toMatchObject([3, 3])
    app.undo()
    expect(app.getShape('box1').model.point).toMatchObject([2, 2])
    app.redo()
    expect(app.getShape('box1').model.point).toMatchObject([3, 3])
  })

  it('Does not update frame if no change occurred while paused.', () => {
    const app = testApp.clone()
    app.getShape('box1').update({ point: [1, 1] })
    app.getShape('box1').update({ point: [2, 2] })
    app.pause()
    app.resume()
    expect(app.getShape('box1').model.point).toMatchObject([2, 2])
    app.undo()
    expect(app.getShape('box1').model.point).toMatchObject([1, 1])
    app.redo()
    expect(app.getShape('box1').model.point).toMatchObject([2, 2])
  })

  it('Updates frame if a change occurred while paused.', () => {
    const app = testApp.clone()
    app.getShape('box1').update({ point: [1, 1] })
    app.pause()
    app.getShape('box1').update({ point: [2, 2] })
    app.resume()
    expect(app.getShape('box1').model.point).toMatchObject([2, 2])
    app.undo()
    expect(app.getShape('box1').model.point).toMatchObject([1, 1])
    app.redo()
    expect(app.getShape('box1').model.point).toMatchObject([2, 2])
  })

  it('Resumes correctly after resuming.', () => {
    const app = testApp.clone()
    app.getShape('box1').update({ point: [1, 1] })
    app.pause()
    app.getShape('box1').update({ point: [2, 2] })
    app.resume()
    app.getShape('box1').update({ point: [3, 3] })
    expect(app.getShape('box1').model.point).toMatchObject([3, 3])
    app.undo()
    expect(app.getShape('box1').model.point).toMatchObject([2, 2])
    app.undo()
    expect(app.getShape('box1').model.point).toMatchObject([1, 1])
    app.redo()
    expect(app.getShape('box1').model.point).toMatchObject([2, 2])
  })

  it('Resumes while deep in undos.', () => {
    const app = testApp.clone()
    app.getShape('box1').update({ point: [1, 1] })
    app.getShape('box1').update({ point: [2, 2] })
    app.getShape('box1').update({ point: [3, 3] })
    app.undo()
    app.pause()
    app.resume()
    expect(app.getShape('box1').model.point).toMatchObject([2, 2])
    app.redo()
    expect(app.getShape('box1').model.point).toMatchObject([3, 3])
  })

  it('Resumes when undo is called while paused', () => {
    const app = testApp.clone()
    app.getShape('box1').update({ point: [1, 1] })
    app.pause()
    app.getShape('box1').update({ point: [2, 2] })
    expect(app.history.state).toBe('paused')
    app.undo()
    expect(app.history.state).toBe('playing')
    expect(app.getShape('box1').model.point).toMatchObject([1, 1])
    app.redo()
    expect(app.getShape('box1').model.point).toMatchObject([2, 2])
  })

  it('Resumes when redo is called while paused', () => {
    const app = testApp.clone()
    app.getShape('box1').update({ point: [1, 1] })
    app.getShape('box1').update({ point: [2, 2] })
    app.undo()
    app.pause()
    expect(app.history.state).toBe('paused')
    app.redo()
    expect(app.history.state).toBe('playing')
    expect(app.getShape('box1').model.point).toMatchObject([2, 2])
    app.undo()
    expect(app.getShape('box1').model.point).toMatchObject([1, 1])
  })
})

describe('TLHistoryManager.restore', () => {
  it('Restores a document', () => {
    const app = testApp.clone()
    app.getShape('box1').update({ point: [1, 1] })
    app.pause()
    app.getShape('box1').update({ point: [2, 2] })
    app.getShape('box1').update({ point: [3, 3] })
    app.history.restore()
    expect(app.getShape('box1').model.point).toMatchObject([1, 1])
  })
})
