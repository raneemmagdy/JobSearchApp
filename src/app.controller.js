import cors from 'cors'
import path from 'path'
import checkDBConnection from './DB/connectionDB.js'
import userRouter from './modules/user/user.controller.js'
import { AppGeneralError, globalErrorHandling } from './utils/index.js'
import {rateLimit} from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'
import { createHandler } from 'graphql-http/lib/use/express';
import { schema } from './modules/graphQlSchema.js'
import expressPlayground from 'graphql-playground-middleware-express'
import deleteExpiredOtps from './utils/CronJobs/deleteExpiredOtps.js'
import companyRouter from './modules/company/company.controller.js'
import adminRouter from './modules/admin/admin.controller.js'
import jobRouter from './modules/job/job.controller.js'
import applicationRouter from './modules/application/application.controller.js'

const limiter=rateLimit({
    limit:5,
    windowMs:60*1000,
    handler:(req,res,next)=>{
        return next(new AppGeneralError('Too many requests. Please slow down and try again later.',429))
    }

})
const bootstrap=(app,express)=>{
    app.use(morgan('dev'))
    app.use(helmet())
    app.use(cors())
    app.use(limiter)
    app.use('/uploads',express.static(path.resolve('uploads')))

    app.use(express.json())
    deleteExpiredOtps()
    checkDBConnection()
    app.use('/applications',applicationRouter)
    app.use('/users',userRouter)
    app.use('/companies',companyRouter)
    app.use('/admin',adminRouter)
    app.use('/jobs',jobRouter)





   app.use('/graphql',createHandler({schema:schema}))
   app.get('/playground', expressPlayground.default({ endpoint: '/graphql' }))

    app.get('/',(req,res,next)=>{
        return res.status(200).json({message:"Welcome To My Job Search App ❤️"})
    })
    app.use('*',(req,res,next)=>{
        return next(new Error('Page Not Found 404 !',{cause:404}))
    })
    app.use(globalErrorHandling)


}
export default bootstrap