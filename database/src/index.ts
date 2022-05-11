import { Config, getStack, StackReference } from "@pulumi/pulumi";
import {RdsInstance} from "./database";
import * as aws from "@pulumi/aws";
import * as random from "@pulumi/random";

const config = new Config();

export const dbUsername = config.require("dbUsername");
export const dbPassword = config.requireSecret("dbPassword");
export const dbName = config.require("dbName");

const finalSnapshotIdentifier = config.get("finalSnapshotIdentifier")
    || new random.RandomString("my-random-string", {
    length: 10,
    special: false,
}).result;

const networkingStack = new StackReference(config.require("networkingStack"))
const dbAppSecurityGroup = new aws.ec2.SecurityGroup("dbAppAccessGroup", {
    vpcId: networkingStack.getOutput("vpcId"),
})

const baseTags = {
    Project: "Pulumi Demo",
    PulumiStack: getStack(),
};

const rds = new RdsInstance("db-instance", {
    description: `${baseTags.Project} DB Instance`,
    baseTags: baseTags,

    subnetIds: networkingStack.getOutput("privateSubnetIds"),

    username: dbUsername,
    password: dbPassword,
    initalDbName: dbName,

    allocatedStorage: 40,
    engineVersion: "8.0.28",
    instanceClass: "db.t4g.medium",
    storageType: "gp2",

    finalSnapshotIdentifier: finalSnapshotIdentifier,

    sendEnhancedLogsToCloudwatch: true,
    monitoringInterval: 10,

    securityGroupIds: [dbAppSecurityGroup.id],
});

export const dbAppSecurityGroupId = dbAppSecurityGroup.id;
export const dbEndpoint = rds.instanceEndpoint();
export const dbPort = rds.instancePort();
export const dbAddress = rds.instanceAddress();
