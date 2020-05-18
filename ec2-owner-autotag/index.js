const aws = require('aws-sdk')
const ec2 = new aws.EC2()

const handleRunInstances = async (event, userName) => {
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

const handleCreateNatGateway = async (event, userName) => {
  return [event['detail']['responseElements']['CreateNatGatewayResponse']['natGateway']['natGatewayId']]
}

exports.handler = async (event, _) => {
  console.log(JSON.stringify(event))

  const eventHandleMapping = [{
    'RunInstances': handleRunInstances,
    'CreateNatGateway': handleCreateNatGateway
  }]

  const eventName = event['detail']['eventName']
  const userName = event['detail']['userIdentity']['userName']

  let resourceIds = []
  if (eventName === 'RunInstances') {
    resourceIds = await handleRunInstances(event, userName)
  } else if (eventName === 'CreateNatGateway') {
    resourceIds = await handleCreateNatGateway(event, userName)
  }

  await ec2.createTags({
    Resources: resourceIds,
    Tags: [{
      Key: 'Owner',
      Value: userName
    }]
  }).promise()
}