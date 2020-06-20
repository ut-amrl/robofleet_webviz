import React from "react";
import { Container, Box, Card, CardContent } from "@material-ui/core";
import CompressedImageViewer from "./components/CompressedImageViewer";

export default function ImageryTab(props: {namespace: string}) {
  return <Container maxWidth="md">
    <Box height="2em"/>
    <Card>
      <CardContent>
        <CompressedImageViewer
          namespace={props.namespace}
          topic="stereo/left/image_raw/compressed"
        />
      </CardContent>
    </Card>
  </Container>;
}
