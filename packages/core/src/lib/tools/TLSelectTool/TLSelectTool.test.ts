import { TLTestApp } from '~test'
import { TLTargetType } from '~types'

describe('When in the idle state', () => {
  it('Clears selected shapes when Escape is pressed', () => {
    new TLTestApp()
      .setSelectedShapes(['box1'])
      .expectSelectedIdsToBe(['box1'])
      .keyDown('Escape', { type: TLTargetType.Canvas })
      .expectSelectedIdsToBe([])
  })

  it('Sets hovered shape when entering a shape', () => {
    new TLTestApp().pointerEnter([10, 10], 'box1').expectHoveredIdToBe('box1')
  })

  it('Clears hovered shape when exiting a shape', () => {
    const app = new TLTestApp()
    app.pointerEnter([10, 10], 'box1')
    app.pointerLeave([10, 10], 'box1')
    expect(app.userState.hoveredId).toBeUndefined()
  })
})

describe('editing shape', () => {
  it('Sets editing shape when double clicking an editable shape', () => {
    const app = new TLTestApp()
    app.doubleClick([10, 10], 'box3')
    expect(app.userState.editingId).toBe('box3')
  })

  it('Does not set editing shape when double clicking a shape that is not editable', () => {
    const app = new TLTestApp()
    app.doubleClick([10, 10], 'box1')
    expect(app.userState.editingId).toBeUndefined()
  })

  it('Clears editing shape when clicking outside of the editing shape', () => {
    const app = new TLTestApp()
    app.doubleClick([10, 10], 'box3')
    app.click([-100, -110], { type: TLTargetType.Canvas })
    expect(app.userState.editingId).toBeUndefined()
  })

  it('Does not clear editing shape when clicking inside of the editing shape', () => {
    const app = new TLTestApp()
    app.doubleClick([10, 10], 'box3')
    app.pointerDown([10, 10], 'box3')
    expect(app.userState.editingId).toBe('box3')
  })
})

// export class TestEditableBox extends TLBoxShape<TLBoxShapeModel> {
//   static type = 'editable-box'
//   isEditable = true
// }

// export class TestEditableBoxTool extends TLBoxTool<TLBoxShape, any> {
//   static id = 'editable-box'
//   static shortcut = ['x']
//   Shape = TLBoxShape
// }
