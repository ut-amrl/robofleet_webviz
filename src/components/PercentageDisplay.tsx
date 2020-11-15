import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';

const barColor = (value: number, opacity: number) => {
  const f = Math.round(value * 255);
  return `rgba(${255 - f}, ${f}, 0, ${opacity})`;
};

const useStyles = makeStyles({
  root: () => {
    return {
      height: 8,
    };
  },
  colorPrimary: (props: { value: number }) => ({
    backgroundColor: barColor(props.value, 0.2),
  }),
  barColorPrimary: (props: { value: number }) => ({
    backgroundColor: barColor(props.value, 1.0),
  }),
});

export default function PercentageDisplay(props: { value: number }) {
  const classes = useStyles({ value: props.value });
  const { value: originalValue, ...otherProps } = props;
  const value = originalValue * 100;

  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={0.5}>
        <LinearProgress
          classes={classes}
          variant="determinate"
          value={value}
          {...otherProps}
        />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textPrimary">{`${Math.round(
          value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}
