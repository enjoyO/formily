import React from 'react'
import { FormContext } from '../context'
import { useForm } from '../hooks'
import { IFormProps } from '../types'

export const Formily: React.FC<IFormProps> = props => {
  const form = useForm(props)
  return (
    <FormContext.Provider value={form}>{props.children}</FormContext.Provider>
  )
}

FormilyCore.defaultProps = {
  middlewares: []
}
