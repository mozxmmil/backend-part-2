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

export const asynHandler = (pormisehandler) => async (req, res, next) => {
  
    Promise.resolve(pormisehandler(req, res, next))
    .catch((error) => next(error));
};
