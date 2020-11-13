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
import React, { useState, useCallback } from 'react';
import ImageViewer from './components/ImageViewer';
import useRobofleetMsgListener from './hooks/useRobofleetMsgListener';
import { fb } from './schema';
import { matchTopic } from './util';

export function ImageCard(props: {
  namespace: string;
  topic: string;
  image: ImageBitmap;
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
        <ImageViewer image={props.image} enabled={dialogOpen} />
      </DialogContent>
    </Dialog>
  );

  const card = (
    <Card style={{ maxWidth: '350px' }}>
      <CardActionArea onClick={handleOpen}>
        <CardContent>
          <ImageViewer
            image={props.image}
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
  const [observedTopics, setObservedTopics] = useState([] as Array<string>);
  interface ImageMap {
    [topic: string]: ImageBitmap;
  }
  const [observedImages, setObservedImages] = useState({} as ImageMap);

  const compressedImageTopicCallback = useCallback(
    (buf, match) => {
      (async () => {
        const topic = match[0] as string;
        const ci = fb.sensor_msgs.CompressedImage.getRootAsCompressedImage(buf);
        const blob = new Blob([ci.dataArray() ?? new Uint8Array()], {
          type: `image/${ci.format()}`,
        });

        const bmp = await window.createImageBitmap(blob);

        setObservedImages({
          ...observedImages,
          [topic]: bmp,
        });

        if (!observedTopics.includes(topic)) {
          setObservedTopics([...observedTopics, topic]);
        }
      })();
    },
    [observedTopics, observedImages]
  );

  // TODO: Use a standard prefix for image topics so we only need to call this once
  useRobofleetMsgListener(
    matchTopic(props.namespace, 'stereo/(.*)/image_raw/compressed'),
    compressedImageTopicCallback
  );

  const startPreviews = () => setEnablePreviews(true);
  const stopPreviews = () => setEnablePreviews(false);

  let imageContent: Array<JSX.Element> | string;

  if (observedTopics.length > 0) {
    imageContent = observedTopics.map((topic) => (
      <ImageCard
        namespace={props.namespace}
        topic={topic}
        key={topic}
        enablePreviews={enablePreviews}
        image={observedImages[topic]}
        onOpen={stopPreviews}
        onClose={startPreviews}
      />
    ));
  } else {
    imageContent = 'No image topics observed.';
  }

  return (
    <Container maxWidth="lg">
      <Box height="2em" />
      <Box
        display="flex"
        flexDirection="row"
        flexWrap="wrap"
        justifyContent="space-around"
      >
        {imageContent}
      </Box>
    </Container>
  );
}
