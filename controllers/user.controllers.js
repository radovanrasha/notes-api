const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = async (_id) => {
  const token = jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: "72h" });

  return token;
};

exports.loginUser = async (req, res) => {
  try {
    let data = req.body;

    //Validation
    if (!data.password || !data.email) {
      return res.status(400).send("Please add email and password");
    }

    //Does user exist?
    const item = await User.findOne({
      email: data.email,
    });

    if (!item) {
      return res
        .status(400)
        .send("User with this email does not exist. Please signup");
    }

    //User exists, check password
    const passwordIsCorrect = await bcrypt.compare(
      data.password,
      item.password
    );

    ///generate token
    const token = await generateToken(item);

    ///send http-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    const parsedItem = JSON.parse(JSON.stringify(item));

    if (item && passwordIsCorrect && parsedItem) {
      return res.status(200).json({
        item: { ...parsedItem, password: undefined },
        token,
        status: 200,
      });
    } else {
      return res.status(400).json({ message: "Wrong password" });
      // throw new Error("Invalid email or password.");
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
};

exports.registerUser = async (req, res) => {
  try {
    let data = req.body;

    console.log("data", data);

    ///HASH password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    data.password = hashedPassword;

    ///create userItem
    const item = new User({
      ...data,
    });

    ///save user in db
    await item.save();

    console.log("item", item);

    ///generate token
    const token = generateToken(item._id);

    ///send http-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), //1 day
      sameSite: "none",
      secure: true,
    });

    return res.status(200).json({ item, token, res: res.cookie, status: 200 });
  } catch (error) {
    console.log("Error during registration", error);
    return res.status(400).json(error);
  }
};

exports.getById = async (req, res) => {
  try {
    let userId = req.params.id;

    const item = await User.findById({ _id: userId }).populate(
      "followers following"
    );

    // console.log(item);

    res.status(200).json({ item, status: 200 });
  } catch (error) {
    res.status(400).json(error);
    console.log("Error during get of client", error);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const data = req.body;

    ///create userItem
    const item = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        name: data.name,
        phoneNumber: data.phoneNumber,
        role: data.role,
      }
    );

    ///generate token
    const token = generateToken(item._id);

    ///send http-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), //1 day
      sameSite: "none",
      secure: true,
    });

    ///save user in db
    await item.save();

    res.status(200).json({ item, token, res: res.cookie });
  } catch (error) {
    res.status(400).json(error);
    console.log("Error during registration", error);
  }
};

exports.updatePassword = async (req, res) => {
  try {
    //oldPass,newPass
    let data = req.body;

    //Does user exist?
    const user = await User.findById({ _id: req.params.id });

    //User exists, check password
    const passwordIsCorrect = await bcrypt.compare(data.oldPass, user.password);

    if (passwordIsCorrect) {
      ///HASH password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.newPass, salt);

      data.password = hashedPassword;

      const item = await User.findById({ _id: req.params.id });

      item.password = hashedPassword;

      await item.save();
      res.status(200).json({ item, status: 200 });
    } else {
      res.status(400).json({ message: "Wrong old password" });
    }
  } catch (error) {
    res.status(400).json(error);
    console.log("Error during updating password", error);
  }
};

exports.followUser = async (req, res) => {
  try {
    let toFollow = req.params.id;
    let followedBy = req.body.by;

    await User.findByIdAndUpdate(
      { _id: toFollow },
      { $push: { followers: followedBy } }
    );

    await User.findByIdAndUpdate(
      { _id: followedBy },
      { $push: { following: toFollow } }
    );

    res.status(200).json({ message: "Success." });
  } catch (error) {
    res.status(400).json(error);
    console.log("Error during following user", error);
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    let toUnfollow = req.params.id;
    let followedBy = req.body.by;

    await User.findByIdAndUpdate(
      { _id: toUnfollow },
      { $pull: { followers: followedBy } }
    );

    await User.findByIdAndUpdate(
      { _id: followedBy },
      { $pull: { following: toUnfollow } }
    );

    res.status(200).json({ message: "Success." });
  } catch (error) {
    res.status(400).json(error);
    console.log("Error during following user", error);
  }
};

exports.deleteFollower = async (req, res) => {
  try {
    let toDelete = req.params.id;
    let deleteFrom = req.body.by;

    await User.findByIdAndUpdate(
      { _id: deleteFrom },
      { $pull: { followers: toDelete } }
    );

    await User.findByIdAndUpdate(
      { _id: toDelete },
      { $pull: { following: deleteFrom } }
    );

    res.status(200).json({ message: "Success." });
  } catch (error) {
    res.status(400).json(error);
    console.log("Error during following user", error);
  }
};
