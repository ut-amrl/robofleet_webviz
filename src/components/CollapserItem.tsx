import { ListItem, ListItemIcon, ListItemText, Collapse, Divider } from "@material-ui/core";
import React, { useState } from "react";
import { ExpandLess, ExpandMore } from "@material-ui/icons";

/**
 * A ListItem which expands and collapses its children
 */
export default function CollapserItem(props: {icon?: React.ReactNode, children?: React.ReactNode, label: string}) {
  const [open, setOpen] = useState(false);

  return <>
    <ListItem button disableGutters onClick={() => setOpen(open => !open)}>
      {props.icon && <ListItemIcon>
        {props.icon}
      </ListItemIcon>}
      <ListItemText primary={props.label}/>
      {open ? <ExpandLess/> : <ExpandMore/>}
    </ListItem>
    <Collapse in={open} timeout={50}>
      {props.children}
    </Collapse>
    <Divider/>
  </>;
}
