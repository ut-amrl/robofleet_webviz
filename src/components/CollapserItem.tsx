import { Box, Collapse, Divider, ListItem, ListItemIcon, ListItemText, makeStyles, Theme } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import React, { useState } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
    spacer: {
        height: theme.spacing(2),
    },
}));

/**
 * A ListItem which expands and collapses its children
 */
export default function CollapserItem(props: { icon?: React.ReactNode; children?: React.ReactNode; label: string }) {
    const classes = useStyles();
    const [open, setOpen] = useState(false);

    return (
        <>
            <ListItem button disableGutters onClick={() => setOpen((open) => !open)}>
                {props.icon && <ListItemIcon>{props.icon}</ListItemIcon>}
                <ListItemText primary={props.label} />
                {open ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={open} timeout={50}>
                {props.children}
                <Box className={classes.spacer} />
            </Collapse>
            <Divider />
        </>
    );
}
