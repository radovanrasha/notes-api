const controller = require("../controllers/user.controllers");

module.exports = (app) => {
  app.route("/register").post(controller.registerUser);

  app.route("/login").post(controller.loginUser);

  app.route("/user/:id").get(controller.getById).put(controller.updateUser);

  app.route("/user-password/:id").put(controller.updatePassword);

  app.route("/follow-user/:id").post(controller.followUser);

  app.route("/unfollow-user/:id").post(controller.unfollowUser);

  app.route("/delete-follower/:id").post(controller.deleteFollower);
};
