/// <reference path="../pb_data/types.d.ts" />

routerAdd(
  "GET",
  "/saved/{gen_id}",
  (e) => {
    //@ts-ignore
    let gen_id = e.request.pathValue("gen_id");
    try {
      const video = $app.findRecordById("saved", gen_id);
      if (video) {
        return e.json(200, {
          data: true,
          message: "video saved",
        });
      }
      return e.json(200, {
        data: false,
        message: "video not found",
      });
    } catch (err) {
      return e.json(200, {
        data: false,
        message: "video not found",
      });
    }
  },
  $apis.requireAuth,
);
