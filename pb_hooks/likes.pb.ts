/// <reference path="../pb_data/types.d.ts" />
routerAdd(
  "GET",
  "/liked/${id}",
  (e) => {
    //@ts-ignore
    let gen_id = e.request.pathValue("gen_id");
    try {
      const video = $app.findRecordById("post_reactions", gen_id);
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
  "/like/${id}",
  (e) => {
    //@ts-ignore
    //
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
      e.next();
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
