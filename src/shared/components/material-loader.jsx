import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'

const useStyles = makeStyles(() => ({
  progress: {
    'margin-left': 'auto',
    'margin-right': 'auto',
  },
}))

export function MaterialLoader() {
  const classes = useStyles()

  return (
    <CircularProgress className={classes.progress} />
  )
}
