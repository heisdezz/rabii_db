/// <reference path="../pb_data/types.d.ts" />

onRecordAfterCreateSuccess((e) => {
  const record = e.record;
  const record_id = record?.id;

  try {
    //@ts-ignore
    const like_record = e.app.findRecordById("likes", record_id);

    if (like_record) {
      return e.next();
    }
    const collection = e.app.findCachedCollectionByNameOrId("likes");
    const new_record = new Record(collection);
    new_record.set("video_id", record_id);
    new_record.set("id", record_id);
    e.app.save(new_record);
    e.next();
  } catch (error) {
    console.log(error);
  }
}, "videos");

onRecordViewRequest((e) => {
  const record = e.record;
  const record_id = record?.id;
  try {
    try {
      //@ts-ignore
      const like_record = e.app.findRecordById("likes", record_id);
      return e.next();
    } catch (err) {
      const collection = e.app.findCachedCollectionByNameOrId("likes");
      const new_record = new Record(collection);
      new_record.set("video", record_id);
      new_record.set("id", record_id);
      console.log("trying", record_id, JSON.stringify(new_record));

      e.app.save(new_record);
      e.next();
    }
  } catch (error) {
    console.log(error);
    e.next();
  }
}, "videos");
