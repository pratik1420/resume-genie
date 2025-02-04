const userModel = require('./../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const otpGenerator = require('otp-generator');

dotenv.config({ path: './config.env' });

async function verifyUser(req, res, next) {
  try {
    const { email } = req.method == 'GET' ? req.query : req.body;

    // check the user existance
    let exist = await userModel.findOne({ email });
    if (!exist) return res.status(404).send({ error: "Can't find User!" });
    next();
  } catch (error) {
    return res.status(510).send({ error: 'Authentication Error' });
  }
}

/** POST: http://localhost:8000/api/register
 * @param: {
 * "email": "example@gmail.com",
 * "password": "admin@123",
 * "name": "Gautam Raj",
 * }
 */
async function register(req, res) {
  try {
    const { username, password, email } = req.body;

    let existUsername;
    try {
      existUsername = await userModel.findOne({ username });
    } catch (err) {
      return res.status(409).send({
        error: 'Username already Exist',
      });
    }

    let existEmail;
    try {
      existEmail = await userModel.findOne({ email });
    } catch (err) {
      return res.status(409).send({
        error: 'Email already Exist',
      });
    }

    Promise.all([existUsername, existEmail])
      .then(() => {
        if (password) {
          bcrypt
            .hash(password, 10)
            .then((hashedPassword) => {
              const user = new userModel({
                username,
                password: hashedPassword,
                email,
              });

              // return save result as a response
              user
                .save()
                .then((result) =>
                  res.status(201).send({ msg: 'User Register Successfully' })
                )
                .catch((error) => res.status(500).send(error.message));
            })
            .catch((error) => {
              return res.status(500).send({
                error: error.message,
              });
            });
        }
      })
      .catch((error) => {
        return res.status(500).send(error.message);
      });
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

/** POST: http://localhost:8000/api/login
 * @param: {
 * "email": "example@gmail.com",
 * "password": "admin@123",
 * }
 */
async function login(req, res) {
  const { email, password } = req.body;

  try {
    userModel
      .findOne({ email })
      .then((user) => {
        bcrypt
          .compare(password, user.password)
          .then((passwordCheck) => {
            if (!passwordCheck)
              return res.status(401).send({ error: 'Invalid Credentials' });

            const token = jwt.sign(
              {
                userId: user._id,
                email: user.email,
              },
              process.env.JWT_SECRET,
              { expiresIn: '24h' }
            );

            return res.status(200).send({
              msg: 'Login Successful...!',
              email: user.email,
              username: user.username,
              token,
            });
          })
          .catch((error) => {
            return res.status(400).send({ error: 'Invalid Credentials' });
          });
      })
      .catch((error) => {
        return res.status(404).send({ error: 'User not found' });
      });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
}

// GET: http://localhost:8000/api/user/admin123
async function getUser(req, res) {
  const { username } = req.params;

  try {
    if (!username) return res.status(501).send({ error: 'Invalid Username' });

    let user;
    try {
      user = await userModel.findOne({ username });

      const { password, ...rest } = Object.assign({}, user.toJSON());

      return res.status(201).send(rest);
    } catch (err) {
      return res.status(501).send({ error: "Couldn't Find the User" });
    }
  } catch (error) {
    return res.status(404).send({ error: 'Cannot Find User Data' });
  }
}

// GET: http://localhost:8000/api/generateOTP
async function generateOTP(req, res) {
  req.app.locals.OTP = await otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  const user = await userModel.findOne(req.query);

  res.status(201).send({ code: req.app.locals.OTP, username: user.username });
}

// GET: http://localhost:8000/api/verifyOTP
async function verifyOTP(req, res) {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null;
    req.app.locals.resetSession = true;
    return res.status(201).send({ msg: 'Verify Successsfully!' });
  }
  return res.status(400).send({ error: 'Invalid OTP' });
}

// Successfully redirect the user when OTP is valid
// GET: http://localhost:8000/api/createResetSession
async function createResetSession(req, res) {
  if (req.app.locals.resetSession) {
    return res.status(201).send({ flag: req.app.locals.resetSession });
  }
  return res.status(440).send({ error: 'Session expired!' });
}

/** PUT: http://localhost:8000/api/updateUser
 * @param: {
 * "email": "example@gmail.com",
 * "password": "admin@123",
 * "name": "Gautam Raj"
 * }
 */
async function updateUser(req, res) {
  try {
    const { userId } = req.user;

    if (userId) {
      const body = req.body;

      let update;
      try {
        update = await userModel.findOneAndUpdate({ _id: userId }, body);
        return res.status(201).send({ msg: 'Record Updated...!' });
      } catch (err) {
        throw err;
      }
    } else {
      return res.status(401).send({ error: 'User Not Found...!' });
    }
  } catch (error) {
    return res.status(401).send(error.message);
  }
}

/** PUT: http://localhost:8000/api/resetPassword */
async function resetPassword(req, res) {
  try {
    if (!req.app.locals.resetSession)
      return res.status(440).send({ error: 'Session expired!' });

    const { email, password } = req.body;

    try {
      userModel
        .findOne({ email })
        .then((user) => {
          bcrypt
            .hash(password, 10)
            .then(async (hashedPassword) => {
              try {
                await userModel.updateOne(
                  { email: user.email },
                  { password: hashedPassword }
                );

                req.app.locals.resetSession = false;
                return res.status(201).send({ msg: 'Record Updated...!' });
              } catch (err) {
                throw err;
              }
            })
            .catch((e) => {
              return res.status(500).send({
                error: 'Enable to hashed password',
              });
            });
        })
        .catch((error) => {
          return res.status(404).send({ error: 'Email not Found' });
        });
    } catch (error) {
      return res.status(500).send(error.message);
    }
  } catch (error) {
    return res.status(401).send(error.message);
  }
}

module.exports = {
  verifyUser,
  register,
  login,
  getUser,
  generateOTP,
  verifyOTP,
  createResetSession,
  updateUser,
  resetPassword,
};
