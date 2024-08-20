let aws_keys = {
    dynamodb: {
        region: 'us-east-1',
        credentials:{
            accessKeyId: "",
            secretAccessKey: ""
        }    
    },
    s3: {
        region: 'us-east-1', // se coloca la region del bucket 
        accessKeyId: '',
        secretAccessKey: ''
    }
}
module.exports = aws_keys