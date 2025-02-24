export class AppGeneralError extends Error{
  constructor(message,statusCode){
    super(message)
    this.message=message
    this.statusCode=statusCode
  }
}


export const asyncHandler=(fn)=>{
  return (req,res,next)=>{
    fn(req,res,next).catch(err=>next(err))
  }
}


export const globalErrorHandling=(err,req,res,next)=>{
    return res.status(err.statusCode||500).json({message:"Error",error:err.message})
}