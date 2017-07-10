# Deployment Variables

Encrypting and decrypting sensitive deployment variables is key to maintaining security.  For now, the system works as follows:

## Shell file

Plain text configuration files should have the following structure:

```
export AWS_ACCOUNT={account_number}
export AWS_REGION={region}
export AWS_ACCESS_KEY_ID={access_key_id}
export AWS_SECRET_ACCESS_KEY={aws_secret_access_key}
```

Save the shell script files __outside__ of the repository filepath, and preferably with the `.sh` filetype.  The filenames of shell scripts should follow the following structure:

```
aws.$CIRCLE_BRANCH.sh
```

Note that the `$CIRCLE_BRANCH` variable is set automatically by Circle CI and corresponds to the repository branch that it is building at execution time.

## Encrypted file

Once the shell script files are ready for deployment (see above) the each file should be encrypted as follow:

```
openssl aes-256-cbc -e -in aws.$CIRCLE_BRANCH.sh -out aws.$CIRCLE_BRANCH.encrypted -k $SIX_SKELETON_KEY
```

Where `$SIX_SKELETON_KEY` is the SixCRM secret key.  The key is extremely sensitive information and should not be shared.

Once the `.encrypted` files are available, place them in the `/deployment/config/` directory.

## Circle CI

Circle CI then requires the `$SIX_SKELETON_KEY` variable value.  This value should be placed in the [environment variables](https://circleci.com/docs/1.0/environment-variables/#setting-environment-variables-for-all-commands-without-adding-them-to-git) section of the project settings.  Circle CI automatically decrypts the encrypted file and adds the variables to all deployment steps using the following command:

```
openssl aes-256-cbc -d -in ./deployment/config/aws.$CIRCLE_BRANCH.encrypted -k $SIX_SKELETON_KEY >> ~/.circlerc
```

## Final thoughts

Note that this system provides variable abstraction -  however, fields and values may always be echoed from within Circle CI deploys.  Fundamentally, this makes the variables insecure and available to all who can modify the codebase and who have access to the build profiles in CircleCI.com.

Limiting access to CircleCI.com may be a good solution to this issue.
