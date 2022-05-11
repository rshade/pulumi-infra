import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks"

const config = new pulumi.Config();
const awsProfileName = config.require("awsProfile")
const networkingStack = new pulumi.StackReference(config.require("networkingStack"))
const databaseStack = new pulumi.StackReference(config.require("databaseStack"))
const vpcPrivateSubnetIds = networkingStack.getOutput("privateSubnetIds")
const vpcPublicSubnetIds = networkingStack.getOutput("publicSubnetIds")

const eksCluster = new eks.Cluster("eksCluster", {
    vpcId: networkingStack.getOutput("vpcId"),
    privateSubnetIds: vpcPrivateSubnetIds,
    publicSubnetIds: vpcPublicSubnetIds,
    instanceType: "t4g.medium",
    providerCredentialOpts: {
        profileName: awsProfileName
    }
})

const kubeDBRule = new aws.ec2.SecurityGroupRule("kubeDBRule", {
    type: "ingress",
    fromPort: 3306,
    toPort: 3306,
    protocol: "tcp",
    sourceSecurityGroupId: eksCluster.nodeSecurityGroup.id,
    securityGroupId: databaseStack.getOutput("dbAppSecurityGroupId"),
});

export const kubeConfig = eksCluster.kubeconfig;