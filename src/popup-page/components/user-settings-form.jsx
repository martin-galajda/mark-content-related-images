import React, { useState, useEffect } from 'react'
import * as workSessionService from 'shared/services/work-session-service'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Button from '@material-ui/core/Button'
import PropTypes from 'prop-types'
import { ButtonGroup } from '../styled'
import { LoaderContainer } from '../styled'
import { MaterialLoader } from 'shared/components/material-loader'


const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '88%',
    'align-self': 'center',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    width: '100%',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  saveButton: {},
  buttonGroup: {
    'margin-top': '12px',
    'margin-right': '10px',
    'width': '32px',
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
    return <LoaderContainer>
      <MaterialLoader />
    </LoaderContainer>
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
          {workSessions.list.map(({ id, data }) => <MenuItem value={id} key={id}>{data.datasetName}</MenuItem>)}
        </Select>
      </FormControl>
      <ButtonGroup> 
        <Button variant="contained" size="medium" className={classes.saveButton} onClick={() => props.onGoBack()}>
          Go Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="medium"
          className={classes.saveButton}
          onClick={() => props.onUpdateUserWorkSession(formValues.activeWorkSession)}
          disabled={props.activeWorkSession === formValues.activeWorkSession}>
          Save
        </Button>
      </ButtonGroup>

    </form>
    
  )
}

UserSettingsForm.propTypes = {
  activeWorkSession: PropTypes.string.isRequired,
  onGoBack: PropTypes.func.isRequired,
  onUpdateUserWorkSession: PropTypes.func.isRequired,
}
