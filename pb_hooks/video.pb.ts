/// <reference path="../pb_data/types.d.ts" />

// onRecordEnrich((e) => {
//   console.log("enriching", e.record?.id);
//   e.next();
// }, "videos");

onRecordCreateRequest((e) => {
  console.log("requesting create videos");
  const body = e.requestInfo().body;
  const tags = body?.tags;
  console.log(tags);
  if (tags?.length) {
    const tags_col = e.app.findCachedCollectionByNameOrId("tags");
    //@ts-ignore
    const tag_ids = tags.map((tag) => {
      const normalized_tag = tag.trim().toLowerCase();
      try {
        const existing = e.app.findFirstRecordByData(
          "tags",
          `name`,
          normalized_tag,
        );
        return existing.id;
      } catch (_) {
        const new_tag = new Record(tags_col);
        new_tag.set("name", normalized_tag);
        e.app.save(new_tag);
        return new_tag.id;
      }
    });
    console.log(tag_ids);
    e.record?.set("tags", tag_ids);
  }
  e.next();
}, "videos");

onRecordAfterCreateSuccess((e) => {
  const record = e.record;
  const record_id = record?.id;
  console.log("success");
  try {
    try {
      //@ts-ignore
      const like_record = e.app.findRecordById("likes", record_id);
      e.next();
    } catch (_) {
      const collection = e.app.findCachedCollectionByNameOrId("likes");
      const new_record = new Record(collection);
      new_record.set("video", record_id);
      new_record.set("id", record_id);
      e.app.save(new_record);
      e.next();
    }
  } catch (error) {
    console.log(error, "creating likes_record on create");
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
    console.log(error, "creating likes_record on view");
    e.next();
  }
}, "videos");
