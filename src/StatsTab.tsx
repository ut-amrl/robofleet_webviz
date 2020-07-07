import { Box, Card, CardContent, Container } from '@material-ui/core';
import React from 'react';
import OdometryViewer from './components/OdometryViewer';

export default function StatsTab(props: any) {
    return (
        <Container maxWidth="md">
            <Box height="2em" />
            <Card>
                <CardContent>
                    <OdometryViewer {...props} />
                </CardContent>
            </Card>
        </Container>
    );
}
