# Deployment Variables

Encrypting and decrypting sensitive deployment variables is key to maintaining security.  For now, the system works as follows:

## The plain-text file:

Plain text configuration files should have the following structure:

```
export AWS_ACCOUNT={account_number}
export AWS_REGION={region}
export AWS_ACCESS_KEY_ID={access_key_id}
export AWS_SECRET_ACCESS_KEY={aws_secret_access_key}
```

Save the plain-text file OUTSIDE of the repository, and preferably with the `.sh` filetypes.  The file name should follow the following structure:

```
aws.$CIRCLE_BRANCH.sh
```

## The encrypted file

Then, once the plain text .sh file is ready for deployment (see above) the file should be encrypted as follow:

```
openssl aes-256-cbc -e -in aws.$CIRCLE_BRANCH.sh -out aws.$CIRCLE_BRANCH.encrypted -k $SIX_SKELETON_KEY
```

Where `$SIX_SKELETON_KEY` is the SixCRM secret key.  This is a extremely sensitive information and should not be shared.

Once the `.encrypted` file is available, place it in the `/deployment/config/` directory.

#Circle CI

Circle CI requires the SIX_SKELETON_KEY variable value.  This value should be placed in the "environment variables" section of the project settings.  Circle CI then automatically decrypts the encrypted file and adds the variables to all deployment steps using the following command:

```
openssl aes-256-cbc -d -in ./deployment/config/aws.$CIRCLE_BRANCH.encrypted -k $SIX_SKELETON_KEY >> ~/.circlerc
```
