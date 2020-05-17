const aws = require('aws-sdk')
const ec2 = new aws.EC2()

exports.handler = async (event, _) => {
  console.log(JSON.stringify(event))

  const instanceIds = event['detail']['responseElements']['instancesSet']['items'].map(i => i.instanceId)
  const userName = event['detail']['userIdentity']['userName']

  await ec2.createTags({
    Resources: instanceIds,
    Tags: [{
      Key: 'Owner',
      Value: userName
    }]
  }).promise()
}