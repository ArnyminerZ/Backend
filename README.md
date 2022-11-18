# MiC Manager

[![Building][build-badge]][build-url]
[![CodeQL Analysis][codeql-badge-url]][codeql-url]
[![Documentation][docs-badge-url]][docs-url]

[![Docker Hub Version][docker-badge-url]][docker-hub-url]

![package.json version][package-version-badge]
![Last pre-release][prerelease-badge]
![Last release][release-badge]

## Environment variables

There are some environment variables which are required for the server to work. Those are:

### `DB_USERNAME`

**Required**. The username to use for connecting to the database.

### `DB_PASSWORD`

**Required**. The password for the given username.

### `DB_HOSTNAME`

**Required**. The server address for the database.

### `DB_DATABASE`

**Required**. The name of the database to use. `DB_USERNAME` must be granted to modify and access it.

### `CALDAV_HOSTNAME`

**Required**. The server address for the CalDAV server.

### `CALDAV_USERNAME`

**Required**. The username to use for signing in to the CalDAV server.

### `CALDAV_PASSWORD`

**Required**. The password to use with `CALDAV_USERNAME`.

### `CALDAV_AB_URL`

**Required**. The url of the address book to use.

### `CALDAV_DISPLAY_NAME`

Default: `MiC-Manager`. The display name for the DAV collection if it doesn't exist.

### `DEBUG`

Default: `false`. If `true`, debug mode will be enabled, and errors will give a deeper output.

# User information

By default, MiC Manager doesn't support storing any users' information. For this, a WebDAV server must be used.
We recommend [Radicale](https://radicale.org).

# Docker configuration

We provide you a docker compose file ([`docker-compose.yml`](./docker-compose.yml)) that is almost ready to go, with all
the necessary containers configured. However, there are some extra options you must set.

Just as a note, the Radicale users match the server's registered users. You might want to create a specific user for
this purpose.

## Secrets

We need some secret keys and files for the system to work. You can define them with the following commands.

```shell
# Create the required directories
mkdir -p secrets
mkdir -p keys

# Replace {password} with the password to use for the database user.
echo "{password}" > secrets/password.txt

# Replace {password} with the password to use for identifying as {username}. Choose wisely.
echo "{root-password}" > secrets/root-password.txt

# Generate the server's private key.
openssl rand -base64 756 > ./secrets/private.key

# Generate the encryption certificates
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout keys/key.pem -out keys/cert.pem
```

**Warning!** Losing the server's private key will mean all the user's data will be voided and encrypted forever.

Note that it's required to have swarm mode enabled. You can do so with:

```shell
docker swarm init
```

## Setting `CALDAV_AB_URL`

To know which url to set. First access the web interface for Radicale. Eg: http://localhost:5232/.web/.

Then, log in, and choose one of the options provided, either creating an empty address book, or import an existing one.
![Creation options](./docs/RadicaleCreation.png)

# Migration
## GesTro
MiC Manager provides the option to migrate all the data from GesTro. There's a script at `/migrations` called
`gestro.js` that has all the tools necessary. To run, first install all the dependencies:

```shell
yarn install
```

And now run the script. Replace all the fields accordingly.

```shell
yarn run migrate-gestro HOSTNAME={hostname} PORT=1433 DATABASE=GesTro SCHEMA=dbo USERNAME={username} PASSWORD={password} INSTANCE={mic-instance}
```

*Note: The given MiC instance must contain the protocol (e.g. https://...) and be without a trailing `/`*

---

[codeql-badge-url]: https://img.shields.io/github/workflow/status/ArnyminerZ/MiC-Manager/CodeQL?label=CodeQL&style=for-the-badge&logo=github

[codeql-url]:https://github.com/ArnyminerZ/MiC-Manager/security/code-scanning

[docker-badge-url]: https://img.shields.io/docker/v/arnyminerz/mic_manager?style=for-the-badge&logo=docker

[docker-hub-url]: https://hub.docker.com/repository/docker/arnyminerz/mic_manager

[package-version-badge]: https://img.shields.io/github/package-json/v/ArnyminerZ/MiC-Manager?label=Dev%20Version&logo=github&style=for-the-badge

[prerelease-badge]: https://img.shields.io/github/v/release/ArnyminerZ/MiC-Manager?include_prereleases&label=Last%20Pre-Release&logo=github&style=for-the-badge

[release-badge]: https://img.shields.io/github/v/release/ArnyminerZ/MiC-Manager?label=Last%20Release&logo=github&style=for-the-badge

[releases-url]: https://github.com/ArnyminerZ/MiC-Manager/releases

[build-badge]: https://img.shields.io/github/workflow/status/ArnyminerZ/MiC-Manager/docker-ci?style=for-the-badge

[build-url]: https://github.com/ArnyminerZ/MiC-Manager/actions/workflows/docker-ci.yml

[docs-url]: http://arnaumora.me/MiC-Manager/

[docs-badge-url]: https://img.shields.io/github/workflow/status/Arnyminerz/MiC-Manager/Deploy%20static%20content%20to%20Pages?label=Documentation&style=for-the-badge&logo=swagger
