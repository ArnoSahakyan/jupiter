const supabase = require("../../supabaseClient");
const db = require("../models");
const { listPosts, listPhotos } = require("../services/posts");

exports.createPost = async (req, res) => {
  const userId = req.userId;
  const { file } = req;
  const content = req.body.content || null;

  let newURL = null;

  // Check if file is provided and process it
  if (file) {
    const filePath = `${userId}/posts/${Date.now()}-${file.originalname}`;

    const { data, error } = await supabase
      .storage
      .from('winku')
      .upload(filePath, file.buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.mimetype,
      });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    newURL = `${process.env.SUPABASE_IMAGE_URL}winku/${data.path}`;
  }

  try {
    // Create a new post
    const post = await db.post.create({
      userId: userId,
      content: content,
      image: newURL
    });

    // Fetch the full post with user details
    const fullPost = await db.post.findByPk(post.dataValues.postId, {
      include: {
        model: db.user,
        attributes: ['fname', 'pfp']
      }
    });

    // Construct the response
    const response = {
      postId: fullPost.postId,
      likeCount: fullPost.likeCount,
      createdAt: fullPost.createdAt,
      fname: fullPost.user.fname,
      pfp: fullPost.user.pfp,
      userId: fullPost.userId,
      content: fullPost.content || null,
      image: fullPost.image || null
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: 'Error creating post' });
  }
}

exports.deletePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.userId;

  try {
    const post = await db.post.findOne({ where: { postId: postId } });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await db.comment.destroy({ where: { postId: postId } });

    const existingImagePath = post.image;

    if (existingImagePath) {
      const existingFilePath = existingImagePath.replace(`${process.env.SUPABASE_IMAGE_URL}winku/`, '');

      const { data: deleteData, error: deleteError } = await supabase
        .storage
        .from('winku')
        .remove([existingFilePath]);

      if (deleteError) {
        console.error('Error deleting existing image:', deleteError.message);
      } else if (!deleteData || deleteData.length === 0) {
        console.error('Failed to delete file. File not found:', existingFilePath);
      }
    }

    await post.destroy();

    res.status(200).json({ message: 'Post deleted successfully', postId: postId });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Error deleting post' });
  }
}

exports.getAllPostsByUser = async (req, res) => {
  try {
    const page = await listPosts({ where: { userId: req.userId }, viewerId: req.userId, limit: req.query.limit, offset: req.query.offset });
    res.status(200).json(page);
  } catch (error) {
    console.error("Error fetching posts by user:", error);
    res.status(500).json({ error: 'Error fetching posts by user' });
  }
};

exports.getNewsfeed = async (req, res) => {
  try {
    // everyone's posts, yours included
    const page = await listPosts({ where: {}, viewerId: req.userId, limit: req.query.limit, offset: req.query.offset });
    res.status(200).json(page);
  } catch (error) {
    console.error("Error fetching newsfeed:", error);
    res.status(500).json({ error: 'Error fetching newsfeed' });
  }
};

exports.getUserPhotos = async (req, res) => {
  try {
    res.status(200).json(await listPhotos({ userId: req.userId, limit: req.query.limit, offset: req.query.offset }));
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({ error: 'Error fetching photos' });
  }
};
