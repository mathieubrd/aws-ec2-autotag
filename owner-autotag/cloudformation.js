const aws = require('aws-sdk')
const cloudformation = new aws.CloudFormation()

exports.handler = async (event, _) => {
  console.log(JSON.stringify(event))

  const userName = event['detail']['userIdentity']['userName']
  const stackName = event['detail']['requestParameters']['stackName']

  await cloudformation.updateStack({
    StackName: stackName,
    UsePreviousTemplate: true,
    Tags: [{
      Key: 'Owner',
      Value: userName
    }]
  }).promise()
}