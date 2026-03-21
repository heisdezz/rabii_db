/// <reference path="../pb_data/types.d.ts" />
routerAdd(
  "GET",
  "/liked/{id}",
  (e) => {
    const id = e.request.pathValue("id");
    const info = e.requestInfo();
    const user_id = info.auth?.id;
    const gen_id = `${user_id}${id}`;
    try {
      const video = e.app.findRecordById("post_reactions", gen_id);
      if (video) {
        return e.json(200, {
          data: true,
          message: "video Liked",
        });
      }
      return e.json(200, {
        data: false,
        message: "not Liked",
      });
    } catch (err) {
      return e.json(200, {
        data: false,
        message: "video not found",
      });
    }
  },
  $apis.requireAuth(),
);

routerAdd(
  "POST",
  "/like/{id}",
  (e) => {
    const video_id = e.request.pathValue("id");
    const info = e.requestInfo();
    const user_id = info.auth?.id;
    const gen_id = `${user_id}${video_id}`;
    try {
      const pr_col = e.app.findCollectionByNameOrId("post_reactions");
      const new_like = new Record(pr_col);
      new_like.set("id", gen_id);
      new_like.set("like_dislike", 1);
      new_like.set("user", user_id);
      new_like.set("post", video_id);
      e.app.save(new_like);
      return e.json(201, {
        data: gen_id,
        message: "video liked",
      });
    } catch (err) {
      return e.json(500, {
        data: null,
        message: "internal server error",
      });
    }
  },
  $apis.requireAuth(),
);

onRecordAfterCreateSuccess((e) => {
  const number = e.record?.get("like_dislike");
  const post_id = e.record?.get("post");
  if (!post_id) {
    console.log("post_id not found");
    return e.next();
  }

  try {
    const post_record = e.app.findRecordById("posts", post_id);

    if (number == 1) {
      const prev_like = post_record.get("likes_count");
      post_record.set("likes_count", prev_like + 1);
      e.app.save(post_record);
    } else if (number == 0) {
      const prev_dislike = post_record.get("dislikes_count");
      post_record.set("dislikes_count", prev_dislike + 1);
      e.app.save(post_record);
    }
  } catch (err) {
    console.log("failed to update post counts:", err);
  }

  return e.next();
}, "post_reactions");
