const https = require('https')
const aws = require('aws-sdk')
const s3 = new aws.S3({ apiVersion: '2006-03-01' })

exports.handler = async (event: any, context: any) => {
    const bucket = event.Records[0].s3.bucket.name
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))
    const params = {
        Bucket: bucket,
        Key: key
    }

    try {
        const obj = await s3.getObject(params).promise()
        const req = https.request({
            hostname: 'johnsonlee.io',
            port: 443,
            path: '/api/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Length': obj.Body.length,
            }
        }, (res: any) => {
            res.on('data', (data: any) => {
                process.stdout.write(data)
            })
        })
        req.on('error', (error: any) => {
            console.error(error)
        })
        req.write(obj.Body)
        req.end()
        return obj
    } catch (e) {
        console.log(e)
        throw e
    }
}
