import React, { useState, useEffect } from 'react'
import * as workSessionService from 'shared/services/work-session-service'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import PropTypes from 'prop-types'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}))


export function UserSettingsForm(props) {
  const classes = useStyles()

  const [workSessions, setWorkSessionState] = useState({
    list: [],
    loaded: false,
  })
  const [formValues, setFormValues] = useState({
    activeWorkSession: props.activeWorkSession,
  })

  useEffect(() => {
    const unsubscribeFromWorkSessions = workSessionService.subscribeToWorkSessions({
      onData: newData => {
        setWorkSessionState({
          list: newData,
          loaded: true,
        })
        console.log('Successfully subscribed to new work sessions.')
      },
      onError: err => {
        console.error({ err }, 'Error occurred while subscribing to new work sessions from UserSettingsForm.')
      }
    })

    return unsubscribeFromWorkSessions
  }, [])

  if (!workSessions.loaded) {
    return null
  }

  function handleChange(event) {
    setFormValues(oldValues => ({
      ...oldValues,
      [event.target.name]: event.target.value,
    }))
  }

  return (
    <form className={classes.root} autoComplete="off">
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="activeWorkSession">Work session</InputLabel>
        <Select
          value={formValues.activeWorkSession}
          onChange={handleChange}
          inputProps={{
            name: 'activeWorkSession',
            id: 'active-work-session-select',
          }}
        >
          <MenuItem value={formValues.activeWorkSession}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
    </form>
  )
}

UserSettingsForm.propTypes = {
  activeWorkSession: PropTypes.string,
}
