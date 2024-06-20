const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err));
    }
}


export { asyncHandler }

// const asyncHandler = (fn) => async(req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.staus(error.code || 500).json({
//             success: false,
//             message: error.message
//         })

//         console.log();
//     }
// } ----> this is method2 in which i used try catch andawait async