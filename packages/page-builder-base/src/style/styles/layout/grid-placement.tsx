import { Columns2, Rows2 } from "lucide-react";
import { createGridLineStyle } from "./grid-line";

export const gridColumnStartStyle = createGridLineStyle({
  name: "gridColumnStart",
  label: "builder.pageBuilder.styles.properties.gridColumnStart",
  cssProperty: "grid-column-start",
  icon: Columns2,
});

export const gridColumnEndStyle = createGridLineStyle({
  name: "gridColumnEnd",
  label: "builder.pageBuilder.styles.properties.gridColumnEnd",
  cssProperty: "grid-column-end",
  icon: Columns2,
});

export const gridRowStartStyle = createGridLineStyle({
  name: "gridRowStart",
  label: "builder.pageBuilder.styles.properties.gridRowStart",
  cssProperty: "grid-row-start",
  icon: Rows2,
});

export const gridRowEndStyle = createGridLineStyle({
  name: "gridRowEnd",
  label: "builder.pageBuilder.styles.properties.gridRowEnd",
  cssProperty: "grid-row-end",
  icon: Rows2,
});
