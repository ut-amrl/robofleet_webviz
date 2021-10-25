import {
  Box,
  Card,
  CardContent,
  Container,
  Button,
  Select,
  MenuItem,
  FormGroup,
  FormLabel,
  TextField,
} from '@material-ui/core';
import React, { useState, useContext } from 'react';
import WebSocketContext from './contexts/WebSocketContext';
import { fb } from './schema_generated';
import { flatbuffers } from 'flatbuffers';

const severityLevels = [
  { name: 'INFO', value: 0 },
  { name: 'SUBOPTIMAL', value: 1 },
  { name: 'RISKY', value: 2 },
  { name: 'CATASTROPHIC', value: 3 },
];

const subsystems = [
  { name: 'OTHER', value: 0 },
  { name: 'LOCALIZATION', value: 1 },
  { name: 'NAVIGATION_PERCEPTION', value: 2 },
  { name: 'NAVIGATION_LOCAL_PLANNING', value: 3 },
  { name: 'NAVIGATION_GLOBAL_PLANNING', value: 4 },
];

function createErrorReportMsg({
  namespace,
  topic,
  frame,
  laser_frame,
  timestamp,
  details,
  severityLevel,
  failedSubsystem,
}: {
  namespace: string;
  frame: string;
  laser_frame: string;
  topic: string;
  timestamp: number;
  details: string;
  severityLevel: number;
  failedSubsystem: number;
}) {
  const fbb = new flatbuffers.Builder();

  const metadataOffset = fb.MsgMetadata.createMsgMetadata(
    fbb,
    fbb.createString('amrl_msgs/ErrorReport'),
    fbb.createString(`${namespace}/${topic}`)
  );

  const frameOffset = fbb.createString(frame);

  fb.std_msgs.Header.startHeader(fbb);
  fb.std_msgs.Header.addStamp(
    fbb,
    fb.RosTime.createRosTime(fbb, Math.floor(timestamp / 1000), timestamp * 1e6)
  );

  fb.std_msgs.Header.addFrameId(fbb, frameOffset);
  const headerOffset = fb.std_msgs.Header.endHeader(fbb);

  const laserFrameOffset = fbb.createString(laser_frame);

  fb.std_msgs.Header.startHeader(fbb);
  fb.std_msgs.Header.addStamp(
    fbb,
    fb.RosTime.createRosTime(fbb, Math.floor(timestamp / 1000), timestamp * 1e6)
  );

  fb.std_msgs.Header.addFrameId(fbb, laserFrameOffset);
  const laserHeaderOffset = fb.std_msgs.Header.endHeader(fbb);

  const detailsOffset = fbb.createString(details);

  fb.amrl_msgs.ErrorReport.startErrorReport(fbb);
  fb.amrl_msgs.ErrorReport.add_Metadata(fbb, metadataOffset);
  fb.amrl_msgs.ErrorReport.addHeader(fbb, headerOffset);
  fb.amrl_msgs.ErrorReport.addLaserHeader(fbb, laserHeaderOffset);
  fb.amrl_msgs.ErrorReport.addDetailedErrorMsg(fbb, detailsOffset);
  fb.amrl_msgs.ErrorReport.addFailedSubsystem(fbb, failedSubsystem);
  fb.amrl_msgs.ErrorReport.addSeverityLevel(fbb, severityLevel);
  const errorOffset = fb.amrl_msgs.ErrorReport.endErrorReport(fbb);

  fbb.finish(errorOffset);
  return fbb.asUint8Array();
}

export default function ReportTab(props: {
  namespace: string;
  enabled: boolean;
}) {
  const ws = useContext(WebSocketContext);

  const [reporting, setReporting] = useState(false);
  const [reportingTimestamp, setReportingTimestamp] = useState(Date.now());
  const [severityLevel, setSeverityLevel] = useState(severityLevels[0].name);
  const [subsystem, setSubsystem] = useState(subsystems[0].name);
  const [errorDetails, setErrorDetails] = useState<string>('');

  const resetForm = () => {
    setSeverityLevel(severityLevels[0].name);
    setSubsystem(subsystems[0].name);
    setReporting(false);
  };

  const handleReportSubmission = () => {
    if (ws?.connected) {
      ws.ws?.send(
        createErrorReportMsg({
          namespace: props.namespace,
          topic: 'error_report',
          frame: 'map',
          laser_frame: 'velodyne',
          timestamp: reportingTimestamp,
          details: errorDetails,
          severityLevel:
            severityLevels.find((l) => l.name === severityLevel)?.value || 0,
          failedSubsystem:
            subsystems.find((l) => l.name === subsystem)?.value || 0,
        })
      );

      resetForm();
    }
  };

  let reportingContent;

  if (!reporting) {
    reportingContent = (
      <Button
        onClick={() => {
          setReportingTimestamp(Date.now());
          setReporting(true);
        }}
        variant="contained"
      >
        Create New Report
      </Button>
    );
  } else {
    reportingContent = (
      <FormGroup style={{ margin: '10px' }}>
        <TextField
          label="Report Details"
          multiline
          id="error-msg"
          variant="outlined"
          style={{ margin: '5px', padding: '5px' }}
          defaultValue={errorDetails}
          onChange={(e) => setErrorDetails(e.target.value as string)}
        />
        <Box display="flex" margin="10px">
          <FormLabel>Severity Level:</FormLabel>
          <Box flexGrow="1" />
          <Select
            value={severityLevel}
            onChange={(event) => setSeverityLevel(event.target.value as string)}
            autoWidth={true}
          >
            {severityLevels.map((option) => (
              <MenuItem value={option.name} key={option.name}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box display="flex" margin="10px">
          <FormLabel>Subsystem:</FormLabel>
          <Box flexGrow="1" />
          <Select
            value={subsystem}
            onChange={(event) => setSubsystem(event.target.value as string)}
            autoWidth={true}
          >
            {subsystems.map((option) => (
              <MenuItem value={option.name} key={option.name}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box display="flex" margin="10px">
          <Button variant="contained" onClick={handleReportSubmission}>
            Submit
          </Button>
          <Box flexGrow="1" />
          <Button variant="outlined" onClick={resetForm}>
            Cancel
          </Button>
        </Box>
      </FormGroup>
    );
  }

  return (
    <Container maxWidth="md">
      <Box height="4em" />
      <Card>
        <CardContent>{reportingContent}</CardContent>
      </Card>
    </Container>
  );
}
