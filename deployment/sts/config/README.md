In target account:
1.  Create new role
  - Name:  SixCRMDeployment
  - AccountID: 181111172466
  - External ID: {provided}
2. Create Permissions file
3. Associate the permissions file with the Role
4.  In the SixCRM Production deployment group add the following

`{
  "Version": "2012-10-17",
  "Statement": {
    "Effect": "Allow",
    "Action": "sts:AssumeRole",
    "Resource": "arn:aws:iam::*:role/SixCRMDeployment"
  }
}`
