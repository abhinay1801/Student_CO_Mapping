const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateUser = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if(!token)
  {
    return res.status(401).json({message:'Authorization token required'});
  }

  try
  {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if(!user)
    {
      return res.status(401).json({message:'Invalid token'});
    }

    req.user = user;
    next();
  }
  catch(error)
  {
    return res.status(401).json({message:'Authentication failed'});
  }
};

module.exports = authenticateUser;
