// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const express = require('express');

global.fetch = require('node-fetch');

const host = process.env.NODE_HOST || 'localhost';
const port = process.env.PORT || 4000;

const app = express();
app.use(express.json());

// Uncomment these lines to enable verbose debugging of requests and responses
app.use(require('./middleware/logger'));

const manifest = {
    app_id: 'node-example',
    display_name: "I'm an App!",
    homepage_url: 'https://github.com/mattermost/mattermost-plugin-apps/dev',
    app_type: 'http',
    icon: 'icon.png',
    root_url: `http://${host}:${port}`,
    requested_permissions: [
        'act_as_bot',
        'act_as_user',
    ],
    requested_locations: [
        '/channel_header',
        '/command',
    ],
};

const forms = require('./forms');
const form = forms.commandForm;

const channelHeaderBindings = {
    location: '/channel_header',
    bindings: [
        {
            location: 'send-button',
            icon: 'icon.png',
            label: 'Upload Text File',
            submit: {
                path: '/command/submit',
            },
        },
    ],
};

const commandBindings = {
    location: '/command',
    bindings: [
        {
            icon: 'icon.png',
            label: 'node-example',
            description: 'Example App written with Node.js',
            hint: '[send]',
            bindings: [
                {
                    location: 'send',
                    label: 'send',
                    form,
                },
            ],
        },
    ],
};

// Serve icon.png and others from the static folder
app.use('/static', express.static('./static'));

app.get('/manifest.json', (req, res) => {
    res.json(manifest);
});

app.get('/', (req, res) => {
    res.json(manifest);
});

app.post('/bindings', (req, res) => {
    const callResponse = {
        type: 'ok',
        data: [
            channelHeaderBindings,
            commandBindings,
        ],
    };

    res.json(callResponse);
});

forms.init(app);

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
