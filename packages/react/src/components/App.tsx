/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import type { TLReactApp, TLReactShape, TLReactShapeConstructor } from '~lib'
import { AppProvider } from '~components'
import type {
  AnyObject,
  TLDocumentModel,
  TLCallback,
  TLTheme,
  TLToolConstructor,
} from '@tldraw/core'
import type { TLReactComponents } from '~types/component-props'
import type { TLReactCallbacks, TLReactEventMap } from '~types'
import { AppCanvas } from './AppCanvas'

export interface TLCommonAppProps<
  S extends TLReactShape = TLReactShape,
  R extends TLReactApp<S> = TLReactApp<S>
> extends Partial<TLReactCallbacks<S, R>> {
  id?: string
  className?: string
  meta?: AnyObject
  theme?: Partial<TLTheme>
  components?: TLReactComponents<S>
  children?: React.ReactNode
}

export interface TLAppPropsWithoutApp<
  S extends TLReactShape = TLReactShape,
  R extends TLReactApp<S> = TLReactApp<S>
> extends TLCommonAppProps<S, R> {
  model?: TLDocumentModel
  Shapes?: TLReactShapeConstructor<S>[]
  Tools?: TLToolConstructor<S, TLReactEventMap, TLReactApp<S>>[]
  children?: React.ReactNode
}

export interface TLAppPropsWithApp<
  S extends TLReactShape = TLReactShape,
  R extends TLReactApp<S> = TLReactApp<S>
> extends TLCommonAppProps<S, R> {
  app: R
  children?: React.ReactNode
}

export type AppProps<S extends TLReactShape = TLReactShape> =
  | TLAppPropsWithoutApp<S>
  | TLAppPropsWithApp<S>

export function App<S extends TLReactShape>(props: AppProps<S>): JSX.Element {
  return (
    <AppProvider {...props}>
      <AppCanvas {...props} />
    </AppProvider>
  )
}
