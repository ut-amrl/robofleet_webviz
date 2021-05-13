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
  CardMedia,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import React, { useState, useCallback } from 'react';
import ImageViewer from './components/ImageViewer';
import PointCloudViewer from './components/PointCloudViewer';
import useRobofleetMsgListener, {
  RobofleetMsgListener,
} from './hooks/useRobofleetMsgListener';
import { matchTopic } from './util';

enum ImageType {
  CompressedImage,
  PointCloud2,
}

export function ImageCard(props: {
  enabled: boolean;
  namespace: string;
  topic: string;
  data: flatbuffers.ByteBuffer;
  type: ImageType;
  enablePreviews?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}) {
  const { enabled } = props;
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
  let imageViewerContent: (
    enabled: boolean,
    large: boolean
  ) => JSX.Element | undefined;

  if (props.type === ImageType.CompressedImage) {
    imageViewerContent = (enabled: boolean) => (
      <ImageViewer data={props.data} enabled={enabled} />
    );
  } else if (props.type === ImageType.PointCloud2) {
    imageViewerContent = (enabled: boolean, large: boolean) => (
      <PointCloudViewer
        data={props.data}
        enabled={enabled}
        point_skip_ratio={1}
        point_cloud_scale={30}
        max_intensity={100.0}
        large={large}
      />
    );
  } else {
    throw Error(`Invalid type ${props.type}`);
  }

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
        {imageViewerContent(enabled && dialogOpen, true)}
      </DialogContent>
    </Dialog>
  );

  const card = (
    <Card style={{ minWidth: '350px' }}>
      <CardActionArea onClick={handleOpen}>
        <CardMedia>
          {imageViewerContent(
            enabled && (props.enablePreviews ?? false),
            false
          )}
        </CardMedia>
        <CardContent>
          <Typography variant="body2" component="p">
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

export default function ImageryTab(props: {
  enabled: boolean;
  namespace: string;
}) {
  const { enabled } = props;
  const [enablePreviews, setEnablePreviews] = useState(true);
  interface ImageMap {
    [topic: string]: {
      type: ImageType;
      data: flatbuffers.ByteBuffer;
    };
  }
  const [observedImages, setObservedImages] = useState<ImageMap>({});

  const compressedImageTopicCallback: RobofleetMsgListener = useCallback(
    (buf, match) => {
      (async () => {
        const topic = match[1];

        setObservedImages({
          [topic]: {
            type: ImageType.CompressedImage,
            data: buf,
          },
          ...observedImages,
        });
      })();
    },
    [observedImages]
  );

  const pointcloudTopicCallback: RobofleetMsgListener = useCallback(
    (buf, match) => {
      (async () => {
        const topic = match[1];

        setObservedImages({
          ...observedImages,
          [topic]: {
            type: ImageType.PointCloud2,
            data: buf,
          },
        });
      })();
    },
    [observedImages]
  );

  useRobofleetMsgListener(
    matchTopic(props.namespace, '(image_compressed/.+)'),
    compressedImageTopicCallback
  );

  useRobofleetMsgListener(
    matchTopic(props.namespace, '(pointcloud)'),
    pointcloudTopicCallback
  );

  const startPreviews = () => setEnablePreviews(true);
  const stopPreviews = () => setEnablePreviews(false);

  let imageContent: Array<JSX.Element> | string;

  if (Object.keys(observedImages).length > 0) {
    imageContent = Array.from(Object.keys(observedImages))
      .sort()
      .map((topic) => {
        const { type, data } = observedImages[topic];
        return (
          <Box
            key={topic}
            flexBasis={0}
            flexGrow={1}
            flexShrink={1}
            padding="8px"
          >
            <ImageCard
              enabled={enabled}
              namespace={props.namespace}
              topic={topic}
              enablePreviews={enablePreviews}
              data={data}
              type={type}
              onOpen={stopPreviews}
              onClose={startPreviews}
            />
          </Box>
        );
      });
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
        alignItems="start"
      >
        {imageContent}
      </Box>
    </Container>
  );
}
