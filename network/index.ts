import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Allocate a new VPC with the default settings:
const vpc = new awsx.ec2.Vpc("rshade", {
    cidrBlock: "10.0.0.0/16",
    numberOfAvailabilityZones: 3,
    subnetSpecs: [
        {
            type: awsx.ec2.SubnetType.Private,
            cidrMask: 24,
        },
        {
            type: awsx.ec2.SubnetType.Public,
            cidrMask: 24,
        },
    ],
});

// Export a few resulting fields to make them easy to use:
export const vpcId = vpc.vpcId;
export const privateSubnetIds = vpc.privateSubnetIds;
export const publicSubnetIds = vpc.publicSubnetIds;