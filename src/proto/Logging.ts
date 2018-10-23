import {Logger} from "ts-log-debug";

export const LOG = new Logger("loggerName");
LOG.appenders
  .set("std-log", {
    type: "stdout",
    levels: ["debug", "info", "trace"],
    layout: {
      type: "pattern",
      pattern: "%d{ISO8601} WP %p - %m%n"
    }
  })
  .set("error-log", {
    type: "stderr",
    levels: ["fatal", "error", "warn"],
    layout: {
      type: "pattern",
      pattern: "%d{ISO8601} WP %p - %m%n"
    }
  });
  // .set("file-log", {
  //   type: "file",
  //   filename: "logs/notify-flights-booked-js.log",
  //   maxLogSize: 10485760,
  //   layout: {
  //     type: "pattern",
  //     pattern: "%d{ISO8601} NOTIFY %p - %m%n"
  //   }
  // });