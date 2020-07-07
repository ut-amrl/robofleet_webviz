import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import React, { useState } from 'react';
import CompressedImageViewer from './components/CompressedImageViewer';

export function ImageCard(props: {
  namespace: string;
  topic: string;
  enablePreviews?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const smallWidth = useMediaQuery('(max-width: 800px)');
  const smallHeight = useMediaQuery('(max-height: 600px)');
  const fullScreen = smallWidth || smallHeight;

  const handleOpen = () => {
    setDialogOpen(true);
    if (props.onOpen) props.onOpen();
  };
  const handleClose = () => {
    setDialogOpen(false);
    if (props.onClose) props.onClose();
  };
  const dialog = (
    <Dialog
      maxWidth={false}
      fullScreen={fullScreen}
      onClose={handleClose}
      open={dialogOpen}
    >
      <DialogTitle disableTypography>
        <Typography variant="h6">{props.topic}</Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <CompressedImageViewer
          namespace={props.namespace}
          topic={props.topic}
          enabled={dialogOpen}
        />
      </DialogContent>
    </Dialog>
  );

  const card = (
    <Card style={{ maxWidth: '350px' }}>
      <CardActionArea onClick={handleOpen}>
        <CardContent>
          <CompressedImageViewer
            namespace={props.namespace}
            topic={props.topic}
            enabled={props.enablePreviews ?? false}
          />
          <Typography variant="body2" color="textSecondary" component="p">
            {props.topic}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );

  return (
    <>
      {card}
      {dialog}
    </>
  );
}

export default function ImageryTab(props: { namespace: string }) {
  const [enablePreviews, setEnablePreviews] = useState(true);

  const topics = [
    'stereo/left/image_raw/compressed',
    'stereo/right/image_raw/compressed',
  ];

  const startPreviews = () => setEnablePreviews(true);
  const stopPreviews = () => setEnablePreviews(false);
  return (
    <Container maxWidth="lg">
      <Box height="2em" />
      <Box
        display="flex"
        flexDirection="row"
        flexWrap="wrap"
        justifyContent="space-around"
      >
        {topics.map((topic) => (
          <ImageCard
            namespace={props.namespace}
            topic={topic}
            enablePreviews={enablePreviews}
            onOpen={stopPreviews}
            onClose={startPreviews}
          />
        ))}
      </Box>
    </Container>
  );
}
