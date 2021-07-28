const router = require('express').Router();
const { Post, User } = require('../models');
const Op = require('sequelize').Op;
// import auth middleware

router.get('/', async (req, res) => {
  try {
    const postData = await Post.findAll({
      include: [{ model: User, attributes: ['username'] }],
    });

    const posts = postData.map((post) => post.get({ plain: true }));
    // REMOVE
    console.log('SESSSION', req.session.loggedIn);
    res.render('homepage', { posts, loggedIn: req.session.loggedIn });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/post/:id', async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['username'] }],
    });

    if (!postData) {
      res
        .status(400)
        .send(`<h1>No Post exists with ID: ${req.params.id} </h1>`);
    }

    const otherPostData = await Post.findAll({
      where: {
        user_id: postData.user_id,
        id: {
          [Op.ne]: postData.id,
        },
      },
    });

    const post = postData.get({ plain: true });

    const otherPosts = otherPostData.map((other) =>
      other.get({ plain: true })
    );
    // REMOVE
    console.log(post);
    res.render('postHighlight', {
      post,
      otherPosts,
      loggedIn: req.session.loggedIn,
      userId: req.session.user_id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
/////////////////////////////////////////////////////////////////////////////////////////
router.get('/login', async (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/profile');
    return;
  }

  res.render('login');
});

router.get('/profile', async (req, res) => {
  try {
    const userData = await User.findByPk(req.session.user_id, {
      include: [{ model: Project }],
      attributes: {
        exclude: ['password'],
      },
    });

    const user = await userData.get({ plain: true });
    // REMOVE
    console.log(user);

    res.render('profile', {
      user,
      loggedIn: req.session.loggedIn,
      userId: req.session.user_id,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;