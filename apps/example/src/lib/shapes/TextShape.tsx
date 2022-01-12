/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { HTMLContainer, TLComponentProps, TLTextMeasure } from '@tldraw/react'
import { TextUtils, TLBounds, TLTextShape, TLTextShapeProps } from '@tldraw/core'
import { observer } from 'mobx-react-lite'
import { CustomStyleProps, withClampedStyles } from './style-props'

export interface TextShapeProps extends TLTextShapeProps, CustomStyleProps {
  borderRadius: number
  fontFamily: string
  fontSize: number
  lineHeight: number
  padding: number
  type: 'text'
}

export class TextShape extends TLTextShape<TextShapeProps> {
  static id = 'text'

  static defaultProps: TextShapeProps = {
    id: 'box',
    parentId: 'page',
    type: 'text',
    point: [0, 0],
    size: [100, 100],
    autosize: true,
    text: '',
    lineHeight: 1.2,
    fontSize: 20,
    padding: 4,
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    borderRadius: 0,
    stroke: '#000000',
    fill: '#ffffff',
    strokeWidth: 2,
    opacity: 1,
  }

  ReactComponent = observer(({ events, isErasing, isEditing, onEditingEnd }: TLComponentProps) => {
    const {
      props: { opacity, fontFamily, fontSize, lineHeight, text, stroke, padding },
    } = this
    const rInput = React.useRef<HTMLTextAreaElement>(null)

    const rIsMounted = React.useRef(false)

    const rInnerWrapper = React.useRef<HTMLDivElement>(null)

    // When the text changes, update the text—and,
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { autosize } = this.props
      const text = TextUtils.normalizeText(e.currentTarget.value)
      if (autosize) {
        this.update({ text, size: this.getAutoSizedBoundingBox(text) })
        return
      }
      // If not autosizing, update just the text
      this.update({ text })
    }, [])

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.metaKey) e.stopPropagation()
      switch (e.key) {
        case 'Meta': {
          e.stopPropagation()
          break
        }
        case 'z': {
          if (e.metaKey) {
            if (e.shiftKey) {
              document.execCommand('redo', false)
            } else {
              document.execCommand('undo', false)
            }
            e.preventDefault()
          }
          break
        }
        case 'Enter': {
          if (e.ctrlKey || e.metaKey) {
            e.currentTarget.blur()
          }
          break
        }
        case 'Tab': {
          e.preventDefault()
          if (e.shiftKey) {
            TextUtils.unindent(e.currentTarget)
          } else {
            TextUtils.indent(e.currentTarget)
          }
          this.update({ text: TextUtils.normalizeText(e.currentTarget.value) })
          break
        }
      }
    }, [])

    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        e.currentTarget.setSelectionRange(0, 0)
        onEditingEnd?.()
      },
      [onEditingEnd]
    )

    const handleFocus = React.useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        if (!isEditing) return
        if (!rIsMounted.current) return
        if (document.activeElement === e.currentTarget) {
          e.currentTarget.select()
        }
      },
      [isEditing]
    )

    const handlePointerDown = React.useCallback(
      e => {
        if (isEditing) e.stopPropagation()
      },
      [isEditing]
    )

    React.useEffect(() => {
      if (isEditing) {
        requestAnimationFrame(() => {
          rIsMounted.current = true
          const elm = rInput.current
          if (elm) {
            elm.focus()
            elm.select()
          }
        })
      } else {
        onEditingEnd?.()
      }
    }, [isEditing, onEditingEnd])

    React.useLayoutEffect(() => {
      const { fontFamily, fontSize, lineHeight, padding } = this.props
      const { width, height } = this.measure.measureText(
        text,
        { fontFamily, fontSize, lineHeight },
        padding
      )
      this.update({ size: [width, height] })
    }, [])

    return (
      <HTMLContainer {...events} opacity={isErasing ? 0.2 : opacity}>
        <div
          ref={rInnerWrapper}
          className="text-shape-wrapper"
          data-hastext={!!text}
          data-isediting={isEditing}
          style={{
            fontFamily,
            fontSize,
            padding,
            lineHeight,
            color: stroke,
          }}
        >
          {isEditing ? (
            <textarea
              ref={rInput}
              className="text-shape-input"
              name="text"
              tabIndex={-1}
              autoComplete="false"
              autoCapitalize="false"
              autoCorrect="false"
              autoSave="false"
              // autoFocus
              placeholder=""
              spellCheck="true"
              wrap="off"
              dir="auto"
              datatype="wysiwyg"
              defaultValue={text}
              onFocus={handleFocus}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onPointerDown={handlePointerDown}
              // onContextMenu={stopPropagation}
            />
          ) : (
            <>{text}&#8203;</>
          )}
        </div>
      </HTMLContainer>
    )
  })

  ReactIndicator = observer(() => {
    const {
      props: { borderRadius },
      bounds,
    } = this
    return (
      <rect
        width={bounds.width}
        height={bounds.height}
        rx={borderRadius}
        ry={borderRadius}
        fill="transparent"
      />
    )
  })

  validateProps = (props: Partial<TextShapeProps>) => {
    if (props.borderRadius !== undefined) props.borderRadius = Math.max(0, props.borderRadius)
    return withClampedStyles(props)
  }

  // Custom

  private measure = new TLTextMeasure()

  getAutoSizedBoundingBox(text = this.props.text) {
    const { fontFamily, fontSize, lineHeight, padding } = this.props
    const { width, height } = this.measure.measureText(
      text,
      { fontFamily, fontSize, lineHeight },
      padding
    )
    return [width, height]
  }

  getBounds = (): TLBounds => {
    const [x, y] = this.props.point
    const [width, height] = this.props.size
    return {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height,
      width,
      height,
    }
  }

  onResizeStart = () => {
    this.scale = [...(this.props.scale ?? [1, 1])]
    return this.update({
      autosize: false,
    })
  }

  onResetBounds = () => {
    this.update({
      size: this.getAutoSizedBoundingBox(),
      autosize: true,
    })
    return this
  }
}
