const aws = require('aws-sdk')
const ec2 = new aws.EC2()

const handleRunInstances = async event => {
  const getInstancesVolumes =  async instanceIds => {
    const result = await ec2.describeVolumes({
      Filters: [{
        Name: 'attachment.instance-id',
        Values: instanceIds
      }]
    }).promise()
  
    return result.Volumes.map(v => v.VolumeId)
  }

  const instanceIds = event['detail']['responseElements']['instancesSet']['items'].map(i => i.instanceId)
  const volumeIds = await getInstancesVolumes(instanceIds)

  return [...instanceIds, ...volumeIds]
}

const handleCreateNatGateway = async event => {
  return event['detail']['responseElements']['CreateNatGatewayResponse']['natGateway']['natGatewayId']
}

const handleCreateSnapshot = async event => {
  return event['detail']['responseElements']['snapshotId']
}

const handleCreateImage = async event => {
  return event['detail']['responseElements']['imageId']
}

exports.handler = async (event, _) => {
  console.log(JSON.stringify(event))

  const eventName = event['detail']['eventName']
  const userName = event['detail']['userIdentity']['userName']

  let resourceIds = []
  if (eventName === 'RunInstances') {
    resourceIds = [await handleRunInstances(event)]
  } else if (eventName === 'CreateNatGateway') {
    resourceIds = [await handleCreateNatGateway(event)]
  } else if (event === 'CreateSnapshot') {
    resourceIds = [await handleCreateSnapshot(event)]
  } else if (event == 'CreateImage') {
    resourceIds = [await handleCreateImage(event)]
  }

  await ec2.createTags({
    Resources: resourceIds,
    Tags: [{
      Key: 'Owner',
      Value: userName
    }]
  }).promise()
}