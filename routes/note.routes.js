const controller = require("../controllers/note.controllers");

module.exports = (app) => {
  app.route("/note").post(controller.post);
  app.route("/notes/:id").get(controller.getNotesByUser);
  app.route("/public-notes").get(controller.getPublicNotes);
  app
    .route("/note/:id")
    .get(controller.getNoteById)
    .put(controller.put)
    .delete(controller.delete);
};
