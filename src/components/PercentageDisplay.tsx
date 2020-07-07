import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React from 'react';

const useStyles = makeStyles({
  root: (props: { value: number }) => {
    const f = Math.round(props.value * 255);
    return {
      color: `rgba(${255 - f}, ${f}, 50, 0.5)`,
    };
  },
});

export default function PercentageDisplay(props: { value: number }) {
  const classes = useStyles({ value: props.value });

  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        variant="static"
        className={classes.root}
        value={props.value * 100}
      />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="caption"
          component="div"
          color="textSecondary"
        >{`${Math.round(props.value * 100)}%`}</Typography>
      </Box>
    </Box>
  );
}

PercentageDisplay.propTypes = {
  /**
   * The value of the progress indicator for the determinate and static variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};
