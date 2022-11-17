// noinspection ES6UnusedImports
import testcontainers, {DockerComposeEnvironment} from 'testcontainers';
import http from 'http';
import assert from 'assert';
import {faker} from '@faker-js/faker';

const __dirname = process.env['NODE_PATH'];

const request = (address) => new Promise((resolve, reject) => {
    http.request(address, response => {
        let str = '';

        response.on('data', chunk => str += chunk);
        response.on('end', () => resolve(str));
        response.on('error', e => reject(e));
    }).end();
});

describe('API', function () {
    this.timeout(3 * 60000); // Timeout at 3 minutes

    /** @type {testcontainers.StartedDockerComposeEnvironment} */
    let docker;
    /** @type {string} */
    let dbUsername, dbDatabase;
    /** @type {string} */
    let host, port, protocol;

    before('Generate parameters', () => {
        dbUsername = faker.internet.userName();
        dbDatabase = faker.internet.userName();
    });

    before('Run Docker', async () => {
        docker = await new DockerComposeEnvironment(__dirname, ['docker-compose.yml', 'docker-compose.override.yml'])
            .withEnvironment({
                DB_USERNAME: dbUsername,
                DB_DATABASE: dbDatabase,
                CALDAV_USERNAME: 'radicale',
                CALDAV_PASSWORD: '',
                CALDAV_AB_UUID: '',
            })
            .up();

        const container = docker.getContainer('mic_interface');
        host = container.getHost();
        port = container.getMappedPort(3000).toString();
        protocol = 'http:';
    });

    it('Ping', async () => {
        const r = await request({host, port, protocol, path: '/ping'});
        assert.strictEqual(r, 'pong');
    });

    after('Stop Docker', async () => {
        if (docker != null) await docker.stop();
    });
});
