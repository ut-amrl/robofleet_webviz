import {
    Box,
    Card,
    CardContent,
    createStyles,
    Fab,
    Grow,
    IconButton,
    makeStyles,
    Theme,
    Tooltip,
    Typography,
    Zoom,
} from '@material-ui/core';
import { Close, Tune } from '@material-ui/icons';
import React, { useState } from 'react';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        settingsContainer: {
            position: 'relative',
            margin: theme.spacing(2),
        },
        fab: {
            position: 'absolute',
        },
        settingsPanel: {
            position: 'absolute',
            minWidth: '200px',
        },
    }),
);

/**
 * FAB and settings container panel for Viz tab
 */
export default function SettingsPanel(props: { children?: React.ReactNode }) {
    const classes = useStyles();
    const [open, setOpen] = useState(false);

    return (
        <div className={classes.settingsContainer}>
            <Zoom in={!open} timeout={200}>
                <Tooltip title="Settings">
                    <Fab onClick={() => setOpen(true)} aria-label="settings" color="primary" className={classes.fab}>
                        <Tune />
                    </Fab>
                </Tooltip>
            </Zoom>
            <Grow in={open} timeout={200} style={{ transformOrigin: '0 0 0' }}>
                <Card elevation={5} className={classes.settingsPanel}>
                    <CardContent>
                        <Box display="flex" flexDirection="row" alignItems="center">
                            <Typography variant="h6" style={{ flexGrow: 1 }}>
                                Settings
                            </Typography>
                            <IconButton edge="end" onClick={() => setOpen(false)} aria-label="close">
                                <Close />
                            </IconButton>
                        </Box>
                        {props.children}
                    </CardContent>
                </Card>
            </Grow>
        </div>
    );
}
