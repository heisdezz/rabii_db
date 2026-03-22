/// <reference path="../pb_data/types.d.ts" />

onRecordAfterCreateError((e) => {
  // e.app
  // e.record
  // e.error
  console.log(e.error, "error occured");
  e.next();
});

onRecordAfterCreateError((e) => {
  console.log(e, "record create error");
  e.next();
});
