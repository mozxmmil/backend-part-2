// const asynHandler = (fun) =>async (req,res, next)=>{
//     try {
//        await fun(req,res,next);
//     } catch (error) {
//         res.status(err.code ||500).json({
//             sussess:false,
//             message: error.message
//         })
//     }
// }

const asyncHandler = (promiseHandler) => async (req, res, next) => {
  try {
    await Promise.resolve(promiseHandler(req, res, next));
  } catch (error) {
    next(error);
  }
};

export default asyncHandler;
