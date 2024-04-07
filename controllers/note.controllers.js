const Note = require("../models/note.model");

exports.post = async (req, res) => {
  try {
    let data = req.body;

    const item = new Note({
      ...data,
    });

    ///save Note in db
    await item.save();

    res.status(200).json({ item, status: 200 });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

exports.put = async (req, res) => {
  try {
    const data = req.body;

    ///update
    const item = await Note.findOneAndUpdate(
      { _id: req.params.id },
      {
        ...data,
      }
    );

    ///save changes
    await item.save();

    res.status(200).json({ item });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

exports.getNoteById = async (req, res) => {
  try {
    let id = req.params.id;

    const item = await Note.findById({ _id: id }).populate("createdBy");

    // console.log(item);

    res.status(200).json({ item, status: 200 });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

exports.getNotesByUser = async (req, res) => {
  try {
    let id = req.params.id;

    const items = await Note.find({ createdBy: id });

    res.status(200).json({ items, status: 200 });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

exports.getPublicNotes = async (req, res) => {
  try {
    const items = await Note.find({ isPublic: true }).populate("createdBy");

    res.status(200).json({ items, status: 200 });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Note.findById(id);

    await item.remove();

    return res.status(200).json({ message: "Deleted." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
