import express from 'express';
import dotenv from 'dotenv';
import reqIp from 'request-ip';
import fs from 'fs';

import {errorResponse, successResponse} from './src/response.js';
import {check as dbCheck} from './src/database.js';
import {changePassword, login} from "./src/auth.js";
import {InvalidTokenException, PasswordlessUserException, WrongPasswordException} from './src/exceptions.js';
import {checkToken, decodeToken} from "./src/security.js";
import {getUserData} from "./src/data.js";

dotenv.config();

/**
 * The port number used for listening for http requests.
 * @type {number}
 */
const HTTP_PORT = process.env.HTTP_PORT ?? 3000;

if (!fs.existsSync('private.key'))
    throw Error('❌ TOKEN_KEY is required and not defined.');

console.info(`⏺️ Checking database...`);
if (!(await dbCheck())) {
    console.error(`❌  Could not connect to database. Host: ${process.env.DB_HOSTNAME}`)
    process.exitCode = 1;
} else
    console.info(`✅ Database connected.`);

if (process.exitCode === 1)
    throw Error('Could not initialize the server. Errors have occurred.');

const app = express();

// Middleware
app.use(reqIp.mw());
app.use(express.json({strict: false}));
app.use(express.urlencoded())

app.get('/v1/user/auth', async (req, res) => {
    // const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    const query = req.query;
    /**
     * @type {string|null}
     */
    const dni = query['dni'];
    /**
     * @type {string|null}
     */
    const password = query['password'];

    if (dni == null || password == null)
        return res.status(400).json(errorResponse('missing-parameters'));
    try {
        const token = await login(dni, password, req.clientIp);
        res.status(200).json(successResponse({token}));
    } catch (e) {
        if (e instanceof PasswordlessUserException)
            res.status(417).json(errorResponse('passwordless'));
        else if (e instanceof WrongPasswordException)
            res.status(403).json(errorResponse('wrong-credentials'));
        else {
            console.error('❌ Could not authenticate. Error:', e);
            res.status(500).json({success: false, error: 'unknown', errorData: e});
        }
    }
});
app.get('/v1/user/data', async (req, res) => {
    /**
     * @type {string|null}
     */
    const apiKey = req.get('API-Key');
    if (apiKey == null || !(await checkToken(apiKey)))
        return res.status(406).send(errorResponse('invalid-key'));
    const tokenData = await decodeToken(apiKey);
    if (!tokenData.hasOwnProperty('socioId'))
        return res.status(400).send(errorResponse('invalid-key'));
    const socioId = tokenData['socioId'];
    const userData = await getUserData(socioId);
    res.json(successResponse(userData));
});
app.post('/v1/user/change_password', async (req, res) => {
    const body = req.body;
    /**
     * @type {string|null}
     */
    const dni = body['dni'];
    /**
     * @type {string|null}
     */
    const password = body['password'];
    /**
     * @type {string|null}
     */
    const apiKey = req.get('API-Key');

    if (dni == null || password == null)
        return res.status(400).json(errorResponse('missing-parameters'));
    try {
        await changePassword(dni, password, apiKey);
        res.status(200).json(successResponse());
    } catch (e) {
        if (e instanceof InvalidTokenException)
            res.status(406).json(errorResponse('invalid-key'));
        else
            res.status(500).json({error: 'work in progress'})
    }
});

app.listen(HTTP_PORT, () => console.info(`🖥️ Listening for requests on http://localhost:${HTTP_PORT}`));
